import { random } from "lodash";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
type Position = { x: number; y: number; z: number }
type Speed = { dx: number; dy: number; dz: number }

export class Animation {
    targetPosition: Position[] = [];
    speed: Speed[] = [];
}

export class MaterialManager {
    materials: { [key: string]: any } = {}

    getMaterial(color: string) {
        if (this.materials[color] == null) {
            this.materials[color] = new THREE.MeshBasicMaterial({
                color,
            });
        }
        return this.materials[color]
    }
}

export class ThreeJSManager {
    domID: string
    width: number
    height: number
    scene: any
    camera: THREE.PerspectiveCamera
    renderer: THREE.Renderer
    materialManager: MaterialManager = new MaterialManager()
    speed: { [key: string]: Speed } = {};
    controls: OrbitControls

    constructor(domID: string, width: number, height: number,) {
        this.domID = domID
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#eee");
        this.scene = scene
        this.width = width
        this.height = height
        const canvas: HTMLDivElement = document.querySelector("#" + this.domID) as HTMLDivElement;
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

        const devicePixelRatio = window.devicePixelRatio;
        console.log('width', canvas.clientWidth, canvas.offsetWidth, canvas.scrollWidth)
        // const canvas: HTMLDivElement = document.getElementById("threejs-canvas") as HTMLDivElement
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(devicePixelRatio);

        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(50, 50, 50);
        camera.lookAt(50, 50, 0);
        this.camera = camera;

        this.insertGeometry(scene);

        this.controls = new OrbitControls(camera, this.renderer.domElement); //创建控件对象



        window.setInterval(() => {
            this.updateColor();
            // updatePosition(scene);
        }, 1000);

        let counter = 0
        window.setInterval(() => {
            // speed = updateTargetPosition(scene);
            if (counter % 20 == 0) {
                this.speed = this.updateTargetPosition(scene);
                counter = 0
            }

            this.updatePosition(scene, this.speed);
            counter += 1
        }, 500);

        this.animate();
    }

    insertGeometry(scene: THREE.Scene) {
        const geometry = new THREE.BoxGeometry(1, 1, 0.1);
        const patchGeometry = new THREE.BoxGeometry(1, 1, 0.1);
        const material3 = new THREE.MeshBasicMaterial({
            color: 0xff0000,
        });
        const material = new THREE.MeshBasicMaterial({
            color: "#00ff00",
        });
        const spotsGroup = new THREE.Group();

        const agentsGroup = new THREE.Group();
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
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
                0,//Math.random() * 100
            );
            mesh3.name = i;
            mesh3.material = material;
            agentsGroup.add(mesh3);
        }
        scene.add(agentsGroup);
    }

    updateTargetPosition(scene): { [key: string]: Speed } {
        console.log(scene.children);
        const speed: { [key: string]: Speed } = {};
        const t0 = Date.now();
        for (let i = 0; i < 1000; i++) {
            const mesh3 = scene.getObjectByName(i); //网格模型对象Mesh
            speed[i.toString()] = ({
                dx: (Math.random() * 100 - mesh3.position.x) / 20,
                dy: (Math.random() * 100 - mesh3.position.y) / 20,
                dz: 0//(0 - mesh3.position.z) / 20,
            });
        }
        const t1 = Date.now();
        console.log(t1 - t0);
        return speed;
    }

    updatePosition(scene: any, speed: { [key: string]: Speed }) {
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
        console.log('updated-target-pos', t1 - t0);
    }

    updateColor() {
        const t0 = Date.now();
        for (const spot of this.scene.children[0].children) {
            if (Math.random() < 0.5) {
                spot.material = this.materialManager.getMaterial("#000000")
            } else {
                spot.material = this.materialManager.getMaterial("#ffffff")
            }
        }
        console.log(this.scene.children[0].children[0].name)
        const t1 = Date.now();
        console.log('update-color', t1 - t0);
    }

    animate() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => { this.animate() });
    }

}