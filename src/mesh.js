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

    static or() {
        return new Set(Array.from(arguments).reduce((prev, curr) => prev.concat(curr.a, curr.b, curr.c),[]));
        //return new Set([f0.a, f0.b, f0.c, f1.a, f1.b, f1.c])
    }

}

export class Mesh {

    vertices = [];
    faces = [];
    vertex_size = 6;
    
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
        let unchecked = new Set(mesh.vertices);

        const find = (iterator) => { // find the lowest grade vertex 
            let faces = []; let vertex = null;

            for(let value of iterator.values()) {
                let list = [];
                for(let face of mesh.faces) {
                    if (face.contains(value)) {
                        list.push(face);
                        if (list.length > 5) break;
                    }
                }
                if (list.length == 3) return { vertex: value, faces: list };

                if (faces.length == 0 || list.length < faces.length) {
                    faces = list;
                    vertex = value;
                }
            }
            return { vertex: vertex, faces: faces }
        }

        while(mesh.faces.length > 4) { // TODO: bugged
            let object = find(unchecked);
            let vertex = object.vertex;
            let faces = object.faces;
            // Clear finded faces
            unchecked.delete(vertex);
            faces.forEach((face) => {
                let index = mesh.faces.indexOf(face);
                mesh.faces.splice(index,1);
            });
            // Add new faces
            let newFaces = [];
            if (faces.length == 3) {
                let vertices = Face.or(...faces); 
                vertices.delete(vertex);
                newFaces.push(new Face(...Array.from(vertices)));
            } else if (faces.length == 4) {
                let vertices = Face.or(...faces); 
                vertices.delete(vertex);

                let pivot = vertices.values().next().value;
                vertices.delete(pivot);

                let opposite = Array.from(vertices).find(vertex => 
                    faces.filter(face => face.contains(vertex) && !face.contains(pivot)).length == 2
                );
                vertices.delete(opposite);

                vertices = Array.from(vertices);
                newFaces.push(new Face(pivot, ...vertices));
                newFaces.push(new Face(opposite, ...vertices));

            } else if (faces.length == 5) { // there's a bug in here cow can't be morph
                let vertices = Face.or(...faces);
                vertices.delete(vertex);
                
                let pivot = vertices.values().next().value;
                vertices.delete(pivot);

                let opposites = Array.from(vertices).filter(vertex => 
                    faces.filter(face => face.contains(vertex) && !face.contains(pivot)).length == 2
                );
                opposites.forEach(opposite => vertices.delete(opposite));
                
                newFaces.push(new Face(pivot, ...opposites));

                Array.from(vertices).forEach(vertex => {
                    let opposite = opposites.find(opposite => 
                        faces.find(face => face.contains(vertex) && face.contains(opposite)) != undefined
                    );
                    newFaces.push(new Face(pivot, vertex, opposite));
                });

            } else throw new Error("Not a valid mesh.");

            newFaces.forEach((face) => mesh.faces.push(face));
            stack.push({vertex: vertex, oldFaces: faces, newFaces: newFaces});
        }

        // Force to be a regular tethahedra
        let vertices = Array.from(unchecked);
        vec3.add(vertices[0], vec3.fromValues(-1,-1,-1), vec3.fromValues(0,0,0));
        vec3.add(vertices[1], vec3.fromValues(-1,1,1), vec3.fromValues(0,0,0));
        vec3.add(vertices[2], vec3.fromValues(1,-1,1), vec3.fromValues(0,0,0));
        vec3.add(vertices[3], vec3.fromValues(1,1,-1), vec3.fromValues(0,0,0));
        
        vertices.forEach((vertex) => {
            vec3.normalize(vertex,vertex);
            vec3.multiply(vertex,vertex,vec3.fromValues(0.5,0.5,0.5));
        });
        mesh.faces.forEach((face) => {face.normalize()});
        // Add all the faces
        while(stack.length > 0) { // check the right method
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
            //mesh.vertices.push(vertex);
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