<style >
.container {
  position: absolute;
  background-color: antiquewhite;
  padding: 10px;
}
</style>
<template>
  <div
    class="container"
    @mousemove="onMouseMove"
    @mouseout="onMouseOut"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    :style="{
      height: height + 'px',
      width: width + 'px',
      left: left + 'px',
      top: top + 'px',
    }"
    :id="chartDOMID"
    ref="chart-container"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {
  updateContainerLayout,
  getContainerLayout,
} from "@/components/basic/dragcontainers";
import { defineComponent, PropType } from "vue";
import * as echarts from "echarts";

interface LineChartSeriesOption extends echarts.LineSeriesOption {
  data: Array<Array<number>>;
}

function getEventLocation(evt: MouseEvent, parent: HTMLElement) {
  var offsetX = evt.offsetX;
  var offsetY = evt.offsetY;
  const path = (evt as any).path as HTMLDivElement[];
  for (const elem of path) {
    if (elem == parent) {
      break;
    }
    offsetX += elem.offsetLeft;
    offsetY += elem.offsetTop;
  }
  return {
    offsetX,
    offsetY,
  };
}

export default defineComponent({
  name: "IncrementalLineChart",
  emits: ["container-changed"],
  props: {
    slotComponentID: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      selectionItems: {} as any,
      unchangeableItems: {} as any,
      chartDOMID: `${Math.random()}`,
      clientX: 0,
      clientY: 0,
      height: 200,
      width: 200,
      left: 0,
      top: 0,
      requestSendPosChanged: false,
      timer: 0,
      dragMode: "move" as string, // 'move' 'resize'
      resizeDir: "", // "n", "nw" ...
    };
  },
  mounted() {
    this.timer = window.setInterval(() => {
      if (this.requestSendPosChanged) {
        const layout = {
          left: this.left,
          top: this.top,
          height: this.height,
          width: this.width,
        };
        this.$emit("container-changed", layout);
        this.requestSendPosChanged = false;
        updateContainerLayout(this.slotComponentID, layout);
      }
    }, 100);
    window.setTimeout(() => {
      let layout = getContainerLayout(this.slotComponentID);
      if (layout != null) {
        this.left = layout.left;
        this.top = layout.top;
        this.width = layout.width;
        this.height = layout.height;
        console.log(this.slotComponentID, this.left, this.top);
      }
      this.$emit("container-changed", layout);
    }, 500);
  },
  beforeUnmount() {
    window.clearInterval(this.timer);
  },
  methods: {
    onMouseOut(evt: MouseEvent) {
      console.log("mouseout!");
    },
    onMouseDown(evt: MouseEvent) {
      console.log("mouse-down!");
      const direc = this.getDirection(evt);
      let container = document.getElementById(
        this.chartDOMID
      ) as HTMLDivElement;
      if (direc == "") {
        this.dragMode = "move";
        container!.style.cursor = "default";
      } else {
        this.dragMode = "resize";
        container!.style.cursor = direc + "-resize";
        this.resizeDir = direc;
        const onMouseMove = (evt: MouseEvent) => {
          if (direc.indexOf("e") !== -1) {
            this.width += evt.movementX;
          }

          // 鼠标按下的位置在上部，修改高度
          if (direc.indexOf("n") !== -1) {
            this.height += -evt.movementY;
            this.top += evt.movementY;
            console.log(evt.movementY);
          }
          // 鼠标按下的位置在底部，修改高度
          if (direc.indexOf("s") !== -1) {
            this.height += evt.movementY;
          }

          // 鼠标按下的位置在左边，修改宽度
          if (direc.indexOf("w") !== -1) {
            this.width += -evt.movementX;
            this.left += evt.movementX;
          }
          this.requestSendPosChanged = true;
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", () => {
          document.removeEventListener("mousemove", onMouseMove);
        });
      }
    },
    onMouseUp(evt: MouseEvent) {
      let container = document.getElementById(
        this.chartDOMID
      ) as HTMLDivElement;
      container!.style.cursor = "default";
      this.dragMode = "move";
    },
    getDirection(ev: MouseEvent): string {
      const container = this.$refs["chart-container"] as any;
      if (container == null) {
        return "";
      }
      let xP, yP, offset, dir;
      dir = "";

      const { offsetX, offsetY } = getEventLocation(ev, container);
      xP = offsetX;
      yP = offsetY;
      console.log(xP, yP);
      offset = 10;

      if (yP < offset) dir += "n";
      else if (yP > container.offsetHeight - offset) dir += "s";
      if (xP < offset) dir += "w";
      else if (xP > container.offsetWidth - offset) dir += "e";

      return dir;
    },
    onMouseMove(evt: MouseEvent) {
      const direc = this.getDirection(evt);
      let container = this.$refs["chart-container"] as any;
      if (direc != "") {
        container!.style.cursor = direc + "-resize";
      } else {
        container!.style.cursor = "default";
      }
      if (evt.buttons === 1) {
        let container = this.$refs["chart-container"] as any;
        if (container == null) {
          console.error("container undefined");
          return;
        }
        if (this.dragMode == "move") {
          this.top += evt.movementY;
          this.left += evt.movementX;
        }
        this.requestSendPosChanged = true;
      }
    },
  },
});
</script>


