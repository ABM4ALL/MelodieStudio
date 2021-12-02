<template>
  <div :id="containerID">dddddddddd</div>
</template>

<script lang="ts">
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import ThreejsTestVue from "./ThreejsTest.vue";
const green = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const red = new THREE.MeshBasicMaterial({ color: 0xff0000 });
export default {
  setup() {
    console.log("setup!");
    const scene: THREE.Scene | undefined = undefined;
    const patchGroup: THREE.Group | undefined = undefined;
    return {
      scene,
      patchGroup,
    };
  },
  data() {
    return {
      containerID: `threejs-container-${Math.random()}`,
    };
  },
  options: {},
  mounted() {
    if (this.containerID === undefined) {
      throw Error("container id undefined!");
    }
    const container = document.getElementById(this.containerID);
    if (container === null) {
      throw Error(`Container ${this.containerID} is not found!`);
    }
    let scene = new THREE.Scene();
    this.scene = scene;

    let camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // camera.position.x = 0;
    // camera.position.y = 0;
    // camera.position.z = 10;
    // camera.lookAt({
    //   x: 0,
    //   y: 0,
    //   z: 0,
    // });

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(800, 600);

    container.appendChild(renderer.domElement);

    camera.position.z = 5;
    this.patchGroup = new THREE.Group();
    this.scene.add(this.patchGroup);
    // for (let i = 0; i < 100; i++) {
    //   const cube = this.createGeometry(0);
    //   this.group.add(cube);
    // }

    // this.scene.add(this.group);
    // console.log(cube1.name);
    this.initObject();
    // this.draw2d();

    function render() {
      renderer.render(scene, camera); //执行渲染操作
    }

    const controls = new OrbitControls(camera, renderer.domElement); //创建控件对象
    controls.addEventListener("change", render); //监听鼠标、键盘事件
    for (let i = 0; i < 100; i++) {
      for (let j = 0; j < 100; j++) {
        // if (Math.random() > 0.5) {
        this.draw2d(i, j);
        // }
      }
    }

    // this.clearPatchGroup();
    const update = () => {
      this.updatePatches();
      renderer.render(scene, camera);
    };
    // animate();
    window.setInterval(() => {
      update();
    }, 100);
  },

  methods: {
    createGeometry(id: number) {
      let geometry = new THREE.BoxGeometry(1, 1, 1);
      let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      let cube = new THREE.Mesh(geometry, material);
      let vector = new THREE.Vector3(
        Math.random(),
        Math.random()
        // Math.random()
      );
      cube.translateOnAxis(vector, Math.random() * 2);
      //   cube.id = 0;
      //   this.scene.add(cube);
      return cube;
    },
    draw2d(x: number, y: number) {
      //   qwe;
      const heartShape = new THREE.Shape();
      heartShape.moveTo(x, y);
      heartShape.lineTo(x + 0, y + 1, 0);
      heartShape.lineTo(x + 1, y + 1, 0);
      heartShape.lineTo(x + 1, y + 0, 0);
      heartShape.lineTo(x + 0, y + 0, 0);

      const geometry = new THREE.ShapeGeometry(heartShape);

      const mesh = new THREE.Mesh(geometry, green);
      mesh.x = x;
      mesh.y = y;
      this.patchGroup.add(mesh);
    },
    clearPatchGroup() {
      while (this.patchGroup.children.length > 0) {
        const child = this.patchGroup.children[0];
        child.geometry.dispose();
        child.material.dispose();
        this.patchGroup.remove(child);
      }
    },
    updatePatches() {
      for (let i = 0; i < this.patchGroup.children.length; i++) {
        // this.patchGroup.children[i].visible = Math.random() > 0.8;
        if (Math.random() > 0.8) {
          this.patchGroup.children[i].material = red;
        } else {
          this.patchGroup.children[i].material = green;
        }
      }
    },
    initObject() {
      //   a;
      const xCells = 100;
      const yCells = 100;
      const xMin = 0;
      const yMin = 0;
      const xMax = 100;
      const yMax = 100;
      for (let i = 0; i <= yCells; i++) {
        const points: THREE.Vector3[] = [];
        points.push(new THREE.Vector3(xMin, i, 0));
        points.push(new THREE.Vector3(xMax, i, 0));
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
      }
      for (let j = 0; j <= xCells; j++) {
        const points: THREE.Vector3[] = [];
        points.push(new THREE.Vector3(j, yMin, 0));
        points.push(new THREE.Vector3(j, yMax, 0));
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
      }
    },
  },
};
</script>

<style>
</style>