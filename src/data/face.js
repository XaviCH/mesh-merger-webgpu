import { vec3 } from "gl-matrix";
import { Vertex } from "./vertex";

// JS optimization
const ZERO = vec3.create();

export class Face {

    vertices = [];

    constructor(a, b, c, normal) {
        this.vertices = [a,b,c];
        this.normal = normal;

        a.faces.push(this);
        b.faces.push(this);
        c.faces.push(this);
    }

    generateNormal() {
        // JS optimization
        const A = this.vertices[0].position; 
        const normal = vec3.create(); 
        
        let AB = vec3.sub(vec3.create(), A, this.vertices[1].position);
        let AC = vec3.sub(vec3.create(), A, this.vertices[2].position);
        vec3.cross(normal, AB, AC)

        let negate = vec3.mul(vec3.create(), normal, vec3.fromValues(-1,-1,-1));
        let v1 = vec3.add(vec3.create(), A, normal);
        let v2 = vec3.add(vec3.create(), A, negate);

        if (vec3.dist(v2,ZERO) > vec3.dist(v1,ZERO)) 
            vec3.add(normal,negate,ZERO);
        
        vec3.normalize(normal,normal);
        this.normal = normal;
        return normal;
    }

    copy() {
        return new Face(...this.vertices, vec3.copy(vec3.create(),this.normal));
    }

    contains(vertex) { return this.vertices.includes(vertex); }

    /*
    static and(f0, f1) {
        let list = f1.vertices;
        return new Set([f0.vertices].filter((v) => list.includes(v)));
    }*/

    static and(...faces) {
        return new Set(faces[0].vertices.filter(vertex => faces.filter(f => f.contains(vertex)).length == faces.length))
    }

    static or(...faces) {
        return new Set(Array.from(faces).reduce((prev, curr) => prev.concat(curr.vertices),[]));
    }

}