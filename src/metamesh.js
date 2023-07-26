import {vec3} from "gl-matrix";


class MetaVertex {

    constructor(vertex, directions) {
        this.vertex = vertex;
        this.directions = directions;
    }
}


class MetaFace {

    constructor() {

    }
}


export class MetaMesh {

    vertices = [];
    faces = [];
    meshes = [];
    vertex_size;

    constructor(meshes) {
        this.vertex_size = 3+3+3*meshes.length*2;
        this.meshes = meshes;
        let spheres = meshes.map(mesh => mesh.spheralize());
        // creo las supervertex
        for(let i=0; i<meshes[0].vertices.length; ++i) {
            this.vertices.push({ 
                vertex: spheres[0].vertices[i], 
                directions: [vec3.sub(vec3.create(),meshes[0].vertices[i],spheres[0].vertices[i])]
            })
        }
        spheres[0].faces.forEach(face => {
            let indexA = spheres[0].vertices.indexOf(face.a);
            let indexB = spheres[0].vertices.indexOf(face.b);
            let indexC = spheres[0].vertices.indexOf(face.c);
            let f = this.meshes[0].faces.find(f => {
                let set = new Set([indexA, indexB, indexC]);
                set.add(meshes[0].vertices.indexOf(f.a));
                set.add(meshes[0].vertices.indexOf(f.b));
                set.add(meshes[0].vertices.indexOf(f.c));

                return set.size==3;
            })

            this.faces.push({
                a: this.vertices[indexA],
                b: this.vertices[indexB],
                c: this.vertices[indexC],
                normal: { base: face.normal, directions: [vec3.sub(vec3.create(),f.normal,face.normal)] }
            });
        });
        // linkeo las faces con las supervertex
        for(let i = 1; i<meshes.length; ++i) {
            aux_vertices = [];
            aux_faces = [];
            // añado los supervertices

            //
            meshes[i].faces.forEach(face => {
                // Encuentro las caras que conflictean

                // Resuelvo el conflicto con las nuevas caras

                // Añado valor a los vertices de estas nuevas caras

                // Elimino las caras que conflictean de ambas mallas

                // Añado las OR en aux, y las AND al grupo general
            });
            // remplazo las caras por las aux, y añado los vertices aux a los otros vertices
        }

    }

    generateVBO() {
        let vbo = [];
        this.faces.forEach(face => {
            vbo = vbo.concat(
                Array.from(face.a.vertex),face.a.directions.reduce((prev,curr) => prev.concat(curr[0],curr[1],curr[2]),[]),
                Array.from(face.normal.base),face.normal.directions.reduce((prev,curr) => prev.concat(curr[0],curr[1],curr[2]),[]),
                Array.from(face.b.vertex),face.b.directions.reduce((prev,curr) => prev.concat(curr[0],curr[1],curr[2]),[]),
                Array.from(face.normal.base),face.normal.directions.reduce((prev,curr) => prev.concat(curr[0],curr[1],curr[2]),[]),
                Array.from(face.c.vertex),face.c.directions.reduce((prev,curr) => prev.concat(curr[0],curr[1],curr[2]),[]),
                Array.from(face.normal.base),face.normal.directions.reduce((prev,curr) => prev.concat(curr[0],curr[1],curr[2]),[])
                );
        });
        return new Float32Array(vbo);
    }


}