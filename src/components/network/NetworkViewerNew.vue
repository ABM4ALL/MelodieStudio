<template>
  <div class="sigma-outer">
    <el-button @click="onWrite">write!</el-button>
    <div :id="DOMID" class="sigma-container"></div>
    <div id="controls">
      <div class="input">
        <label for="zoom-in">Zoom in</label><button id="zoom-in">+</button>
      </div>
      <div class="input">
        <label for="zoom-out">Zoom out</label><button id="zoom-out">-</button>
      </div>
      <div class="input">
        <label for="zoom-reset">Reset zoom</label
        ><button id="zoom-reset">⊙</button>
      </div>
      <div class="input">
        <label for="labels-threshold">Labels threshold</label>
        <input id="labels-threshold" type="range" min="0" max="15" step="0.5" />
      </div>
    </div>
  </div>
</template>


<script lang="ts" setup>
import Sigma from "sigma";
import Graph, { MultiGraph } from "graphology";
import { parse, write } from "graphology-gexf/browser";
import { PlainObject } from "sigma/types";
import { animateNodes } from "sigma/utils/animate";
import { ElNotification } from "element-plus";
import { onMounted, render } from "vue-demi";
import { exportNetworkToFile, loadNetworkFromFile } from "@/api/io";
import {
  ref,
  defineProps,
  defineEmits,
  onBeforeUnmount,
  defineExpose,
} from "vue";
import { v4 as uuid } from "uuid";
import {
  registerOnSaveCommand,
  unregisterOnSaveCommand,
} from "../events/globalevents";
let cancelCurrentAnimation: (() => void) | null = null;
// State for drag'n'drop
let draggedNode: string | null = null;
let isDragging = false;
let graph1 = null;

let hoveredEdge: null | any = null;
let selectedNode: null | any = null;
const emits = defineEmits(["unsaved"]);
const DOMID = ref("");
const props = defineProps({
  path: {
    required: true,
    type: String,
    default: "/Users/hzy/Develops/python/data-analysis/test.gexf",
  },
});
const handleContainerClick = (evt: PointerEvent) => {
  evt.stopPropagation();
};
// Load external GEXF file:
const load = (filename: string) => {
  loadNetworkFromFile({ path: filename })
    // .then((res) => res.text())
    .then((gexf) => {
      // Parse GEXF string:
      const graph = parse(Graph, gexf);

      // Retrieve some useful DOM elements:
      const container = document.getElementById(DOMID.value) as HTMLElement;
      const zoomInBtn = document.getElementById("zoom-in") as HTMLButtonElement;
      const zoomOutBtn = document.getElementById(
        "zoom-out"
      ) as HTMLButtonElement;
      const zoomResetBtn = document.getElementById(
        "zoom-reset"
      ) as HTMLButtonElement;
      const labelsThresholdRange = document.getElementById(
        "labels-threshold"
      ) as HTMLInputElement;
      let renderer: Sigma | null = null;
      // Instanciate sigma:
      try {
        renderer = new Sigma(graph, container, {
          minCameraRatio: 0.1,
          maxCameraRatio: 10,
          enableEdgeClickEvents: true,
          enableEdgeWheelEvents: true,
          enableEdgeHoverEvents: "debounce",
          nodeReducer(node, data) {
            const res = { ...data };
            if (node === selectedNode) res.color = "#cc0000";
            return res;
          },
          edgeReducer(edge, data) {
            const res = { ...data };
            if (edge === hoveredEdge) res.color = "#cc0000";
            return res;
          },
        });
      } catch (err) {
        console.error(err);
        ElNotification.error(`${err}`);
        return;
      }
      if (renderer == null) {
        return;
      }
      const camera = renderer.getCamera();

      // Bind zoom manipulation buttons
      zoomInBtn.addEventListener("click", () => {
        camera.animatedZoom({ duration: 600 });
      });
      zoomOutBtn.addEventListener("click", () => {
        camera.animatedUnzoom({ duration: 600 });
      });
      zoomResetBtn.addEventListener("click", () => {
        camera.animatedReset({ duration: 600 });
      });

      // Bind labels threshold to range input
      labelsThresholdRange.addEventListener("input", () => {
        renderer.setSetting(
          "labelRenderedSizeThreshold",
          +labelsThresholdRange.value
        );
      });

      // Set proper range initial value:
      labelsThresholdRange.value =
        renderer.getSetting("labelRenderedSizeThreshold") + "";
      // On mouse down on a node
      //  - we enable the drag mode
      //  - save in the dragged node in the state
      //  - highlight the node
      //  - disable the camera so its state is not updated
      renderer.on("downNode", (e) => {
        isDragging = true;
        draggedNode = e.node;
        graph.setNodeAttribute(draggedNode, "highlighted", true);
      });

      // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
      renderer.getMouseCaptor().on("mousemovebody", (e) => {
        if (!isDragging || !draggedNode) return;
        if (renderer == null) {
          return;
        }
        // Get new position of node
        const pos = renderer.viewportToGraph(e);

        graph.setNodeAttribute(draggedNode, "x", pos.x);
        graph.setNodeAttribute(draggedNode, "y", pos.y);

        // Prevent sigma to move camera:
        e.preventSigmaDefault();
        e.original.preventDefault();
        e.original.stopPropagation();
      });

      // On mouse up, we reset the autoscale and the dragging mode
      renderer.getMouseCaptor().on("mouseup", () => {
        if (draggedNode) {
          graph.removeNodeAttribute(draggedNode, "highlighted");
        }
        isDragging = false;
        draggedNode = null;
      });

      // Disable the autoscale at the first down interaction
      renderer.getMouseCaptor().on("mousedown", () => {
        if (renderer == null) {
          return;
        }
        if (!renderer.getCustomBBox())
          renderer.setCustomBBox(renderer.getBBox());
      });

      renderer.on("clickEdge", ({ edge, event }) => {
        if (renderer == null) {
          return;
        }
        if (event.original.shiftKey) {
          console.log("remove edge", edge);
          graph.dropEdge(edge);
        }
        console.log("click edge", edge, event);
        // hoveredEdge = edge;
        renderer.refresh();
      });
      const edgeEvents = [
        "clickEdge",
        "rightClickEdge",
        "doubleClickEdge",
        "wheelEdge",
      ];

      renderer.on("clickNode", ({ node, event }) => {
        if (renderer == null) {
          return;
        }

        console.log("node clicked", node, event);
        if (
          selectedNode != null &&
          (event.original.metaKey || event.original.ctrlKey)
        ) {
          graph.addEdge(selectedNode, node, { size: 3 });
          return;
        } else if (event.original.shiftKey) {
          graph.dropNode(node);
          selectedNode = null;
          return;
        }
        selectedNode = node;
      });
      renderer.on("enterEdge", ({ edge }) => {
        if (renderer == null) {
          return;
        }
        hoveredEdge = edge;
        renderer.refresh();
        console.log("enterEdge");
      });
      renderer.on("leaveEdge", ({ edge }) => {
        if (renderer == null) {
          return;
        }
        hoveredEdge = null;
        renderer.refresh();
        console.log("leaveEdge");
      });

      // When clicking on the stage, we add a new node and connect it to the closest node
      renderer.on(
        "clickStage",
        ({ event }: { event: { x: number; y: number } }) => {
          if (renderer == null) {
            return;
          }
          const originalEvent: PointerEvent = (event as any).original;
          selectedNode = null;
          if (!(originalEvent.ctrlKey || originalEvent.metaKey)) {
            return;
          }
          // Sigma (ie. graph) and screen (viewport) coordinates are not the same.
          // So we need to translate the screen x & y coordinates to the graph one by calling the sigma helper `viewportToGraph`
          const coordForGraph = renderer.viewportToGraph({
            x: event.x,
            y: event.y,
          });

          // We create a new node
          const node = {
            ...coordForGraph,
            size: 10,
            color: "#ff0000",
            label: "",
          };

          // Searching the two closest nodes to auto-create an edge to it
          const closestNodes = graph
            .nodes()
            .map((nodeId) => {
              const attrs = graph.getNodeAttributes(nodeId);
              const distance =
                Math.pow(node.x - attrs.x, 2) + Math.pow(node.y - attrs.y, 2);
              return { nodeId, distance };
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 1);
          let newID = 0;
          graph.nodes().map((nodeID) => {
            if (newID <= parseInt(nodeID)) {
              newID = parseInt(nodeID) + 1;
            }
          });
          // We register the new node into graphology instance
          const id = newID;
          node.label = id.toString();
          graph.addNode(id, node);

          // We create the edges
          closestNodes.forEach((e) => graph.addEdge(id, e.nodeId));
        }
      );

      graph1 = graph;
    });
};

onMounted(() => {
  console.log("a");
  DOMID.value = uuid();
  load(props.path);
});

const onWrite = () => {
  var gexfString = write(graph1, {
    formatNode: function (key, attributes) {
      return {
        label: attributes.label,
        attributes: {
          age: attributes.age,
          name: attributes.name,
        },
        viz: {
          color: "#FF0",
          x: attributes.x,
          y: attributes.y,
          shape: "circle",
          size: 20,
        },
      };
    },
    formatEdge: function (key, attributes) {
      return {
        label: attributes.label,
        attributes: {
          number: attributes.number,
        },
        weight: attributes.weight,
        viz: {
          color: "#FF0",
          x: attributes.x,
          y: attributes.y,
          shape: "dotted",
          size: attributes.size != null ? attributes.size : 3,
        },
      };
    },
  });
  console.log(gexfString);
  exportNetworkToFile({
    path: props.path,
    gexfString,
  });
};

const onSaveCommand = () => {
  onWrite();
  emits("unsaved", false);
};

onBeforeUnmount(() => {
  unregisterOnSaveCommand(onSaveCommand);
});

registerOnSaveCommand(onSaveCommand);

defineExpose({
  test() {
    console.log("test!");
  },
});
</script>

<style scoped>
.sigma-outer {
  width: 100%;
  height: 100%;
}

.sigma-container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>