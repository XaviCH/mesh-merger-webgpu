// https://codelabs.developers.google.com/your-first-webgpu-app?hl=es-419#2
// https://www.w3.org/TR/webgpu/

import {mat4} from "gl-matrix";

if (!navigator.gpu) {
    throw new Error("WebGPU not supported on this browser.");
}
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
throw new Error("No appropriate GPUAdapter found.");
}

export const device = await adapter.requestDevice();
export const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

export function renderScenes(scenes) {
    let encoder = device.createCommandEncoder()

    scenes.forEach(scene => {
        scene.update();

        let depthTexture = device.createTexture({
            size: [scene.canvas.width, scene.canvas.height, 1],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });

        let pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: scene.context.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                storeOp: "store",
            }],
            depthStencilAttachment: {
                view: depthTexture.createView(),
                depthLoadValue: 1.0,
                depthLoadOp: 'clear',
                depthClearValue: 1.0,
                depthStoreOp: "store",
            }
        });
        
        pass.setPipeline(scene.renderPipeline);
        pass.setVertexBuffer(0, scene.VBOBuffer);
        pass.setBindGroup(0, scene.bindGroup);
        pass.draw(scene.VBO.length/scene.mesh.vertex_size); // 6 vertices
        pass.end();
        
    });
    device.queue.submit([encoder.finish()]);
}