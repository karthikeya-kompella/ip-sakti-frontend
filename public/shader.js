const FS=`precision highp float;uniform float u_time,u_k,u_s;uniform vec2 u_resolution,u_mouse;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec2 v){const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;m*=1.79284291400159-.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);}
float fbm(vec2 p){float t=0.,a=.5;for(int i=0;i<4;i++){t+=a*snoise(p);p*=2.08;a*=.5;}return t;}
void main(){vec2 uv=gl_FragCoord.xy/u_resolution;float mn=min(u_resolution.x,u_resolution.y);vec2 p=(gl_FragCoord.xy*2.-u_resolution)/mn;float t=u_time*.18;
vec2 m=(u_mouse*2.-u_resolution)/mn;float mi=smoothstep(.85,0.,length(p-m));vec2 md=(p-m)*mi*.35;
vec2 q=vec2(fbm(p+vec2(t*.25,t*.12)-md*.5),fbm(p+vec2(4.1,2.7)+md*.3));
vec2 r=vec2(fbm(p+1.7*q+vec2(1.7,9.2)+.14*t),fbm(p+1.5*q+vec2(8.3,2.8)+.11*t));
float f=fbm(p+1.9*r+mi*.2);
vec3 col=mix(vec3(.008,.018,.014),vec3(.02,.045,.035),uv.y*.8+.2);
vec3 g=mix(vec3(.04,.45,.28),vec3(0.,.88,.52),r.x*.8+.2)*smoothstep(-.25,.75,f)*.55;
g+=vec3(.35,1.,.72)*pow(clamp(1.-abs(f-.22),0.,1.),3.)*.45;
g+=vec3(0.,.88,.52)*pow(mi,1.8)*.4+vec3(.35,1.,.72)*pow(mi,3.5)*.35;
col+=g*u_k;col=mix(vec3(dot(col,vec3(.299,.587,.114))),col,u_s);col*=clamp(1.-length(uv-.5)*.58,.15,1.);gl_FragColor=vec4(col,1.);}`;
window.initShader=function(c,k=1,sat=1){const gl=c.getContext("webgl");if(!gl)return()=>{};
const sz=()=>{const d=Math.min(devicePixelRatio||1,1.5);c.width=c.clientWidth*d;c.height=c.clientHeight*d};sz();addEventListener("resize",sz);
const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,"attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}"));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
const a=gl.getAttribLocation(pr,"a");gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
const U=n=>gl.getUniformLocation(pr,n);let mx=c.width/2,my=c.height/2,on=true;
const mv=e=>{const r=c.getBoundingClientRect();mx=(e.clientX-r.left)/r.width*c.width;my=(1-(e.clientY-r.top)/r.height)*c.height};addEventListener("pointermove",mv);
const still=matchMedia("(prefers-reduced-motion:reduce)").matches;
const draw=t=>{if(!on)return;gl.viewport(0,0,c.width,c.height);gl.uniform1f(U("u_time"),t*.001);gl.uniform1f(U("u_k"),k);gl.uniform1f(U("u_s"),sat);gl.uniform2f(U("u_resolution"),c.width,c.height);gl.uniform2f(U("u_mouse"),mx,my);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);if(!still)requestAnimationFrame(draw)};draw(0);
return()=>{on=false;removeEventListener("pointermove",mv);removeEventListener("resize",sz)}};
