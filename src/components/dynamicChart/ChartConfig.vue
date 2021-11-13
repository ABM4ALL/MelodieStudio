<template>
  <el-tree
    :data="configTree"
    :props="defaultTreeProps"
    :render-content="renderContent"
    :default-expand-all="true"
    @node-click="onNodeClick"
  ></el-tree>
</template>


<script lang="ts">
import { number } from "echarts";
const maxTime = 100;
let times = 0;

const v: { label: string; children: any[]; value: any; id: string } = {
  label: "parameters",
  children: [],
  id: "root",
} as any;

const walker = (obj: object, newObj: typeof v): any => {
  const re = /[a-zA-Z_][a-zA-Z0-9]*/;

  Object.keys(obj).forEach((key) => {
    if (!re.test(key)) {
      return;
    }
    console.log(key, typeof key, obj[key]);
    const parentID = newObj.id;
    const subObj = {
      label: key,
      children: [],
      value: obj[key],
      id: parentID + "-" + key,
    };
    newObj.children.push(subObj);

    if (times > maxTime) {
      return;
    }

    if (typeof obj[key] === "string" || typeof obj[key] === "number") {
      return;
    }
    times += 1;
    walker(obj[key], subObj);
  });
};

export default {
  data() {
    return {
      config: {
        title: {
          text: "Line Chart",
          subtext: "Fake Data",
        },
        xAxis: {
          type: "value",
        },
        yAxis: {
          type: "value",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
        },
      },
      defaultTreeProps: {
        children: "children",
        label: "label",
      },
      configTree: [],
      leafLastClicked: 0,
    };
  },
  mounted() {
    const obj: { label: string; children: any[]; value: any; id: string } = {
      label: "parameters",
      children: [],
      id: "root",
    } as any;
    walker(this.config, obj);
    console.log(obj);
    this.configTree = [obj] as any;
  },
  watch: {
    config: {
      deep: true,
      handler: function (this: any) {
        const obj: { label: string; children: any[]; value: any; id: string } =
          {
            label: "parameters",
            children: [],
            id: "root",
          } as any;
        walker(this.config, obj);
        this.configTree = [obj];
      },
    },
  },
  methods: {
    renderContent(h, { node, data, store }) {
      let text = "";
      console.log(data, data.children, data.children.length);
      if (data.children.length > 0) {
        text = node.label;
      } else {
        if (typeof data.value === "string") {
          text = node.label + `: "${data.value}"`;
        } else {
          text = node.label + `: ${data.value}`;
        }
      }
      return h("span", h("span", null, text));
    },
    onNodeClick(node) {
      if (node.children.length > 0) {
        //return if not leaf
        return;
      }
      if (Date.now() - this.leafLastClicked > 500) {
        this.leafLastClicked = Date.now();
        return;
      } else {
        this.leafLastClicked = Date.now();
      }

      console.log("node", node, "was clicked!");
      const path = node.id.split("-");
      let p = this.config;
      for (let i = 1; i < path.length - 1; i++) {
        p = p[path[i]];
        console.log(path, i, p);
      }
      p[path[path.length - 1]] = "aaa";
      //   this.config[i] = "aaa";
    },
  },
};
</script>

<style>
</style>