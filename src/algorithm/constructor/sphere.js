import { MetaMesh } from "../../data/metamesh";
import { vec3 } from "gl-matrix";

const ZERO = vec3.create();

function signedVolume(a,b,c,d) {
    return (1.0/6.0) * vec3.dot(vec3.cross(vec3.create(),vec3.sub(vec3.create(),b,a),vec3.sub(vec3.create(),c,a)),vec3.sub(vec3.create(),d,a));
}

function vectorIntersects(vertices, vector) {
    //vector = vec3.multiply(vec3.create(),vec3.normalize(vec3.create(), vector),vec3.fromValues(100,100,100));
    const A = vertices[0], B = vertices[1], C = vertices[2];

    let sV = signedVolume(vector,ZERO,A,B)>=0;
    return (signedVolume(vector,A,B,C)>=0 != signedVolume(ZERO,A,B,C)>=0) && 
        (sV == signedVolume(vector,ZERO,B,C)>=0 && sV == signedVolume(vector,ZERO,C,A)>=0)
}

function pointIntersection(vertices, vector) {
    const N = vec3.cross(vec3.create(),
        vec3.sub(vec3.create(),vertices[1],vertices[0]),
        vec3.sub(vec3.create(),vertices[2],vertices[0])
    );
    const T = - vec3.dot(vec3.sub(vec3.create(),ZERO,vertices[0]),N) / vec3.dot(vec3.sub(vec3.create(),vector,ZERO),N);  
    
    return vec3.add(vec3.create(),ZERO,vec3.mul(vec3.create(),vec3.sub(vec3.create(),vector,ZERO),vec3.fromValues(T,T,T)));
    /*
    const A = vertices[0];
    // Find normal vector of the plane
    let v1 = vec3.sub(vec3.create(),vertices[1],A); // p2.sub(p1);
    let v2 = vec3.sub(vec3.create(),vertices[2],A); //p3.sub(p1);
    let n = vec3.normalize(vec3.create(),vec3.cross(vec3.create(),v1,v2)); // v1.cross(v2).normalize();

    // Project point onto the plane
    let d = vec3.dot(n,A); // n.dot(p1);
    let t = (d - vec3.dot(n,vector)) / vec3.dot(n,n); // (d - n.dot(vertex)) / n.dot(n);
    
    return vec3.add(vec3.create(),vector, vec3.mul(vec3.create(),n,vec3.fromValues(t,t,t))); // vertex.add(n.mul(t));
    */
}

// Barycentric coordinates of point p in triangle abc
function barycentric(p, vertices) {
    let v0 = vec3.sub(vec3.create(),vertices[1],vertices[0]); //b.sub(a);
    let v1 = vec3.sub(vec3.create(),vertices[2],vertices[0]); //c.sub(a);
    let v2 = vec3.sub(vec3.create(),p,vertices[0]); //p.sub(a);
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
            vec3.mul(vec3.create(),f1[0],vec3.fromValues(u,u,u)),
            vec3.mul(vec3.create(),f1[1],vec3.fromValues(v,v,v))),
        vec3.mul(vec3.create(),f1[2],vec3.fromValues(w,w,w))); // d.mul(u).add(e.mul(v)).add(f.mul(w));
}

/**
 * PRE: meshes need to be parametrized first
 */
export function topology_merging(...meshes) {
    const metamesh = new MetaMesh(meshes);

    for(const mesh of meshes) {
        // Genero metavertices
        let metavertices = mesh.vertices.map(vertex => {
            const parametrization = vertex.parametrization;
            
            let face = metamesh.faces.find(face => vectorIntersects(face.vertices.map(v => v.position), parametrization));
            let directions = [];
            if (face !== undefined) {
                const vertices = face.vertices;
                const n_directions = vertices[0].directions.length;
                const positions = vertices.map(v => v.position);

                let point = pointIntersection(positions, parametrization);
                for(let d=0; d<n_directions; ++d) {
                    let d_point = mapPoint(point, positions, [
                        vec3.add(vec3.create(),vertices[0].position,vertices[0].directions[d]),
                        vec3.add(vec3.create(),vertices[1].position,vertices[1].directions[d]),
                        vec3.add(vec3.create(),vertices[2].position,vertices[2].directions[d])
                    ]);
                    directions.push(vec3.sub(vec3.create(),d_point,parametrization));
                }
            }
            return {
                position: parametrization,
                directions: [
                    ...directions,
                    vec3.sub(vec3.create(),vertex.position,parametrization)
                ]
            };
        });
        // Genero metacaras
        // JS optimization

        let metafaces = mesh.faces.map(face => {
            const parametrization = face.parametrization;

            let vertices = face.vertices.map(vertex => metavertices[mesh.vertices.indexOf(vertex)]);
            let directions = [];
            const n_directions = vertices[0].directions.length-1;
            for(let d=0; d<n_directions; ++d) {
                let normal = vec3.create(); 
                vec3.add(normal, vertices[0].directions[d], vertices[1].directions[d]); 
                vec3.add(normal, normal, vertices[2].directions[d]);
                
                directions.push(vec3.sub(normal,
                    vec3.normalize(normal,vec3.negate(normal,vec3.div(normal,normal,vec3.fromValues(3,3,3)))),
                    parametrization
                ));
            }
            return {
                vertices: vertices,
                normal: parametrization, 
                directions: [
                    ...directions, // TODO: Could be improved
                    vec3.sub(vec3.create(),face.normal,parametrization)
                ]
            }
        });
        // Adapto vertices
        metamesh.vertices.forEach(vertex => {
            let face = mesh.faces.find(face => vectorIntersects(face.vertices.map(v => v.parametrization), vertex.position));
            if (face === undefined) throw Error("No se ha parametrizado correctamente la malla");
            const vertices = face.vertices.map(v => v.parametrization);
            let point = pointIntersection(vertices, vertex.position);

            let d_point = mapPoint(point,vertices, [
                face.vertices[0].position,
                face.vertices[1].position,
                face.vertices[2].position,
            ]);
            vertex.directions.push(vec3.sub(vec3.create(),d_point,vertex.position));
        });
        // Adapto caras
        metamesh.faces.forEach(face => {
            const vertices = face.vertices;
            const d = vertices[0].directions.length-1;

            let normal = vec3.create(); 
            vec3.add(normal, vertices[0].directions[d], vertices[1].directions[d]); 
            vec3.add(normal, normal, vertices[2].directions[d]);

            face.directions.push(vec3.sub(normal,
                vec3.normalize(normal,vec3.negate(normal,vec3.div(normal,normal,vec3.fromValues(3,3,3)))),
                face.normal
            ));
        });
        // Merge all
        if (meshes.indexOf(mesh)+1 == meshes.length) {
            metamesh.vertices = metavertices;
            metamesh.faces = metafaces;
            return metamesh;
        }
        metamesh.vertices = metamesh.vertices.concat(metavertices);
        metamesh.faces = metamesh.faces.concat(metafaces);
        
    }

    return metamesh;
}