//https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
//https://stackoverflow.com/questions/1496215/triangle-triangle-intersection-in-3d-space
//https://math.stackexchange.com/questions/58403/find-whether-two-triangles-intersect-or-not-in-3d
//https://www.geometrictools.com/Documentation/MethodOfSeparatingAxes.pdf

export class MetaMesh {

    vertices = [];
    faces = [];

    constructor(meshes) {
        this.vertex_size = 3+3+3*meshes.length*2;
        this.meshes = meshes;
    }

    generateVBO() {
        let vbo = [];
        // JS optimization
        const reduce = (list,direction) => list.concat(Array.from(direction));

        this.faces.forEach(face => {
            const vertices = face.vertices;
            const directions = face.directions.reduce(reduce,[]);
            const normal = Array.from(face.normal);
            vbo = vbo.concat(
                Array.from(vertices[0].position),...vertices[0].directions.reduce(reduce,[]),
                normal, ...directions,
                Array.from(vertices[1].position),...vertices[1].directions.reduce(reduce,[]),
                normal, ...directions,
                Array.from(vertices[2].position),...vertices[2].directions.reduce(reduce,[]),
                normal, ...directions
            );
        });
        return new Float32Array(vbo);
    }


}