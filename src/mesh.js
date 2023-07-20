import {vec3} from "gl-matrix";

export class Face {

    constructor(a, b, c, normal) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.normal = normal;
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

    readFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
            // add code
        };
        reader.readAsText(file);
    }
};