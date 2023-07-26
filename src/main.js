import * as render from "./render.js";
import * as assets from "./assets.js";
import {Mesh} from "./mesh.js";
import {Scene} from "./scene.js";
import * as html from "./html.js";
import { MetaMesh } from "./metamesh.js";
import { MetaScene } from "./metascene.js";
// CONSTANS

const scenes = []; // Meshes to be merged
const modal_scenes = []; // Meshes that can be selected on the modal

// FUNCTIONS

function eraseMe() {
    scenes.splice(scenes.indexOf(this.parentElement.parentElement.scene), 1);
    this.parentElement.parentElement.remove();
}

async function onclickLoadModalMesh() {
    const classAttribute = "w-48 h-48 interactive-border";
    const grid = document.getElementById("mesh-frame-grid");
    const add = document.getElementById("add-mesh-frame");

    let clone = html.spinner_main.cloneNode(true);
    grid.insertBefore(clone, add.nextSibling);

    let node = html.canvas.cloneNode(true);
    node.children[1].children[1].onclick=eraseMe;
    
    document.getElementById("close-new-mesh").click(); // close modal

    let scene = new Scene(this.mesh, node.children[0]);
    node.scene = scene;
    scenes.push(scene);
    grid.insertBefore(node, clone);
    clone.remove();
}

function meshAssetOnclick() {
    const classAttribute = "w-48 h-48 interactive-border";
    const grid = document.getElementById("mesh-frame-grid");
    const add = document.getElementById("add-mesh-frame");

    let new_spinner = spinner.cloneNode();

    grid.insertBefore(new_spinner, add.nextSibling);
    document.getElementById("close-new-mesh").click(); // close modal

    let node = document.createElement("canvas");
    node.setAttribute("class",classAttribute);
    node.onclick=eraseMe;
    let scene = new Scene(this.mesh, node);
    node.scene = scene;
    scenes.push(scene);
    grid.insertBefore(node, new_spinner);
    new_spinner.remove();
}

// RENDER

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
