(()=>{"use strict";var e,t,r,n,a={685:(e,t,r)=>{r.d(t,{Ib:()=>n,WT:()=>a});var n=1e-6,a="undefined"!=typeof Float32Array?Float32Array:Array;Math.random,Math.PI,Math.hypot||(Math.hypot=function(){for(var e=0,t=arguments.length;t--;)e+=arguments[t]*arguments[t];return Math.sqrt(e)})},975:(e,t,r)=>{r.d(t,{G3:()=>s,U1:()=>i,Ue:()=>a,zB:()=>o});var n=r(685);function a(){var e=new n.WT(16);return n.WT!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function i(e,t,r,a){var i,s,o,c,l,h,f,u,d,p,m,v,w,y,b,g,C,x,B,E,M,U,A,P,O=a[0],S=a[1],T=a[2],F=Math.hypot(O,S,T);return F<n.Ib?null:(O*=F=1/F,S*=F,T*=F,i=Math.sin(r),o=1-(s=Math.cos(r)),c=t[0],l=t[1],h=t[2],f=t[3],u=t[4],d=t[5],p=t[6],m=t[7],v=t[8],w=t[9],y=t[10],b=t[11],g=O*O*o+s,C=S*O*o+T*i,x=T*O*o-S*i,B=O*S*o-T*i,E=S*S*o+s,M=T*S*o+O*i,U=O*T*o+S*i,A=S*T*o-O*i,P=T*T*o+s,e[0]=c*g+u*C+v*x,e[1]=l*g+d*C+w*x,e[2]=h*g+p*C+y*x,e[3]=f*g+m*C+b*x,e[4]=c*B+u*E+v*M,e[5]=l*B+d*E+w*M,e[6]=h*B+p*E+y*M,e[7]=f*B+m*E+b*M,e[8]=c*U+u*A+v*P,e[9]=l*U+d*A+w*P,e[10]=h*U+p*A+y*P,e[11]=f*U+m*A+b*P,t!==e&&(e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e)}var s=function(e,t,r,n,a){var i,s=1/Math.tan(t/2);return e[0]=s/r,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=s,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,null!=a&&a!==1/0?(i=1/(n-a),e[10]=(a+n)*i,e[14]=2*a*n*i):(e[10]=-1,e[14]=-2*n),e};function o(e,t,r,a){var i,s,o,c,l,h,f,u,d,p,m=t[0],v=t[1],w=t[2],y=a[0],b=a[1],g=a[2],C=r[0],x=r[1],B=r[2];return Math.abs(m-C)<n.Ib&&Math.abs(v-x)<n.Ib&&Math.abs(w-B)<n.Ib?function(e){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}(e):(f=m-C,u=v-x,d=w-B,i=b*(d*=p=1/Math.hypot(f,u,d))-g*(u*=p),s=g*(f*=p)-y*d,o=y*u-b*f,(p=Math.hypot(i,s,o))?(i*=p=1/p,s*=p,o*=p):(i=0,s=0,o=0),c=u*o-d*s,l=d*i-f*o,h=f*s-u*i,(p=Math.hypot(c,l,h))?(c*=p=1/p,l*=p,h*=p):(c=0,l=0,h=0),e[0]=i,e[1]=c,e[2]=f,e[3]=0,e[4]=s,e[5]=l,e[6]=u,e[7]=0,e[8]=o,e[9]=h,e[10]=d,e[11]=0,e[12]=-(i*m+s*v+o*w),e[13]=-(c*m+l*v+h*w),e[14]=-(f*m+u*v+d*w),e[15]=1,e)}},398:(e,t,r)=>{r.d(t,{R5:()=>n,U2:()=>a});const n=["cube","bunny","cow","chicken","rat","newscene"];function a(e){return new Promise(((t,r)=>{var n=new XMLHttpRequest;n.open("GET","assets/"+e+".obj"),n.onreadystatechange=function(){4==this.readyState&&(200==this.status?t({name:e,data:this.responseText}):r("Error to load "+e+"."))},n.send()}))}Promise.all(n.map((e=>function(e){return new Promise(((t,r)=>{var n=new XMLHttpRequest;n.open("GET","assets/"+e+".obj"),n.onreadystatechange=function(){4==this.readyState&&(200==this.status?t({name:e,data:this.responseText}):r("Error to load "+e))},n.send()}))}(e)))).then((e=>{})).catch((e=>{console.log(e)}))},350:(e,t,r)=>{function n(e){var t=document.createElement("div");return t.innerHTML=e.trim(),t.firstChild}r.d(t,{T:()=>a,k:()=>i});const a=n('\n<div role="status" class="w-40 h-40 interactive-border flex justify-center items-center">\n    <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">\n        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>\n        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>\n    </svg>\n</div>\n'),i=n('\n<div role="status" class="w-60 h-60 interactive-border flex justify-center items-center">\n    <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">\n        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>\n        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>\n    </svg>\n</div>\n')},225:(e,t,r)=>{r.a(e,(async(e,t)=>{try{var n=r(28),a=r(398),i=r(691),s=r(461),o=r(350),c=e([n,s]);[n,s]=c.then?(await c)():c;const h=[];function f(){h.splice(h.indexOf(this.scene),1),this.remove()}async function u(){const e=document.getElementById("mesh-frame-grid"),t=document.getElementById("add-mesh-frame");let r=o.k.cloneNode(!0);e.insertBefore(r,t.nextSibling);let n=document.createElement("canvas");n.setAttribute("class","w-48 h-48 interactive-border"),n.onclick=f,document.getElementById("close-new-mesh").click();let a=new s.x(this.mesh,n);n.scene=a,h.push(a),e.insertBefore(n,r),r.remove()}var l;a.R5.forEach((async e=>{const t=document.getElementById("new-mesh-wrap");let r=o.T.cloneNode(!0);t.appendChild(r);let c=await a.U2(e),l=document.createElement("canvas");l.setAttribute("class","w-40 h-40 interactive-border"),l.onclick=u,l.mesh=i.K.fromString(c.data),n.il([new s.x(l.mesh,l)]),t.insertBefore(l,r),r.remove()})),document.getElementById("merge-button").onclick=()=>{let e=document.getElementById("main-scene");l=new s.x(h[0].mesh.spheralize(),e)},function e(){n.il(h),l&&n.il([l]),requestAnimationFrame(e)}(),t()}catch(d){t(d)}}))},691:(e,t,r)=>{r.d(t,{K:()=>m});var n=r(685);function a(){var e=new n.WT(3);return n.WT!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function i(e,t,r){var a=new n.WT(3);return a[0]=e,a[1]=t,a[2]=r,a}function s(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e}function o(e,t,r){return e[0]=t[0]+r[0],e[1]=t[1]+r[1],e[2]=t[2]+r[2],e}function c(e,t,r){return e[0]=t[0]*r[0],e[1]=t[1]*r[1],e[2]=t[2]*r[2],e}function l(e,t,r){return e[0]=t[0]/r[0],e[1]=t[1]/r[1],e[2]=t[2]/r[2],e}function h(e,t){var r=t[0]-e[0],n=t[1]-e[1],a=t[2]-e[2];return Math.hypot(r,n,a)}function f(e,t){var r=t[0],n=t[1],a=t[2],i=r*r+n*n+a*a;return i>0&&(i=1/Math.sqrt(i)),e[0]=t[0]*i,e[1]=t[1]*i,e[2]=t[2]*i,e}var u=function(e,t,r){return e[0]=t[0]-r[0],e[1]=t[1]-r[1],e[2]=t[2]-r[2],e},d=h;a();class p{constructor(e,t,r,n){this.a=e,this.b=t,this.c=r,void 0===n?(this.normal=a(),this.normalize()):this.normal=n}normalize(){let e=a();u(e,this.a,this.b);let t=a();var r,n,s,l,h,p,m,v,w;u(t,this.a,this.c),r=this.normal,s=t,l=(n=e)[0],h=n[1],p=n[2],m=s[0],v=s[1],w=s[2],r[0]=h*w-p*v,r[1]=p*m-l*w,r[2]=l*v-h*m;let y=a();c(y,this.normal,i(-1,-1,-1));let b=a(),g=a();o(b,this.a,this.normal),o(g,this.a,y),d(g,i(0,0,0))>d(b,i(0,0,0))&&o(this.normal,y,i(0,0,0)),f(this.normal,this.normal)}copy(){return new p(this.a,this.b,this.c,s(a(),this.normal))}contains(e){return this.a==e||this.b==e||this.c==e}static and(e,t){let r=[t.a,t.b,t.c];return new Set([e.a,e.b,e.c].filter((e=>r.includes(e))))}static or(e,t){return new Set([e.a,e.b,e.c,t.a,t.b,t.c])}}class m{vertices=[];faces=[];generateVBO(){let e=[];return this.faces.forEach((t=>{e=e.concat(Array.from(t.a),Array.from(t.normal),Array.from(t.b),Array.from(t.normal),Array.from(t.c),Array.from(t.normal))})),new Float32Array(e)}static fromString(e){let t=new m,r=e.split(/[\r\n]+/g),n=[];return r.forEach((e=>{let r=e.trim().split(" "),a=r[0];if("v"==a)t.vertices.push(i(parseFloat(r[1]),parseFloat(r[2]),parseFloat(r[3])));else if("vn"==a)n.push(i(parseFloat(r[1]),parseFloat(r[2]),parseFloat(r[3])));else if("f"==a){let e=r[1].split("/"),a=r[2].split("/"),i=r[3].split("/");t.faces.push(new p(t.vertices[parseInt(e[0])-1],t.vertices[parseInt(a[0])-1],t.vertices[parseInt(i[0])-1],n[parseInt(e[2])-1]))}})),t.normalize(),t}normalize(){let e=this.vertices.reduce(((e,t)=>{let r=a();return o(r,e,t),r}));l(e,e,i(this.vertices.length,this.vertices.length,this.vertices.length));let t=a();c(t,e,i(-1,-1,-1)),this.vertices.forEach((e=>{o(e,e,t)}));let r=i(0,0,0),n=this.vertices[0],s=Math.abs(h(n,r));this.vertices.forEach((e=>{let t=Math.abs(h(e,r));t>s&&(s=t,n=e)}));let f=a();l(f,i(.5,.5,.5),i(s,s,s)),this.vertices.forEach((e=>{c(e,e,f)}))}copy(){let e=new m;return e.vertices=this.vertices.map((e=>s(a(),e))),e.faces=this.faces.map((e=>e.copy())),e.faces.forEach((t=>{let r=this.vertices.indexOf(t.a),n=this.vertices.indexOf(t.b),a=this.vertices.indexOf(t.c);t.a=e.vertices[r],t.b=e.vertices[n],t.c=e.vertices[a]})),e}spheralize(){let e=this.copy(),t=[];for(;e.vertices.length>4;){let r=e.vertices.find((t=>3==e.faces.filter((e=>e.contains(t))).length));r||(r=e.vertices.find((t=>4==e.faces.filter((e=>e.contains(t))).length))),r||(r=e.vertices.find((t=>5==e.faces.filter((e=>e.contains(t))).length)));let n=e.faces.filter((e=>e.contains(r))),a=[],i=n.filter((()=>!0));if(n.forEach((t=>{e.faces.splice(e.faces.indexOf(t),1)})),5==n.length){let e=n.reduce(((e,t)=>new Set([t.a,t.b,t.c,...Array.from(e)])),new Set);e.delete(r),e=Array.from(e);let t=n.filter((t=>t.contains(e[0]))),i=n.filter((t=>!t.contains(e[0])));t.forEach((e=>{let t=i.find((t=>2==p.and(e,t).size)),n=p.or(t,e);n.delete(r),n=Array.from(n),a.push(new p(n[0],n[1],n[2])),i.splice(i.indexOf(t),1)}));let s=new Set([i[0].a,i[0].b,i[0].c]);s.delete(r),s=Array.from(s),a.push(new p(s[0],s[1],e[0]))}else if(4==n.length){let e=n.find((e=>1==p.and(e,n[0]).size)),t=n.filter((e=>2==p.and(e,n[0]).size)),i=p.or(n[0],t[0]);i.delete(r),i=Array.from(i),a.push(new p(i[0],i[1],i[2])),i=p.or(e,t[1]),i.delete(r),i=Array.from(i),a.push(new p(i[0],i[1],i[2]))}else{if(3!=n.length)throw new Error("Not a valid mesh.");{let e=new Set([n[0].a,n[0].b,n[0].c,n[1].a,n[1].b,n[1].c,n[2].a,n[2].b,n[2].c]);e.delete(r),e=Array.from(e),a.push(new p(e[0],e[1],e[2]))}}a.forEach((t=>e.faces.push(t))),t.push({vertex:r,oldFaces:i,newFaces:a});let s=e.vertices.indexOf(r);e.vertices.splice(s,1)}for(o(e.vertices[0],i(-1,-1,-1),i(0,0,0)),o(e.vertices[1],i(-1,1,1),i(0,0,0)),o(e.vertices[2],i(1,-1,1),i(0,0,0)),o(e.vertices[3],i(1,1,-1),i(0,0,0)),e.vertices.forEach((e=>{f(e,e),c(e,e,i(.5,.5,.5))})),e.faces.forEach((e=>{e.normalize()}));t.length>0;){let r=t.pop(),n=r.vertex,a=r.newFaces,s=r.oldFaces;a.forEach((t=>{e.faces.splice(e.faces.indexOf(t),1)})),s.forEach((t=>{e.faces.push(t)}));let l=new Set;s.forEach((e=>{l.add(e.a),l.add(e.b),l.add(e.c)})),l.delete(n),l=Array.from(l),l.reduce(((e,t)=>o(n,e,t)),i(0,0,0)),f(n,n),c(n,n,i(.5,.5,.5)),e.vertices.push(n),s.forEach((e=>{e.normalize()}))}return e}readFile(e){const t=new FileReader;t.onload=()=>{},t.readAsText(e)}}},28:(e,t,r)=>{r.a(e,(async(e,n)=>{try{if(r.d(t,{Uh:()=>i,il:()=>o,p5:()=>s}),!navigator.gpu)throw new Error("WebGPU not supported on this browser.");const a=await navigator.gpu.requestAdapter();if(!a)throw new Error("No appropriate GPUAdapter found.");const i=await a.requestDevice(),s=navigator.gpu.getPreferredCanvasFormat();function o(e){let t=i.createCommandEncoder();e.forEach((e=>{e.update();let r=i.createTexture({size:[e.canvas.width,e.canvas.height,1],format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),n=t.beginRenderPass({colorAttachments:[{view:e.context.getCurrentTexture().createView(),loadOp:"clear",clearValue:{r:0,g:0,b:0,a:0},storeOp:"store"}],depthStencilAttachment:{view:r.createView(),depthLoadValue:1,depthLoadOp:"clear",depthClearValue:1,depthStoreOp:"store"}});n.setPipeline(e.renderPipeline),n.setVertexBuffer(0,e.VBOBuffer),n.setBindGroup(0,e.bindGroup),n.draw(e.VBO.length/6),n.end()})),i.queue.submit([t.finish()])}n()}catch(c){n(c)}}),1)},461:(e,t,r)=>{r.a(e,(async(e,n)=>{try{r.d(t,{x:()=>c});var a=r(28),i=r(975),s=e([a]);const o=(a=(s.then?(await s)():s)[0]).Uh.createShaderModule({code:"\n        struct TransformData {\n            model: mat4x4f,\n            view: mat4x4f,\n            projection: mat4x4<f32>,\n        }\n\n        struct Fragment {\n            @builtin(position) Position: vec4f,\n            @location(0) Color: vec4f\n        };\n\n        @binding(0) @group(0) var<uniform> transformations: TransformData;\n\n        @vertex\n        fn vertexMain(@location(0) pos: vec3f, @location(1) normal : vec3f) -> Fragment {\n            var output: Fragment;\n            output.Position = transformations.projection * transformations.view * transformations.model * vec4f(pos, 1);\n            output.Color = vec4f((normal+1)/2, 1);\n            return output;\n        }\n\n\n        @fragment\n        fn fragmentMain(@location(0) Color: vec4f) -> @location(0) vec4f {\n            return Color;\n        }\n    "});class c{constructor(e,t){this.mesh=e,this.canvas=t,this.context=t.getContext("webgpu"),this.context.configure({device:a.Uh,format:a.p5,alphaMode:"premultiplied"}),this.VBO=e.generateVBO(),this.VBOBuffer=a.Uh.createBuffer({size:this.VBO.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),a.Uh.queue.writeBuffer(this.VBOBuffer,0,this.VBO),this.VBOBufferLayout={arrayStride:24,attributes:[{format:"float32x3",offset:0,shaderLocation:0},{format:"float32x3",offset:12,shaderLocation:1}]},this.shaderModule=o,this.projection=i.Ue(),i.G3(this.projection,Math.PI/4,1,.1,10),this.view=i.Ue(),i.zB(this.view,[0,.75,1.5],[0,0,0],[0,1,0]),this.model=i.Ue(),this.uniformBuffer=a.Uh.createBuffer({size:192,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.bindGroupLayout=a.Uh.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{}}]}),this.bindGroup=a.Uh.createBindGroup({layout:this.bindGroupLayout,entries:[{binding:0,resource:{buffer:this.uniformBuffer}}]}),this.pipelineLayout=a.Uh.createPipelineLayout({bindGroupLayouts:[this.bindGroupLayout]}),this.renderPipeline=a.Uh.createRenderPipeline({layout:this.pipelineLayout,vertex:{module:this.shaderModule,entryPoint:"vertexMain",buffers:[this.VBOBufferLayout]},fragment:{module:this.shaderModule,entryPoint:"fragmentMain",targets:[{format:a.p5}]},depthStencil:{format:"depth24plus",depthWriteEnabled:!0,depthCompare:"less"}})}update(){a.Uh.queue.writeBuffer(this.uniformBuffer,0,this.model),a.Uh.queue.writeBuffer(this.uniformBuffer,64,this.view),a.Uh.queue.writeBuffer(this.uniformBuffer,128,this.projection),i.U1(this.model,this.model,.005,[0,1,0])}}n()}catch(e){n(e)}}))}},i={};function s(e){var t=i[e];if(void 0!==t)return t.exports;var r=i[e]={exports:{}};return a[e](r,r.exports,s),r.exports}e="function"==typeof Symbol?Symbol("webpack queues"):"__webpack_queues__",t="function"==typeof Symbol?Symbol("webpack exports"):"__webpack_exports__",r="function"==typeof Symbol?Symbol("webpack error"):"__webpack_error__",n=e=>{e&&e.d<1&&(e.d=1,e.forEach((e=>e.r--)),e.forEach((e=>e.r--?e.r++:e())))},s.a=(a,i,s)=>{var o;s&&((o=[]).d=-1);var c,l,h,f=new Set,u=a.exports,d=new Promise(((e,t)=>{h=t,l=e}));d[t]=u,d[e]=e=>(o&&e(o),f.forEach(e),d.catch((e=>{}))),a.exports=d,i((a=>{var i;c=(a=>a.map((a=>{if(null!==a&&"object"==typeof a){if(a[e])return a;if(a.then){var i=[];i.d=0,a.then((e=>{s[t]=e,n(i)}),(e=>{s[r]=e,n(i)}));var s={};return s[e]=e=>e(i),s}}var o={};return o[e]=e=>{},o[t]=a,o})))(a);var s=()=>c.map((e=>{if(e[r])throw e[r];return e[t]})),l=new Promise((t=>{(i=()=>t(s)).r=0;var r=e=>e!==o&&!f.has(e)&&(f.add(e),e&&!e.d&&(i.r++,e.push(i)));c.map((t=>t[e](r)))}));return i.r?l:s()}),(e=>(e?h(d[r]=e):l(u),n(o)))),o&&o.d<0&&(o.d=0)},s.d=(e,t)=>{for(var r in t)s.o(t,r)&&!s.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),s(225)})();