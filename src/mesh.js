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

    calculateAnglesAtVertex(vertex) {
        let vertices = [this.a, this.b, this.c].filter(v => v !== vertex);
        let v1 = vec3.sub(vec3.create(),vertices[0],vertex);
        let v2 = vec3.sub(vec3.create(),vertices[1],vertex);
        return vec3.angle(v1,v2);
        var dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]; // dot product
        var len1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]); // length of v1
        var len2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]); // length of v2
        var angle = Math.acos(dot / (len1 * len2)); // angle in radians
        return angle;
    }
    
    calculateArea() {
        let vertices = [this.a, this.b, this.c];
        const side1 = vec3.distance(vertices[0],vertices[1]); // Assuming a distanceTo() method for vectors
        const side2 = vec3.distance(vertices[1],vertices[2]);
        const side3 = vec3.distance(vertices[2],vertices[0]);

        // Calculate the semiperimeter
        const s = (side1 + side2 + side3) / 2;

        // Calculate the area using Heron's formula
        const area = Math.sqrt(s * (s - side1) * (s - side2) * (s - side3));

        return area;
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

    // Function to get neighbors of a vertex in the mesh
    getNeighborsOfVertex(vertex) {
        // Implement logic to retrieve neighboring vertices of the given vertex
        let neighbors = new Set();
        // Iterate through all vertices in the mesh
        for (const face of this.faces) {
            if (face.contains(vertex)) {
                neighbors.add(face.a);
                neighbors.add(face.b);
                neighbors.add(face.c);
            }
        }
        neighbors.delete(vertex);
        return neighbors;
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

    steps() {
        let mesh = this.copy();

        const avgArea = mesh.faces.reduce((sum,f) => sum + f.calculateArea(), 0) / mesh.faces.length;
        //https://www.researchgate.net/publication/241164512_Method_of_Characterising_3D_Faces_Using_Gaussian_Curvature
        function computeGaussianCurvature(mesh, vertex) {
            // Find the triangles adjacent to the vertex
            let faces = mesh.faces.filter(faces => faces.contains(vertex))
            let vertices = Face.or(...faces);
            vertices.delete(vertex);
            vertices = [...vertices];
            let sumAngles = faces.reduce((res,face) => res + face.calculateAnglesAtVertex(vertex), 0)
            let sumArea = faces.reduce((res, f) => res + f.calculateArea(),0)

            return (2*Math.PI - sumAngles) / (avgArea + sumArea/3);
        }

        function computeBarycenterOfNeighbors(mesh, vertex) {
            
            let neighbors = mesh.getNeighborsOfVertex(vertex);
            let barycenter = vec3.create(); 
            let valence = neighbors.size;
            
            neighbors.forEach(v => vec3.add(barycenter,barycenter,v));
            vec3.divide(barycenter,barycenter,vec3.fromValues(valence,valence,valence));
          
            return barycenter;
            
        }

        const distThreshold = 0.001; // arbitrari value
        let maxIter = mesh.vertices.length * 5; // aribitrari value to stop high dense
        let done = false;
        while (maxIter != 0 && !done) {
            maxIter -= 1;
            done = true;            
            mesh.vertices.forEach(v => v.gaussianCurvature = computeGaussianCurvature(mesh, v))
            let pmaxs = [...mesh.vertices].sort((a,b) => {
                if (b.gaussianCurvature < 0 && a.gaussianCurvature > 0) return 1;
                if (b.gaussianCurvature > 0 && a.gaussianCurvature < 0) return -1;
                return Math.abs(b.gaussianCurvature) - Math.abs(a.gaussianCurvature);
            });
            if (pmaxs[0].gaussianCurvature >= 0) break;

            for(let pmax of pmaxs) {
                let newPmax = computeBarycenterOfNeighbors(mesh, pmax);
        
                if (vec3.distance(newPmax,pmax) > distThreshold) {

                    vec3.copy(pmax,newPmax);
                    done = false;
                    break;

                }
            }
            
        }
        // Expand all vertices to a sphere
        mesh.normalize();
        
        mesh.vertices.forEach(vertex => {
            vec3.normalize(vertex,vertex);
            vec3.multiply(vertex,vertex,vec3.fromValues(0.5,0.5,0.5));
        });
        
        return mesh;
    }

    readFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
            // TODO: add code
        };
        reader.readAsText(file);
    }
};