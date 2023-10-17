import { Mesh } from "../../data/mesh";
import { Vertex } from "../../data/vertex";
import { Face } from "../../data/face";
import { vec3,  } from "gl-matrix";

// https://www.cs.ubc.ca/~sheffa/papers/SigCDV.pdf
// https://www.academia.edu/14778022/Polyhedron_realization_for_shape_transformation
// PROMISE it 
const ZERO = vec3.create();

function generateNormal(face) {
    // JS optimization
    const A = face.vertices[0].parametrization; 
    const normal = vec3.create(); 
    
    let AB = vec3.sub(vec3.create(), A, face.vertices[1].parametrization);
    let AC = vec3.sub(vec3.create(), A, face.vertices[2].parametrization);
    vec3.cross(normal, AB, AC)

    let negate = vec3.mul(vec3.create(), normal, vec3.fromValues(-1,-1,-1));
    let v1 = vec3.add(vec3.create(), A, normal);
    let v2 = vec3.add(vec3.create(), A, negate);

    if (vec3.dist(v2,ZERO) > vec3.dist(v1,ZERO)) 
        vec3.add(normal,negate,ZERO);

    vec3.normalize(normal,normal);
    face.parametrization = normal;
    return normal;
}

function normal(face) {
    const A = face.vertices[0].parametrization; 
    const normal = vec3.create(); 
    
    const AB = vec3.sub(vec3.create(), A, face.vertices[1].parametrization);
    const AC = vec3.sub(vec3.create(), A, face.vertices[2].parametrization);

    vec3.normalize(normal,vec3.cross(normal, AB, AC));
    if (normal[0]==0 && normal[1]==0 && normal[2]==0) throw new Error("Wrong normal");
    return normal;
}
// https://mathworld.wolfram.com/Plane-PlaneIntersection.html
function pointIntersection(f1,f2,f3) {
    const n1 = normal(f1);
    const n2 = normal(f2);
    const n3 = normal(f3);
    const det = vec3.dot(vec3.cross(vec3.create(),n1, n2 ),n3);
    if (det == 0) throw new Error("Paralel plains."); 
    const d1 = vec3.dot(vec3.create(), f1.vertices[0].parametrization,n1);
    const d2 = vec3.dot(vec3.create(), f2.vertices[0].parametrization,n2);
    const d3 = vec3.dot(vec3.create(), f3.vertices[0].parametrization,n3);

    const A = vec3.mul(vec3.create(),vec3.cross(vec3.create(),n2,n3), vec3.fromValues(d1,d1,d1));
    const B = vec3.mul(vec3.create(),vec3.cross(vec3.create(),n3,n1), vec3.fromValues(d2,d2,d2));
    const C = vec3.mul(vec3.create(),vec3.cross(vec3.create(),n1,n2), vec3.fromValues(d3,d3,d3));

    return vec3.div(vec3.create(),
        vec3.add(vec3.create(), vec3.add(vec3.create(), A, B),C),
        vec3.fromValues(det,det,det));
}

// https://gist.github.com/StagPoint/2eaa878f151555f9f96ae7190f80352e
function pointIntersection2(f1, f2, f3) {
    const EPSILON = 1e-12;
    const normal1 = normal(f1);
    const normal2 = normal(f2);
    const normal3 = normal(f3);
    const distance1 = -vec3.dot(normal1, f1.vertices[0].parametrization);
    const distance2 = -vec3.dot(normal2, f2.vertices[0].parametrization);
    const distance3 = -vec3.dot(normal3, f3.vertices[0].parametrization);
    const det = vec3.dot(vec3.cross( vec3.create() ,normal1, normal2 ), normal3 );
    if( Math.abs(det) < EPSILON ) throw new Error("No intersection point");
	const A = vec3.negate(vec3.create(),vec3.mul(vec3.create(),vec3.fromValues(distance1,distance1,distance1),vec3.cross(vec3.create(),normal2,normal3)));
	const B = vec3.mul(vec3.create(),vec3.fromValues(distance2,distance2,distance2),vec3.cross(vec3.create(),normal3,normal1));
	const C = vec3.mul(vec3.create(),vec3.fromValues(distance3,distance3,distance3),vec3.cross(vec3.create(),normal1,normal2));

    return vec3.div(vec3.create(),vec3.sub(vec3.create(),vec3.sub(vec3.create(),A,B),C),vec3.fromValues(det,det,det));
}

export function tetrahedron(_mesh) {
    let mesh = _mesh.copy();

    let stack = []; // store in order the removed vertices
    let unchecked = new Set(mesh.vertices);

    const next = () => { // find the lowest grade vertex
        let min_length = Infinity;
        let result = null;

        for(let vertex of unchecked.values()) {
            if (vertex.faces.length == 3) return vertex;

            if (vertex.faces.length < min_length) {
                min_length = vertex.faces.length;
                result = vertex;
            }
        }
        return result
    }

    while(unchecked.size > 4) { // TODO: bugged
        let vertex = next();
        unchecked.delete(vertex);
        // JS optimization
        const faces = vertex.faces;

        // Add new faces
        let newFaces = [];
        if (faces.length == 3) {
            newFaces.push(new Face(...Array.from(vertex.neighbors())));
        } else if (faces.length == 4) {
            let vertices = vertex.neighbors()

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
            let vertices = vertex.neighbors()
            
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

        // Disconnect vertices from the erased faces
        faces.forEach(face => face.vertices.forEach(v => { v.faces = v.faces.filter(f => f != face)}));
        // Add record of the deleted vertex
        stack.push({vertex: vertex, oldFaces: faces, newFaces: newFaces});
    }
    /*
    // Force to be a regular tethahedra
    const near = (vertices, point) => {
        let result = null;
        for(let vertex of vertices) {
            if (result === null || vec3.dist(vertex.position,point) < vec3.dist(result.position,point)) {
                result = vertex;
            }
        }
        return result;
    }

    // Set left vertex to a tethaedron
    const setNearVertex = (position) => {
        vec3.normalize(position,position);
        vec3.multiply(position,position,vec3.fromValues(0.5,0.5,0.5));
        let v = near(unchecked,position);
        unchecked.delete(v);
        v.parametrization = vec3.clone(position);
    }

    setNearVertex(vec3.fromValues(-1,-1,-1));
    setNearVertex(vec3.fromValues(-1,1,1));
    setNearVertex(vec3.fromValues(1,-1,1));
    setNearVertex(vec3.fromValues(1,1,-1));
    */
    let center = vec3.create();
    unchecked.forEach(vertex => vec3.add(center,center,vertex.position));
    vec3.div(center,center,vec3.fromValues(4,4,4));
    unchecked.forEach(vertex => {
        const parametrization = vec3.create();
        vertex.parametrization = vec3.div(parametrization,
            vec3.normalize(parametrization,vec3.sub(parametrization,vertex.position,center)),
            vec3.fromValues(2,2,2));
    });
    //mesh.faces.forEach((face) => {face.normalize()});
    // Add all the faces
    while(stack.length > 0) { // check the right method
        let item = stack.pop();

        let vertex = item.vertex;
        let newF = item.newFaces;
        let oldF = item.oldFaces;
        // remove new faces TODO faces could contain vertices not owned
        newF.forEach(face => face.vertices.forEach(v => { v.faces = v.faces.filter(f => f != face)}));
        // add old faces
        oldF.forEach(face => face.vertices.forEach(v => { v.faces.push(face) }));
        // update vertex
        let parametrization;
        if (oldF.length == 3) {
            parametrization = Array.from(vertex.neighbors()).reduce((parametrization, vertex) => 
                vec3.add(parametrization, parametrization, vertex.parametrization), 
                vec3.create());
        } else if (oldF.length == 4) {
            const edge = Array.from(Face.and(...newF));
            parametrization = vec3.div(vec3.create(),vec3.add(vec3.create(), edge[0].parametrization, edge[1].parametrization),vec3.fromValues(2,2,2));
        } else if (oldF.length == 5) {
            if (Face.and(...newF).size != 1) throw new Error("Face wrong.");
            const pivot = Face.and(...newF).values().next().value;
            let intersection;
            try {
                intersection = pointIntersection(...newF);
            } catch {
                intersection = pivot.parametrization;
            }
            parametrization = vec3.div(vec3.create(),vec3.add(vec3.create(), pivot.parametrization, intersection),vec3.fromValues(2,2,2));
        } else throw new Error("Not a valid mesh.");

        vec3.normalize(parametrization,parametrization);
        vec3.multiply(parametrization,parametrization,vec3.fromValues(0.5,0.5,0.5));
        vertex.parametrization = parametrization;
    }
    mesh.faces.forEach(generateNormal);
    return mesh;
}

export function gaussian_relaxation(_mesh) {
    let mesh = _mesh.copy();
    mesh.vertices.forEach(vertex => vertex.parametrization = vec3.clone(vertex.position));

    function angleAtVertex(faces,vertex) {
        let vertices = faces.vertices.filter(v => v !== vertex);
        let v1 = vec3.sub(vec3.create(),vertices[0].parametrization,vertex.parametrization);
        let v2 = vec3.sub(vec3.create(),vertices[1].parametrization,vertex.parametrization);
        return vec3.angle(v1,v2);
    }

    function area(face) {
        let vertices = face.vertices;
        
        return vec3.len(vec3.cross(vec3.create(),
            vec3.sub(vec3.create(),vertices[1].parametrization,vertices[0].parametrization),
            vec3.sub(vec3.create(),vertices[2].parametrization,vertices[0].parametrization)
        )) / 2;

    }

    let avgArea = mesh.faces.reduce((sum,f) => sum + area(f), 0) / mesh.faces.length;

    //https://www.researchgate.net/publication/241164512_Method_of_Characterising_3D_Faces_Using_Gaussian_Curvature
    function computeGaussianCurvature(vertex) {
        // Find the triangles adjacent to the vertex
        const faces = vertex.faces;

        let sumAngles = faces.reduce((res, face) => res + angleAtVertex(face, vertex), 0)
        let sumArea = faces.reduce((res, face) => res + area(face), 0)

        return (2*Math.PI - sumAngles) / (sumArea/3 + avgArea);
    }

    function computeBarycenterOfNeighbors(vertex) {
        const neighbors = vertex.neighbors();
        const valence = neighbors.size;
        
        let barycenter = vec3.create(); 

        neighbors.forEach(vertex => vec3.add(barycenter,barycenter,vertex.parametrization));
        vec3.divide(barycenter,barycenter,vec3.fromValues(valence,valence,valence));
      
        return barycenter;
    }


    let distThreshold = 1e-3; // arbitrari value
    let maxIter = mesh.vertices.length * 10; // aribitrari value to stop high dense

    mesh.vertices.forEach(vertex => vertex.gaussianCurvature = computeGaussianCurvature(vertex));
    
    while (maxIter--!=0) {

        let vertices = mesh.vertices.sort((a,b) => Math.abs(b.gaussianCurvature) - Math.abs(a.gaussianCurvature));
        let not_found = true;
        for(let vertex of vertices) {
            let barycenter = computeBarycenterOfNeighbors(vertex);
    
            if (vec3.distance(barycenter,vertex.parametrization) > distThreshold) {
                vec3.copy(vertex.parametrization,barycenter);
                avgArea = mesh.faces.reduce((sum,f) => sum + area(f), 0) / mesh.faces.length;
                vertex.gaussianCurvature = computeGaussianCurvature(vertex);
                vertex.neighbors().forEach(vertex => vertex.gaussianCurvature = computeGaussianCurvature(vertex));
                not_found = false;
                break;
            }
        }
        //if (not_found) distThreshold /= 2;

    }

    // Center the mesh
    const length = mesh.vertices.length;
    let centroid = mesh.vertices.reduce((add, vertex) => vec3.add(add,add,vertex.parametrization),vec3.create());
    vec3.div(centroid,centroid,vec3.fromValues(length,length,length));
    mesh.vertices.forEach(vertex => vec3.sub(vertex.parametrization,vertex.parametrization,centroid));

    /*
    // Normalize DEBUG purpose
    let distance = 0;
    mesh.vertices.forEach(v1 => mesh.vertices.forEach(v2 => {
        if (vec3.distance(v1.parametrization,v2.parametrization)> distance) {
            distance = vec3.distance(v1.parametrization,v2.parametrization);
        }
    }));
    const inverse = vec3.divide(vec3.create(),vec3.fromValues(0.5,0.5,0.5),vec3.fromValues(distance/2,distance/2,distance/2));
    mesh.vertices.forEach(vertex => vec3.mul(vertex.parametrization,vertex.parametrization,inverse))
    */

    // Displace into sphere
    mesh.vertices.forEach(vertex => {
        vec3.mul(vertex.parametrization,
            vec3.normalize(vertex.parametrization,vertex.parametrization),
            vec3.fromValues(0.5,0.5,0.5)
        );
    });
    
    mesh.faces.forEach(generateNormal);
    return mesh;
}