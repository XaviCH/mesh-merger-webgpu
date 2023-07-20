import * as render from "./render.js";
import * as assets from "./assets.js";
import {Mesh} from "./mesh.js";
import {Scene} from "./scene.js";
import * as html from "./html.js";
// CONSTANS

const scenes = []; // Meshes to be merged
const modal_scenes = []; // Meshes that can be selected on the modal

// FUNCTIONS

function eraseMe() {
    scenes.splice(scenes.indexOf(this.scene), 1);
    this.remove(); 
}

async function onclickLoadModalMesh() {
    const classAttribute = "w-60 h-60 interactive-border";
    const grid = document.getElementById("mesh-frame-grid");
    const add = document.getElementById("add-mesh-frame");

    let clone = html.spinner_main.cloneNode(true);
    grid.insertBefore(clone, add.nextSibling);
    let node = document.createElement("canvas");
    node.setAttribute("class",classAttribute);
    node.onclick=eraseMe;
    
    document.getElementById("close-new-mesh").click(); // close modal

    let scene = new Scene(this.mesh, node);
    node.scene = scene;
    scenes.push(scene);
    grid.insertBefore(node, clone);
    clone.remove();
}

function meshAssetOnclick() {
    const classAttribute = "w-60 h-60 interactive-border";
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

// RENDER LOOP

(function loop() {
    render.renderScenes(scenes);
    requestAnimationFrame(loop);
})();
