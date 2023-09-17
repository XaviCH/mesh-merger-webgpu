import { Face } from "./face";

export class Vertex {

    faces = [];

    constructor(position) {
        this.position = position;
    }

    copy() {
        return new Vertex(this.position);
    }

    neighbors() {
        let vertices = Face.or(...this.faces);
        vertices.delete(this);
        return vertices;
    }
} 