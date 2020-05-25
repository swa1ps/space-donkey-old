import * as THREE from "three";

let bg: THREE.Mesh;
let u_time = { type: "f", value: 1.0 }

let bgUniforms = {
  u_time
}

function initBackground(scene: THREE.Scene) {
  const material = new THREE.ShaderMaterial({
    uniforms: bgUniforms,
    vertexShader: `
      varying vec2 st;

      void main() {
        st = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      #define EPSILON 0.02

      uniform float u_time;
      varying vec2 st;

      float random (in float x) {
        return fract(sin(x)*1e4);
    }
    
    float random (in vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
    }
    
    float pattern(vec2 st, vec2 v, float t) {
        vec2 p = floor(st+v);
        return step(t, random(1.+p*.01)+random(p.x)*0.33);
    }
    
    void main() {
        vec2 nst = st;
        vec2 grid = vec2(800.,800.);
        nst *= grid;
    
        vec2 ipos = floor(nst);  // integer
        vec2 fpos = fract(nst);  // fraction
    
        vec2 vel = vec2(u_time*0.7*max(grid.x,grid.y)); // time
        vel *= vec2(1.,0.0) * random(1.0+ipos.y); // direction
    
        // Assign a random value base on the integer coord
        vec2 offset = vec2(0.1,0.);
    
        vec3 color = vec3(0.);
        color.r = pattern(nst,vel,1.3);
        color.g = pattern(nst,vel,1.3);
        color.b = pattern(nst-offset,vel,1.3);
    
        // Margins
        color *= step(0.8,fpos.y);
    
        gl_FragColor = vec4(color,1.0);
    }
    
    `
  });
  var geometry = new THREE.PlaneBufferGeometry(400, 400, 1, 1);
  bg = new THREE.Mesh(geometry, material);
  bg.position.x = 0;
  bg.position.z = -65;
  scene.add(bg);
}

export function updateUniforms() {
  u_time.value += 0.005;
}

export function initScene(scene: THREE.Scene) {
  const light = new THREE.AmbientLight(0xffffff, 0.5);
  light.position.set(0, 30, 30);
  scene.add(light);

  const light1 = new THREE.PointLight(0xffffff, 0.5);
  light1.position.set(0, 30, 30);
  scene.add(light1);
  
  const light2 = new THREE.PointLight(0xffffff, 0.5);
  light2.position.set(0, -30, -30);
  
  scene.add(light2);
  initBackground(scene);
}