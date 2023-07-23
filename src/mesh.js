import {vec3} from "gl-matrix";

export class Face {

    constructor(a, b, c, normal) {
        this.a = a;
        this.b = b;
        this.c = c;
        if (normal === undefined) {
            this.normal = vec3.create();
            this.normalize();
        } else
            this.normal = normal;
    }

    normalize() {
        let AB = vec3.create();
        vec3.sub(AB, this.a, this.b);
        let AC = vec3.create();
        vec3.sub(AC, this.a, this.c);
        vec3.cross(this.normal, AB, AC);

        let negate = vec3.create();
        vec3.multiply(negate, this.normal, vec3.fromValues(-1,-1,-1));

        let v1 = vec3.create();
        let v2 = vec3.create();
        vec3.add(v1, this.a, this.normal);
        vec3.add(v2, this.a, negate);

        if (vec3.dist(v2,vec3.fromValues(0,0,0))> vec3.dist(v1,vec3.fromValues(0,0,0))) {
            vec3.add(this.normal,negate,vec3.fromValues(0,0,0));
        }

        vec3.normalize(this.normal,this.normal);
    }

    copy() {
        return new Face(this.a, this.b, this.c, vec3.copy(vec3.create(),this.normal));
    }

    contains(vertex) {
        return this.a == vertex || this.b == vertex || this.c == vertex;
    }

    static and(f0, f1) {
        let list = [f1.a, f1.b, f1.c];
        return new Set([f0.a, f0.b, f0.c].filter((v) => list.includes(v)));
    }

    static or(f0, f1) {
        return new Set([f0.a, f0.b, f0.c, f1.a, f1.b, f1.c])
    }

}

export class Mesh {

    vertices = [];
    faces = [];

    generateVBO() {
        let vbo = [];
        this.faces.forEach(face => {
            vbo = vbo.concat(
                Array.from(face.a),Array.from(face.normal),
                Array.from(face.b),Array.from(face.normal),
                Array.from(face.c),Array.from(face.normal)
                );
        });
        return new Float32Array(vbo);
    }

    static fromString(data) {
        let mesh = new Mesh();
        
        let lines = data.split(/[\r\n]+/g); // use a buffer better
        let normals = [];

        lines.forEach(line => {
            let items = line.trim().split(" ");
            let op = items[0];
            if (op == "v") { // reading a vertex line
                mesh.vertices.push(vec3.fromValues(parseFloat(items[1]), parseFloat(items[2]), parseFloat(items[3])));
            } else if (op == "vn") { // reading a normal line
                normals.push(vec3.fromValues(parseFloat(items[1]), parseFloat(items[2]), parseFloat(items[3])));
            } else if (op == "f") { // reading a face line
                let indexesA = items[1].split("/");
                let indexesB = items[2].split("/");
                let indexesC = items[3].split("/");
                mesh.faces.push(new Face(
                    mesh.vertices[parseInt(indexesA[0])-1],
                    mesh.vertices[parseInt(indexesB[0])-1],
                    mesh.vertices[parseInt(indexesC[0])-1],
                    normals[parseInt(indexesA[2])-1]
                ));
            }
        });

        mesh.normalize();
        return mesh;
    }

    normalize() {
        // translate vectors to center
        let centroid = this.vertices.reduce((a, b) => {
            let v = vec3.create();
            vec3.add(v,a,b);
            return v;
        });
        vec3.divide(centroid,centroid,vec3.fromValues(this.vertices.length,this.vertices.length,this.vertices.length));
        
        let n_centroid = vec3.create(); 
        vec3.multiply(n_centroid,centroid,vec3.fromValues(-1,-1,-1));
        
        this.vertices.forEach((vertex) => {
            vec3.add(vertex,vertex,n_centroid);
        })
        // scale vectors

        let zero = vec3.fromValues(0,0,0);
        let farest = this.vertices[0];
        let distance = Math.abs(vec3.distance(farest,zero));

        this.vertices.forEach((vertex) => {
            let aux_distance = Math.abs(vec3.distance(vertex,zero));
            if (aux_distance>distance) {
                distance = aux_distance;
                farest = vertex;
            }
        })

        let inverse = vec3.create();
        vec3.divide(inverse,vec3.fromValues(0.5,0.5,0.5),vec3.fromValues(distance,distance,distance));
        
        this.vertices.forEach((vertex) => {
            vec3.multiply(vertex,vertex,inverse);
        })

    }

    copy() {
        let mesh = new Mesh();
        mesh.vertices = this.vertices.map((v) => vec3.copy(vec3.create(), v));
        mesh.faces = this.faces.map((f) => f.copy());
        mesh.faces.forEach((face) => {
            let indexA = this.vertices.indexOf(face.a);
            let indexB = this.vertices.indexOf(face.b);
            let indexC = this.vertices.indexOf(face.c);

            face.a = mesh.vertices[indexA];
            face.b = mesh.vertices[indexB];
            face.c = mesh.vertices[indexC];
        })
        return mesh;
    }
    // https://www.cs.ubc.ca/~sheffa/papers/SigCDV.pdf
    // https://www.academia.edu/14778022/Polyhedron_realization_for_shape_transformation
    spheralize() {
        let mesh = this.copy();
        // extract vertices
        let stack = []; // store in order the removed vertices

        while (mesh.vertices.length > 4) {
            let vertex = mesh.vertices.find((vertex) => mesh.faces.filter((face) => face.contains(vertex)).length == 3);
            if (!vertex)
            vertex = mesh.vertices.find((vertex) => mesh.faces.filter((face) => face.contains(vertex)).length == 4);
            if (!vertex)
            vertex = mesh.vertices.find((vertex) => mesh.faces.filter((face) => face.contains(vertex)).length == 5);

            let faces = mesh.faces.filter((face) => face.contains(vertex));
            let nFaces = [];
            let oFaces = faces.filter(() => true);
            faces.forEach((face) => {mesh.faces.splice(mesh.faces.indexOf(face),1)});
            
            if (faces.length == 5) { // there's a bug in here // bunny can't be morph
                let vertices = faces.reduce((prev, curr) => new Set([...[curr.a,curr.b,curr.c],...Array.from(prev)]), new Set()); 
                vertices.delete(vertex); 
                vertices = Array.from(vertices);

                let nears = faces.filter(face => face.contains(vertices[0]));
                let not_nears = faces.filter(face => !face.contains(vertices[0]));

                nears.forEach(near => {
                    let adjancent = not_nears.find(face => Face.and(near,face).size == 2);
                    let v = Face.or(adjancent, near); v.delete(vertex); v = Array.from(v);
                    nFaces.push(new Face(v[0],v[1],v[2]));
                    not_nears.splice(not_nears.indexOf(adjancent),1);
                });

                let last = new Set([not_nears[0].a,not_nears[0].b,not_nears[0].c]);
                last.delete(vertex); last = Array.from(last);
                nFaces.push(new Face(last[0],last[1],vertices[0]));
                /*
                // two adjacent faces made a triangle
                let face = faces.find((f) => Face.and(faces[0], f).size == 2);
                let vertices = Face.or(faces[0], face); vertices.delete(vertex); vertices = Array.from(vertices);
                nFaces.push(new Face(vertices[0], vertices[1], vertices[2]));
                faces.splice(faces.indexOf(face),1); faces.splice(0,1);
                // find pivot to separate the other faces
                face = faces.find((f) => faces.reduce((prev, curr) => prev + Face.and(f,curr).size,0) == 7);
                faces.splice(faces.indexOf(face),1);
                let pivot = Face.and(face, faces[0]); pivot.delete(vertex); pivot = Array.from(pivot)[0];
                // face 2
                vertices = Face.or(faces[0], face); vertices.delete(vertex); vertices = Array.from(vertices);
                nFaces.push(new Face(vertices[0], vertices[1], vertices[2]));
                // face 3
                vertices = Face.or(faces[1], faces[0]); vertices.delete(pivot); vertices.delete(vertex); vertices = Array.from(vertices);
                nFaces.push(new Face(vertices[0], vertices[1], vertices[2]));
                */
            } else if (faces.length == 4) {
                let antagonist = faces.find((face) => Face.and(face, faces[0]).size == 1);
                let nears = faces.filter((face) => Face.and(face, faces[0]).size == 2);
                // face 1
                let vertices = Face.or(faces[0], nears[0]); 
                vertices.delete(vertex); 
                vertices = Array.from(vertices);
                nFaces.push(new Face(vertices[0], vertices[1], vertices[2]));
                // face 2
                vertices = Face.or(antagonist, nears[1]); 
                vertices.delete(vertex); 
                vertices = Array.from(vertices);
                nFaces.push(new Face(vertices[0], vertices[1], vertices[2]));
            } else if (faces.length == 3) {
                let vertices = new Set([faces[0].a, faces[0].b, faces[0].c, faces[1].a, faces[1].b, faces[1].c, faces[2].a, faces[2].b, faces[2].c]);
                vertices.delete(vertex); vertices = Array.from(vertices);
                nFaces.push(new Face(vertices[0], vertices[1], vertices[2]));
            } else throw new Error("Not a valid mesh.")

            nFaces.forEach((face) => mesh.faces.push(face));
            stack.push({vertex: vertex, oldFaces: oFaces, newFaces: nFaces});
            let index = mesh.vertices.indexOf(vertex);
            mesh.vertices.splice(index,1);
            //if (stop == 0) throw new Error("her");
        }

        // force regular shape
        vec3.add(mesh.vertices[0], vec3.fromValues(-1,-1,-1), vec3.fromValues(0,0,0));
        vec3.add(mesh.vertices[1], vec3.fromValues(-1,1,1), vec3.fromValues(0,0,0));
        vec3.add(mesh.vertices[2], vec3.fromValues(1,-1,1), vec3.fromValues(0,0,0));
        vec3.add(mesh.vertices[3], vec3.fromValues(1,1,-1), vec3.fromValues(0,0,0));
        
        mesh.vertices.forEach((vertex) => {
            vec3.normalize(vertex,vertex);
            vec3.multiply(vertex,vertex,vec3.fromValues(0.5,0.5,0.5));
        });
        mesh.faces.forEach((face) => {face.normalize()});

        while(stack.length > 0) {
            let item = stack.pop();

            let vertex = item.vertex;
            let newF = item.newFaces;
            let oldF = item.oldFaces;
            // remove new faces
            newF.forEach((face) => {mesh.faces.splice(mesh.faces.indexOf(face),1)});
            // add old faces
            oldF.forEach((face) => {mesh.faces.push(face)});
            // update vertex
            let vertices = new Set();
            oldF.forEach((face) => {
                vertices.add(face.a);
                vertices.add(face.b);
                vertices.add(face.c);
            });
            vertices.delete(vertex);
            vertices = Array.from(vertices);
            vertices.reduce((previous, current) => vec3.add(vertex, previous, current), vec3.fromValues(0,0,0));
            vec3.normalize(vertex,vertex);
            vec3.multiply(vertex,vertex,vec3.fromValues(0.5,0.5,0.5));
            mesh.vertices.push(vertex);
            oldF.forEach((face) => {face.normalize()});       
        }
        return mesh;
    }

    readFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
            // add code
        };
        reader.readAsText(file);
    }
};