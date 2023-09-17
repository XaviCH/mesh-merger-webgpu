import * as render from "./render.js";
import * as assets from "./assets.js";
import {Mesh} from "./mesh.js";
import {Scene} from "./scene.js";
import * as html from "./html.js";
import { MetaMesh } from "./metamesh.js";
import { MetaScene } from "./metascene.js";
// CONSTANS

const scenes = []; // Meshes to be merged

const ASSETS_MODAL = document.getElementById("new-mesh-wrap");
const SELECTED_MESHES = document.getElementById("mesh-frame-grid");
const ADD_MESH_BUTTON = document.getElementById("add-mesh-frame");
const closeModal = document.getElementById("close-new-mesh").click; // on document load

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
    
    new Promise((resolve, reject) => { // does not work as expected
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

// render assets to the modal
(async function load_modal_assets() {
    assets.names.forEach(async (name) => {
        const classAttribute = "w-40 h-40 interactive-border";

        let spinner = html.spinner_modal.cloneNode(true);
        ASSETS_MODAL.appendChild(spinner);
        console.log("1"+name);
        assets.getf(name).then(async (result) => {
            let canvas = document.createElement("canvas");
            canvas.setAttribute("class",classAttribute);
            canvas.onclick = onclickAsset

            canvas.mesh = Mesh.fromString(await result.text());

            render.renderScenes([new Scene(canvas.mesh, canvas)]);
            ASSETS_MODAL.insertBefore(canvas,spinner);
            spinner.remove();
        });
    })
})();
/*
assets.names.forEach(async (name) => { // renders the modal
    const modal = document.getElementById("new-mesh-wrap");
    const classAttribute = "w-40 h-40 interactive-border";

    let clone = html.spinner_modal.cloneNode(true);
    modal.appendChild(clone);

    let asset = await assets.get(name);

    let node = document.createElement("canvas");
    node.setAttribute("class",classAttribute);
    node.onclick = onclickLoadModalMesh
    node.mesh = Mesh.fromString(asset.data);
    
    render.renderScenes([new Scene(node.mesh, node)]);
    modal.insertBefore(node,clone);
    clone.remove();
});
*/
// EVENTS

var mainScene;

document.getElementById("merge-button").onclick = () => {
    let node = document.getElementById("main-scene");
    mainScene = new MetaScene(new MetaMesh(scenes.map(scene => scene.mesh)),node);
    //mainScene = new Scene(scenes[0].mesh.spheralize(),node);
}

// RENDER LOOP

(function loop() {
    render.renderScenes(scenes);
    
    if (mainScene) {
        for(let i=0; i<scenes.length; ++i){
            mainScene.scalars[i] = scenes[i].canvas.nextElementSibling.children[0].value/100;
        } 
        render.renderScenes([mainScene]);
    }
    requestAnimationFrame(loop);
})();
