import * as render from "./render.js";
import {mat4} from "gl-matrix";

const shaderModule = render.device.createShaderModule({
    code: `
        struct TransformData {
            model: mat4x4f,
            view: mat4x4f,
            projection: mat4x4<f32>,
        }

        struct Fragment {
            @builtin(position) Position: vec4f,
            @location(0) Color: vec4f
        };

        @binding(0) @group(0) var<uniform> transformations: TransformData;

        @vertex
        fn vertexMain(@location(0) pos: vec3f, @location(1) normal : vec3f) -> Fragment {
            var output: Fragment;
            output.Position = transformations.projection * transformations.view * transformations.model * vec4f(pos, 1);
            output.Color = vec4f((normal+1)/2, 1);
            return output;
        }


        @fragment
        fn fragmentMain(@location(0) Color: vec4f) -> @location(0) vec4f {
            return Color;
        }
    `
});

const configuration = {
    device: render.device,
    format: render.canvasFormat,
    alphaMode: "premultiplied",
}

const VBOBufferLayout = {
    arrayStride: 24,
    attributes: [
        {
        format: "float32x3",
        offset: 0,
        shaderLocation: 0,
        },
        {
        format: "float32x3",
        offset: 12,
        shaderLocation: 1,
        },
    ],
};
/* Single mesh scene */

export class Scene {

    constructor(mesh, canvas) {
        this.mesh = mesh;
        this.canvas = canvas;
        this.context = canvas.getContext("webgpu");
        this.context.configure(configuration);
        
        this.generateVBO();
        this.generateUniforms();
        this.generateShaders();
    }

    generateVBO() {
        this.VBOBufferLayout = VBOBufferLayout;
        this.VBO = this.mesh.generateVBO();
        this.VBOBuffer = render.device.createBuffer({
            size: this.VBO.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        render.device.queue.writeBuffer(this.VBOBuffer, 0, this.VBO);
    }

    generateUniforms() {
        this.projection = mat4.create();
        this.view = mat4.create();
        this.model = mat4.create();

        mat4.perspective(this.projection, Math.PI/4, 1, 0.1, 10);
        mat4.lookAt(this.view, [0,0.75,1.5], [0,0,0], [0,1,0]);

        this.uniformBuffer = render.device.createBuffer({
            size: 64*3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.bindGroupLayout = render.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {}
                }
            ]
        });

        this.bindGroup = render.device.createBindGroup({
            layout: this.bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer
                    }
                }
            ]
        });
        
        this.pipelineLayout = render.device.createPipelineLayout({
            bindGroupLayouts: [this.bindGroupLayout]
        });

        
    };

    generateShaders() {
        this.shaderModule = shaderModule;

        this.renderPipeline = render.device.createRenderPipeline({
            layout: this.pipelineLayout,
            vertex: {
                module: this.shaderModule,
                entryPoint: "vertexMain",
                buffers: [this.VBOBufferLayout]
            },
            fragment: {
                module: this.shaderModule,
                entryPoint: "fragmentMain",
                targets: [{
                    format: render.canvasFormat
                }]
            },
            depthStencil: {
                format: "depth24plus",
                depthWriteEnabled: true,
                depthCompare: "less"
            }
        });
    }


    update() {
        render.device.queue.writeBuffer(this.uniformBuffer, 0, this.model);
        render.device.queue.writeBuffer(this.uniformBuffer, 64, this.view);
        render.device.queue.writeBuffer(this.uniformBuffer, 128, this.projection);

        mat4.rotate(this.model,this.model,0.005,[0,1,0]);
    };


};