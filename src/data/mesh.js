import { vec3 } from "gl-matrix";
import { Face } from "./face";
import { Vertex } from "./vertex";

export class Mesh {

    vertices = [];
    faces = [];
    vertex_size = 6;
    
    generateVBO() {
        let vbo = [];

        this.faces.forEach(face => {
            const normal = Array.from(face.normal);
            const vertices = face.vertices;
            vbo = vbo.concat(
                Array.from(vertices[0].position), normal,
                Array.from(vertices[1].position), normal,
                Array.from(vertices[2].position), normal,
            );
        });

        return new Float32Array(vbo);
    }

    // TODO optimize and do it as a promise
    static fromString(data) {
        let mesh = new Mesh();
        
        let lines = data.split(/[\r\n]+/g); // use a buffer better
        let normals = [];

        lines.forEach(line => {
            let items = line.trim().split(" ");
            let op = items[0];
            if (op == "v") { // reading a vertex line
                mesh.vertices.push(new Vertex(vec3.fromValues(parseFloat(items[1]), parseFloat(items[2]), parseFloat(items[3]))));
            } else if (op == "vn") { // reading a normal line
                normals.push(vec3.fromValues(parseFloat(items[1]), parseFloat(items[2]), parseFloat(items[3])));
            } else if (op == "f") { // reading a face line
                let indexesA = items[1].split("/");
                let indexesB = items[2].split("/");
                let indexesC = items[3].split("/");
                let indexN = parseInt(indexesA[2])-1;


                let face = new Face(
                    mesh.vertices[parseInt(indexesA[0])-1],
                    mesh.vertices[parseInt(indexesB[0])-1],
                    mesh.vertices[parseInt(indexesC[0])-1],
                    normals[indexN]
                )
                if (normals[indexN] === undefined) face.generateNormal();

                mesh.faces.push(face);

                if (items.length == 5) {
                    let face = new Face(
                        mesh.vertices[parseInt(items[4].split("/")[0])-1],
                        mesh.vertices[parseInt(indexesA[0])-1],
                        mesh.vertices[parseInt(indexesC[0])-1],
                        normals[indexN]
                    )
                    if (normals[indexN] === undefined) face.generateNormal();
    
                    mesh.faces.push(face);
                }

            }
        });

        mesh.normalize();
        return mesh;
    }

    normalize() {
        const length = this.vertices.length
        // Translate vectors to center
        let centroid = this.vertices.reduce((add, vertex) => vec3.add(add,add,vertex.position),vec3.create());
        vec3.div(centroid,centroid,vec3.fromValues(length,length,length));
        
        let n_centroid = vec3.mul(vec3.create(),centroid,vec3.fromValues(-1,-1,-1));
        
        this.vertices.forEach(vertex => vec3.add(vertex.position,vertex.position,n_centroid));

        // Scale vectors
        const ZERO = vec3.create();

        let farest = this.vertices[0].position;
        let distance = vec3.distance(farest,ZERO);

        this.vertices.forEach(vertex => {
            let aux_distance = vec3.distance(vertex.position,ZERO);
            if (aux_distance>distance) {
                farest = vertex.position;
                distance = aux_distance;
            }
        });

        let inverse = vec3.divide(vec3.create(),vec3.fromValues(0.5,0.5,0.5),vec3.fromValues(distance,distance,distance));
        
        this.vertices.forEach(vertex => vec3.mul(vertex.position,vertex.position,inverse))
    }

    copy() {
        let mesh = new Mesh();
        mesh.vertices = this.vertices.map(v => v.copy());
        
        const vertices = mesh.vertices;
        mesh.faces = this.faces.map(face => new Face(
                vertices[this.vertices.indexOf(face.vertices[0])],
                vertices[this.vertices.indexOf(face.vertices[1])],
                vertices[this.vertices.indexOf(face.vertices[2])],
                face.normal)
        );

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