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

    constructor(meshes) {

        this.spheres = meshes.map(mesh => mesh.spheralize());
        // creo las supervertex

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
        
    }

    generateShader() {

    }

}