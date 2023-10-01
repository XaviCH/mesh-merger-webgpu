import { render } from "./handler/render.js";
import { Mesh } from "./data/mesh.js";
import { Scene } from "./handler/scene.js";
import * as html from "./component/html.js";
import { MetaScene } from "./handler/metascene.js";
import { topology_merging } from "./algorithm/constructor/sphere.js";
import { gaussian_relaxation, tetrahedron } from "./algorithm/parametrization/sphere.js";
import { vec3 } from "gl-matrix";

// Constants
const assets = ["cube","cube_deformed","sphere","sphere_def","cow", "rat","wolf", "tiger"];

const ASSETS_MODAL = document.getElementById("new-mesh-wrap");
const SELECTED_MESHES = document.getElementById("mesh-frame-grid");
const ADD_MESH_BUTTON = document.getElementById("add-mesh-frame");

// Scenes

let scenes = []; // Meshes to be merged
let mainScene; // Mesh result
let SPHERE;
// FUNCTIONS

function eraseMe() {
    scenes.splice(scenes.indexOf(this.parentElement.parentElement.scene), 1);
    this.parentElement.parentElement.remove();
}

async function onclickAsset() {
    let spinner = html.spinner_main.cloneNode(true);
    SELECTED_MESHES.insertBefore(spinner, ADD_MESH_BUTTON.nextSibling);
    let canvas = html.canvas.cloneNode(true);
    canvas.children[1].children[1].onclick=eraseMe;
    
    new Promise((resolve) => { // does not work as expected
        setTimeout(() => resolve(new Scene(this.mesh, canvas.children[0])), 100);
    }).then(scene => {
        canvas.scene = scene;
        scenes.push(scene);
        SELECTED_MESHES.insertBefore(canvas, spinner);
        spinner.remove();
    });

    document.getElementById("close-new-mesh").click();
}

// RENDER

// Render assets to the modal

async function load_modal_assets() {
    assets.forEach(async (name) => {
        const classAttribute = "w-40 h-40 interactive-border";

        let spinner = html.spinner_modal.cloneNode(true);
        ASSETS_MODAL.appendChild(spinner);
        console.log("1"+name);
        fetch(`assets/${name}.obj`).then(async (result) => {
            let canvas = document.createElement("canvas");
            canvas.setAttribute("class",classAttribute);
            canvas.onclick = onclickAsset

            canvas.mesh = Mesh.fromString(await result.text());

            render(new Scene(canvas.mesh, canvas));
            ASSETS_MODAL.insertBefore(canvas,spinner);
            spinner.remove();
        });
    })
}

//

function setUpMergeButton() {
    const node = document.getElementById("main-scene");

    document.getElementById("merge-button").onclick = () => {
        //mainScene = new MetaScene(topology_merging(polyhedron(scenes[0].mesh),gaussian_relaxation(scenes[1].mesh)), node);
        mainScene = new MetaScene(topology_merging(...scenes.map(scene => gaussian_relaxation(scene.mesh))), node);
        //mainScene = new MetaScene(topology_merging(scenes.map(scene => scene.parametrization)), node);
    }
}

// Render loop

function loop() {
    render(...scenes);
    
    if (mainScene) {
        let total = scenes.reduce((add, scene) => add+Number(scene.canvas.nextElementSibling.children[0].value), 0);
        //if (total<100) total = 100;
        for(let i=0; i<scenes.length; ++i){
            if (total == 0) mainScene.scalars[i] = 0.0;
            else mainScene.scalars[i] = (Math.pow(Number(scenes[i].canvas.nextElementSibling.children[0].value),2)/total)/100;
        } 
        render(mainScene);
    }
    requestAnimationFrame(loop);
}

// Flow Execution

$(document).ready(async () => {

    load_modal_assets();
    setUpMergeButton();
    await fetch(`assets/dense_sphere.obj`).then(async (result) => {
        SPHERE = Mesh.fromString(await result.text());
        SPHERE.vertices.forEach(vertex => vertex.parametrization = vec3.clone(vertex.position));
        SPHERE.faces.forEach(face => face.parametrization = vec3.clone(face.normal));
    });

    loop();
})