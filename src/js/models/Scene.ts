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

      void main() {
        vec3 color = mix(
          vec3(smoothstep(0.9,1.4,st.x),0.061,0.370),
          vec3(
              pow(st.x,6.0),
              0.0,
              pow(st.x,5.0 + 4.0*abs(sin(u_time * 2.0)))
          ),
          0.7
      )
      - vec3(pow(st.y,2.0 + 6.0 * abs(-0.8 + sin(u_time * 1.5))),0.0,pow(st.y,13.0))
      - vec3(pow(1.0 - st.y,3.0 + 3.0 * abs(1.2 + sin(u_time * 1.5))),0.0,pow(1.0 - st.y,13.0));

      color = mix(color, vec3(0.2, 0.0, smoothstep(0.5,0.0,st.x)), 0.2);

        gl_FragColor = vec4(color,1.0);
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