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

      float circle(in vec2 _st, in float _radius, in vec2 pos){
        vec2 dist = _st-pos;
        return 1.-smoothstep(
          _radius-(_radius*0.01),
          _radius+(_radius*0.01),
          dot(dist,dist) * 4.0
        );
      }

      void main() {
        vec3 color = vec3(circle(
          st,
          0.00001,
          vec2(1.0 - mod(u_time,1.0), 0.5)
        ));

        gl_FragColor = vec4(color,1.0) + 
        vec4(
          pow(st.x, 4.4 + sin(u_time * 20.0) * 0.4), 
          pow(st.x, 6.0),
          pow(1.05 - st.x, 7.0),
          1.0
        );
      }
    `
  });
  var geometry = new THREE.PlaneBufferGeometry(400, 400, 1, 1);
  bg = new THREE.Mesh(geometry, material);
  bg.position.x = 0;
  bg.position.z = -65;
  console.log('bg', bg.position)
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