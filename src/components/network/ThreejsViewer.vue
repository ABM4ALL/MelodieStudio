<template>
  <div>
    <canvas id="threejs-canvas"></canvas>
  </div>
</template>

<script lang="ts" setup>
import * as THREE from "three";
import { onMounted, defineProps } from "vue-demi";
import { ThreeJSManager } from "./threejsmgr";
const props = defineProps({
  width: { type: Number, default: 100 },
  height: { type: Number, default: 100 },
});

const insertGeometry = (scene: THREE.Scene) => {
  const geometry = new THREE.BoxGeometry(5, 5, 5);
  const patchGeometry = new THREE.BoxGeometry(1, 1, 0.1);
  const material3 = new THREE.MeshBasicMaterial({
    color: 0xff0000,
  });
  const material = new THREE.MeshBasicMaterial({
    color: "#00ff00",
  });
  const spotsGroup = new THREE.Group();

  const agentsGroup = new THREE.Group();
  for (let i = 0; i < props.height; i++) {
    for (let j = 0; j < props.width; j++) {
      const mesh3 = new THREE.Mesh(patchGeometry, material3); //网格模型对象Mesh
      mesh3.position.set(j, i, -0.1);
      mesh3.name = "spot-" + i;
      spotsGroup.add(mesh3);
    }
  }
  scene.add(spotsGroup);
  for (let i = 0; i < 1000; i++) {
    const mesh3 = new THREE.Mesh(geometry, material3); //网格模型对象Mesh
    mesh3.position.set(
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100
    );
    mesh3.name = i;
    mesh3.material = material;
    agentsGroup.add(mesh3);
  }
  scene.add(agentsGroup);
};

const updateTargetPosition = (
  scene
): { dx: number; dy: number; dz: number }[] => {
  console.log(scene.children);
  const speed: { dx: number; dy: number; dz: number }[] = [];
  const t0 = Date.now();
  for (let i = 0; i < 1000; i++) {
    const mesh3 = scene.getObjectByName(i); //网格模型对象Mesh
    speed.push({
      dx: (Math.random() * 100 - mesh3.position.x) / 20,
      dy: (Math.random() * 100 - mesh3.position.y) / 20,
      dz: (Math.random() * 100 - mesh3.position.z) / 20,
    });
  }
  const t1 = Date.now();
  console.log(t1 - t0);
  return speed;
};

const updatePosition = (scene, speed) => {
  const t0 = Date.now();
  for (let i = 0; i < 1000; i++) {
    const mesh3 = scene.children[1].getObjectByName(i); //网格模型对象Mesh
    // const worldPosition = new THREE.Vector3();
    const pos = mesh3.position;
    // console.log(pos.x, )
    mesh3.position.set(
      pos.x + speed[i].dx,
      pos.y + speed[i].dy,
      pos.z + speed[i].dz
    );
    mesh3.name = i;
  }
  const t1 = Date.now();
  console.log(t1 - t0);
};

let threeMgr: ThreeJSManager | null = null;
const initThree = () => {
//   const scene = new THREE.Scene();
//   scene.background = new THREE.Color("#eee");
  threeMgr = new ThreeJSManager("threejs-canvas", props.width, props.height);

//   const canvas = document.querySelector("#threejs-canvas");
//   const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
//   const devicePixelRatio = window.devicePixelRatio;
//   renderer.setPixelRatio(devicePixelRatio);
//   const camera = new THREE.PerspectiveCamera(
//     50,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     1000
//   );
//   camera.position.set(50, 50, 500);
//   camera.lookAt(0, 0, 0);

//   const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
//   const points: THREE.Vector3 = [];
//   points.push(new THREE.Vector3(-10, 0, 0));
//   points.push(new THREE.Vector3(0, 10, 0));
//   points.push(new THREE.Vector3(10, 0, 0));

//   const geometry = new THREE.BufferGeometry().setFromPoints(points);
//   const line = new THREE.Line(geometry, material);
//   const targetPosition: number[][] = [];
//   let speed: { dx: number; dy: number; dz: number }[] = [];
//   //   scene.add(line);

//   insertGeometry(scene);

//   const controls = new OrbitControls(camera, renderer.domElement); //创建控件对象
//   //   controls.addEventListener("change", animate); //监听鼠标、键盘事件

//   window.setInterval(() => {
//     speed = updateTargetPosition(scene);
//     // updatePosition(scene);
//   }, 1000);

//   window.setInterval(() => {
//     // speed = updateTargetPosition(scene);
//     updatePosition(scene, speed);
//   }, 50);

//   function animate() {
//     renderer.render(scene, camera);
//     requestAnimationFrame(animate);
//   }
//   animate();
};

onMounted(() => {
  initThree();
});
</script>

<style scoped>
#threejs-canvas {
  width: 100%;
  height: 100%;
  position: fixed;
  /* left: 0;
  top: 0; */
}
</style>
