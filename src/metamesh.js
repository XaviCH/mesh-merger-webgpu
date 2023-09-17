import {vec3} from "gl-matrix";


class MetaVertex {

    constructor(vertex, directions) {
        this.vertex = vertex;
        this.directions = directions;
    }
}

//https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
//https://stackoverflow.com/questions/1496215/triangle-triangle-intersection-in-3d-space
//https://math.stackexchange.com/questions/58403/find-whether-two-triangles-intersect-or-not-in-3d
//https://www.geometrictools.com/Documentation/MethodOfSeparatingAxes.pdf
class MetaFace {

    constructor() {

    }
}

function pointInTriangle(face, vertex) {

    // Compute vectors
    let v02 = vec3.sub(vec3.create(),face.c,face.a); //v2.sub(v0);
    let v01 = vec3.sub(vec3.create(),face.b,face.a); //v1.sub(v0);
    let vp = vec3.sub(vec3.create(),vertex,face.a); // p.sub(v0);
  
    // Compute dot products
    let dot00 = vec3.dot(v02,v02); // v02.dot(v02);
    let dot01 = vec3.dot(v02,v01); // v02.dot(v01);
    let dot02 = vec3.dot(v02,vp); // v02.dot(vp);
    let dot11 = vec3.dot(v01,v01); // v01.dot(v01);
    let dot12 = vec3.dot(v01,vp); // v01.dot(vp);
  
    // Compute barycentric coordinates
    let invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    let s = (dot11 * dot02 - dot01 * dot12) * invDenom;
    let t = (dot00 * dot12 - dot01 * dot02) * invDenom;
  
    // Check if point is in triangle
    return (s >= 0) && (t >= 0) && (s + t <= 1);
}

function signedVolume(a,b,c,d) {
    return (1.0/6.0) * vec3.dot(vec3.cross(vec3.create(),vec3.sub(vec3.create(),b,a),vec3.sub(vec3.create(),c,a)),vec3.sub(vec3.create(),d,a));
}

// Find the intersection of vector v and triangle abc in 3D
function vectorTriangleIntersection(face, vertex) {
    let zero = vec3.fromValues(0,0,0); 
    let sV = signedVolume(vertex,zero,face.a,face.b)>=0;
    return (signedVolume(vertex,face.a,face.b,face.c)>=0 != signedVolume(zero,face.a,face.b,face.c)>=0) && 
        (sV == signedVolume(vertex,zero,face.b,face.c)>=0 && sV == signedVolume(vertex,zero,face.c,face.a)>=0)
}

function pointTriangleDistance(face, vertex) {
    // Find normal vector of the plane
    let v1 = vec3.sub(vec3.create(),face.b,face.a); // p2.sub(p1);
    let v2 = vec3.sub(vec3.create(),face.c,face.a); //p3.sub(p1);
    let n = vec3.normalize(vec3.create(),vec3.cross(vec3.create(),v1,v2)); // v1.cross(v2).normalize();
  
    // Project point onto the plane
    let d = vec3.dot(n,face.a); // n.dot(p1);
    let t = (d - vec3.dot(n,vertex)) / vec3.dot(n,n); // (d - n.dot(vertex)) / n.dot(n);
    let q = vec3.add(vec3.create(),vertex, vec3.mul(vec3.create(),n,vec3.fromValues(t,t,t))); // vertex.add(n.mul(t));
  
    // Check if projection is inside triangle
    let u = vec3.dot(v1,v1); //v1.dot(v1);
    let v = vec3.dot(v2,v2); //v2.dot(v2);
    let w = vec3.dot(v1,v2); //v1.dot(v2);
    let denom = u * v - w * w;
    let s = (v * vec3.dot(vec3.sub(vec3.create(),q,face.a),v1) - w * vec3.dot(vec3.sub(vec3.create(),q,face.a),v2)) / denom; // (v * q.sub(p1).dot(v1) - w * q.sub(p1).dot(v2)) / denom;
    let r = (u * vec3.dot(vec3.sub(vec3.create(),q,face.a),v2) - w * vec3.dot(vec3.sub(vec3.create(),q,face.a),v1)) / denom; // (u * q.sub(p1).dot(v2) - w * q.sub(p1).dot(v1)) / denom;
  
   
    return q;
    
}

// Barycentric coordinates of point p in triangle abc
function barycentric(p, face) {
    let v0 = vec3.sub(vec3.create(),face.b,face.a); //b.sub(a);
    let v1 = vec3.sub(vec3.create(),face.c,face.a); //c.sub(a);
    let v2 = vec3.sub(vec3.create(),p,face.a); //p.sub(a);
    let d00 = vec3.dot(v0,v0); //v0.dot(v0);
    let d01 = vec3.dot(v0,v1); //v0.dot(v1);
    let d11 = vec3.dot(v1,v1); //v1.dot(v1);
    let d20 = vec3.dot(v2,v0); //v2.dot(v0);
    let d21 = vec3.dot(v2,v1); //v2.dot(v1);
    let denom = d00 * d11 - d01 * d01;
    let v = (d11 * d20 - d01 * d21) / denom;
    let w = (d00 * d21 - d01 * d20) / denom;
    let u = 1 - v - w;
    return [u, v, w];
  }

// Map point p from triangle abc to triangle def with same barycentric coordinates
function mapPoint(p, f0, f1) {
    let uvw = barycentric(p, f0);
    let u = uvw[0];
    let v = uvw[1];
    let w = uvw[2];
    return vec3.add(vec3.create(),
        vec3.add(vec3.create(),
            vec3.mul(vec3.create(),f1.a,vec3.fromValues(u,u,u)),
            vec3.mul(vec3.create(),f1.b,vec3.fromValues(v,v,v))),
        vec3.mul(vec3.create(),f1.c,vec3.fromValues(w,w,w))); // d.mul(u).add(e.mul(v)).add(f.mul(w));
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
            let aux_vertices = [];
            let aux_faces = [];
            // añado los supervertices
            for(let j=0; j<meshes[i].vertices.length; ++j) {
                let face = this.faces.find(face => vectorTriangleIntersection({a: face.a.vertex, b: face.b.vertex, c: face.c.vertex}, spheres[i].vertices[j]));
                let v = pointTriangleDistance({a: face.a.vertex, b: face.b.vertex, c: face.c.vertex}, spheres[i].vertices[j]);
                let directions = [];
                for (let k=0; k<face.a.directions.length; ++k) {
                    let p = mapPoint(v,{a: face.a.vertex, b: face.b.vertex, c: face.c.vertex},{
                        a: vec3.add(vec3.create(),face.a.vertex,face.a.directions[k]),
                        b: vec3.add(vec3.create(),face.b.vertex,face.b.directions[k]),
                        c: vec3.add(vec3.create(),face.c.vertex,face.c.directions[k]),
                    });
                    directions.push(vec3.sub(vec3.create(),p,spheres[i].vertices[j]))
                }

                aux_vertices.push({ 
                    vertex: spheres[i].vertices[j], 
                    directions: [
                        ...directions,
                        vec3.sub(vec3.create(),meshes[i].vertices[j],spheres[i].vertices[j])
                    ],
                })
            }
            // creo las caras
            spheres[i].faces.forEach(face => {
                let indexA = spheres[i].vertices.indexOf(face.a);
                let indexB = spheres[i].vertices.indexOf(face.b);
                let indexC = spheres[i].vertices.indexOf(face.c);
                let f = this.meshes[i].faces.find(f => {
                    let set = new Set([indexA, indexB, indexC]);
                    set.add(meshes[i].vertices.indexOf(f.a));
                    set.add(meshes[i].vertices.indexOf(f.b));
                    set.add(meshes[i].vertices.indexOf(f.c));
    
                    return set.size==3;
                })
    
                aux_faces.push({
                    a: aux_vertices[indexA],
                    b: aux_vertices[indexB],
                    c: aux_vertices[indexC],
                    normal: { base: face.normal, directions: [
                        vec3.create(),
                        vec3.sub(vec3.create(),f.normal,face.normal)
                    ] }
                });
            });

            // añado las direcciones de la nueva malla
            this.vertices.forEach(vertex => {
                let face = spheres[i].faces.find(face => vectorTriangleIntersection(face, vertex.vertex));
                let indexA = spheres[i].vertices.indexOf(face.a);
                let indexB = spheres[i].vertices.indexOf(face.b);
                let indexC = spheres[i].vertices.indexOf(face.c);
                let f = this.meshes[i].faces.find(f => {
                    let set = new Set([indexA, indexB, indexC]);
                    set.add(meshes[i].vertices.indexOf(f.a));
                    set.add(meshes[i].vertices.indexOf(f.b));
                    set.add(meshes[i].vertices.indexOf(f.c));

                    return set.size==3;
                })


                let v = pointTriangleDistance(face, vertex.vertex);
                let p = mapPoint(v,face,f);
                vertex.directions.push(vec3.sub(vec3.create(),p,vertex.vertex))
            });

            this.faces.forEach(face => {
                face.normal.directions.push(vec3.create());
            });
            //
            /* TODO
            spheres[i].faces.forEach(face => {
                // Encuentro las caras que conflictean
                let intersects = this.faces.filter(f1 => 
                        pointInTriangle(f1, face.a) ||
                        pointInTriangle(f1, face.b) ||
                        pointInTriangle(f1, face.c) ||
                        pointInTriangle(face, f1.a) ||
                        pointInTriangle(face, f1.b) ||
                        pointInTriangle(face, f1.c)
                ); 
                // Resuelvo el conflicto con las nuevas caras
                if (intersects.length == 1) { // inner triangle
                    face.a
                }
                // Añado valor a los vertices de estas nuevas caras

                // Elimino las caras que conflictean de ambas mallas

                // Añado las OR en aux, y las AND al grupo general
            });
            */
            // remplazo las caras por las aux, y añado los vertices aux a los otros vertices
            this.vertices = this.vertices.concat(aux_vertices);
            this.faces = this.faces.concat(aux_faces);
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