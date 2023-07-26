import * as render from "./render.js";
import {mat4, vec3} from "gl-matrix";

/* Single mesh scene */

export class MetaScene {

    constructor(metamesh, canvas) {
        this.mesh = metamesh;
        this.canvas = canvas;
        this.context = canvas.getContext("webgpu");
        this.context.configure({
            device: render.device,
            format: render.canvasFormat,
            alphaMode: "premultiplied",
        });

        this.VBO = metamesh.generateVBO();
        this.VBOBuffer = render.device.createBuffer({
            size: this.VBO.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        render.device.queue.writeBuffer(this.VBOBuffer, 0, this.VBO);

        this.VBOBufferLayout = { // metamesh responsability
            arrayStride: 12+12+metamesh.meshes.length*3*4*2,
            attributes: [
                {
                format: "float32x3",
                offset: 0,
                shaderLocation: 0,
                },
                ...metamesh.meshes.map(mesh => {
                    return {
                        format: "float32x3",
                        offset: 12+metamesh.meshes.indexOf(mesh)*3*4,
                        shaderLocation: metamesh.meshes.indexOf(mesh)+1,
                    }
                }),
                {
                format: "float32x3",
                offset: 12+metamesh.meshes.length*3*4,
                shaderLocation: metamesh.meshes.length+1,
                },
                ...metamesh.meshes.map(mesh => {
                    return {
                        format: "float32x3",
                        offset: 12+metamesh.meshes.length*3*4+metamesh.meshes.indexOf(mesh)*3*4+12,
                        shaderLocation: metamesh.meshes.length+metamesh.meshes.indexOf(mesh)+2,
                    }
                }),
            ],
        };

        this.shaderModule = this.createShaderModule();

        this.projection = mat4.create();
        mat4.perspective(this.projection, Math.PI/4, 1, 0.1, 10);
        this.view = mat4.create();
        mat4.lookAt(this.view, [0,0.75,1.5], [0,0,0], [0,1,0]);
        this.model = mat4.create();
        this.scalars = new Float32Array(metamesh.meshes.map(_ => 0));

        this.uniformBuffer = render.device.createBuffer({
            size: 64*3+16, //4*this.scalars.length,
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
    };

    createShaderModule() {
        let scalars = this.mesh.meshes.map(mesh => {
            return `scalar${this.mesh.meshes.indexOf(mesh)}: f32`
        }).join(",");

        let directions = this.mesh.meshes.map(mesh => {
            let n = this.mesh.meshes.indexOf(mesh);
            return `@location(${n+1}) direction${n}: vec3f`
        }).join(",");

        let scalaredDirections = this.mesh.meshes.map(mesh => {
            let n = this.mesh.meshes.indexOf(mesh);
            return `direction${n}*transformations.scalar${n}`
        }).join("+");

        let normals = this.mesh.meshes.map(mesh => {
            let n = this.mesh.meshes.indexOf(mesh);
            return `@location(${this.mesh.meshes.length+n+2}) normal${n}: vec3f`
        }).join(",");

        let normalDirection = this.mesh.meshes.map(mesh => {
            let n = this.mesh.meshes.indexOf(mesh);
            return `normal${n}*transformations.scalar${n}`
        }).join("+");

        return render.device.createShaderModule({
            code: `
                struct TransformData {
                    model: mat4x4f,
                    view: mat4x4f,
                    projection: mat4x4<f32>,
                    ${scalars}
                }
        
                struct Fragment {
                    @builtin(position) Position: vec4f,
                    @location(0) Color: vec4f
                };
        
                @binding(0) @group(0) var<uniform> transformations: TransformData;
        
                @vertex
                fn vertexMain(@location(0) pos: vec3f, ${directions}, @location(${this.mesh.meshes.length+1}) normal : vec3f, ${normals}) -> Fragment {
                    var output: Fragment;
                    var finalPos: vec3f = pos + ${scalaredDirections};
                    output.Position = transformations.projection * transformations.view * transformations.model * vec4f(finalPos, 1);
                    var finalNormal: vec3f = normalize(normal + ${normalDirection});
                    output.Color = vec4f((finalNormal+1)/2, 1);
                    return output;
                }
        
        
                @fragment
                fn fragmentMain(@location(0) Color: vec4f) -> @location(0) vec4f {
                    return Color;
                }
            `
        });
    }

    update() {
        render.device.queue.writeBuffer(this.uniformBuffer, 0, this.model);
        render.device.queue.writeBuffer(this.uniformBuffer, 64, this.view);
        render.device.queue.writeBuffer(this.uniformBuffer, 128, this.projection);
        render.device.queue.writeBuffer(this.uniformBuffer, 192, new Float32Array(this.scalars));
        
        // añadir los porcentages
        mat4.rotate(this.model,this.model,0.005,[0,1,0]);
    };


};