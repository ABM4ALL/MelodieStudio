<template>
  <div :id="containerID">dddddddddd</div>
</template>

<script lang="ts">
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";
import { defineComponent } from "@vue/runtime-core";
const green = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const red = new THREE.MeshBasicMaterial({ color: 0xff0000 });

interface Mesh {
  coorX: number;
  coorY: number;
  material: any;
  geometry: any;
}
interface Obj {
  add: (m: Mesh | Scene | Group) => void;
  remove: (m: Mesh | Scene | Group) => void;
}

interface Scene extends Obj {
  children: Mesh[];
}

interface Group extends Obj {
  children: Mesh[];
}

interface Agent {
  id: number;
  x: number;
  y: number;
  category: string; // The category of agent. Stands for the class
  style: string;
  deleted: boolean;
}

export default defineComponent({
  setup() {
    console.log("setup!");
    const scene: Scene = {} as any;
    const patchGroup: Group = {} as any;
    const agentGroup: Group = {} as any;
    const agentsMap: { [key: string]: Map<number, Agent> } = {}; // store agent id=>agent property.
    return {
      scene,
      patchGroup,
      agentsMap,
      agentGroup,
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
    this.scene = scene as any;
    if (
      this.scene == null ||
      this.patchGroup == null ||
      this.agentGroup == null
    ) {
      throw Error;
    }

    let camera = new THREE.PerspectiveCamera(
      90, // 直角三角形
      800 / 600,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(800, 600);

    container.appendChild(renderer.domElement);

    this.patchGroup = new THREE.Group() as any;
    this.agentGroup = new THREE.Group() as any;
    this.scene.add(this.patchGroup);
    this.scene.add(this.agentGroup);

    function render() {
      renderer.render(scene, camera); //执行渲染操作
    }

    const controls = new OrbitControls(camera, renderer.domElement); //创建控件对象
    controls.enablePan = true;
    controls.addEventListener("change", render); //监听鼠标、键盘事件
    controls.target = new THREE.Vector3(50, 50, 0);
    camera.position.set(50, 50, 50);
    camera.lookAt(new THREE.Vector3(50, 50, 0));

    this.drawGrid();

    // for (let i = 0; i < 100; i++) {
    //   for (let j = 0; j < 100; j++) {
    //     this.addCellPatch(i, j);
    //   }
    // }

    for (let i = 0; i < 5; i++) {
      this.addAgent({
        id: i,
        x: 10,
        y: 5 + i,
        category: "wolf",
        style: "",
        deleted: false,
      });
    }

    const update = () => {
      const t0 = Date.now();
      // this.updatePatches();
      this.updateAgents();
      renderer.render(scene, camera);
      console.log(Date.now() - t0);
    };

    window.setInterval(() => {
      update();
    }, 1000);
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

    addAgent(agent: Agent) {
      if (this.agentGroup == null) {
        throw Error;
      }
      if (this.agentsMap[agent.category] === undefined) {
        this.agentsMap[agent.category] = new Map();
      }
      this.agentsMap[agent.category].set(agent.id, agent);
      const fcn = (shape) => {
        const { x, y } = agent;
        shape.moveTo(x, y);
        shape.lineTo(x + 0.1, y + 0.9, 1);
        shape.lineTo(x + 0.9, y + 0.9, 1);
        shape.lineTo(x + 0.9, y + 0.1, 1);
        shape.lineTo(x + 0.1, y + 0.1, 1);
      };
      this.drawInCell(agent.x, agent.y, fcn, this.agentGroup);
    },
    addCellPatch(x: number, y: number) {
      if (this.patchGroup == null) {
        throw Error;
      }
      const fcn = (shape) => {
        shape.moveTo(x, y);
        shape.lineTo(x + 0, y + 1, 0);
        shape.lineTo(x + 1, y + 1, 0);
        shape.lineTo(x + 1, y + 0, 0);
        shape.lineTo(x + 0, y + 0, 0);
      };
      this.drawInCell(x, y, fcn, this.patchGroup);
    },
    drawInCell(
      x: number,
      y: number,
      drawFunc: (shape: THREE.Shape) => void,
      group: Group
    ) {
      const heartShape = new THREE.Shape();
      drawFunc(heartShape);

      const geometry = new THREE.ShapeGeometry(heartShape);
      const mesh: Mesh = new THREE.Mesh(geometry, green) as any;
      mesh.coorX = x;
      mesh.coorY = y;
      group.add(mesh);
    },
    clearPatchGroup() {
      if (this.patchGroup == null) {
        throw Error;
      }
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
        if (Math.random() > 0.8 && this.patchGroup.children[i].coorX > 50) {
          this.patchGroup.children[i].material = red;
        } else {
          this.patchGroup.children[i].material = green;
        }
      }
    },
    updateAgents() {
      const agents = (this.agentGroup as Group).children;
      for (let i = 0; i < agents.length; i++) {
        agents[i].material = red;
      }
    },
    drawGrid() {
      if (this.scene == null) {
        throw Error;
      }
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
        this.scene.add(line as any);
      }
      for (let j = 0; j <= xCells; j++) {
        const points: THREE.Vector3[] = [];
        points.push(new THREE.Vector3(j, yMin, 0));
        points.push(new THREE.Vector3(j, yMax, 0));
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        this.scene.add(line as any);
      }
    },
  },
});
</script>

<style>
</style>