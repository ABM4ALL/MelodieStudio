<script lang="ts">
import { defineComponent, PropType } from "@vue/runtime-core";
import { EChartsCoreOption, number } from "echarts";
const maxTime = 100;
let times = 0;

interface ValueTreeType {
  label: string;
  children: any[];
  value: any;
  id: string;
  type?: string;
}

const walker = (obj: object, newObj: ValueTreeType): any => {
  const re = /[a-zA-Z_][a-zA-Z0-9]*/;

  Object.keys(obj).forEach((key) => {
    if (!re.test(key)) {
      return;
    }
    const parentID = newObj.id;
    const subObj: ValueTreeType = {
      label: key,
      children: [] as any[],
      value: obj[key],
      id: parentID + "-" + key,
    };
    newObj.children.push(subObj);

    if (times > maxTime) {
      return;
    }
    const objType = typeof obj[key];
    if (objType === "string" || objType === "number" || objType === "boolean") {
      let type: undefined | string = undefined;
      if (objType === "string") {
        if (/^#[a-f0-9A-F]{3,8}$/.test(obj[key])) {
          type = "color";
        } else {
          type = "string";
        }
      } else {
        type = objType;
      }
      subObj.type = type;
      return;
    } else if (Array.isArray(obj[key]) && obj[key].length <= 10) {
      for (let i = 0; i < obj[key].length; i++) {
        const parentID = subObj.id;
        const arrayItemObj = {
          label: i.toString(),
          children: [],
          value: obj[key],
          id: parentID + "-" + i.toString(),
        };
        subObj.children.push(arrayItemObj);
        walker(obj[key][i], arrayItemObj);
      }
    } else if (obj[key] === undefined || obj[key] === null) {
      return;
    } else {
      walker(obj[key], subObj);
    }
    // times += 1;
  });
};

export default defineComponent({
  emits: ["config-modified"],
  props: {
    initialOptions: { type: Object as PropType<EChartsCoreOption> },
    selectionItems: { type: Object as PropType<any> },
    unchangeableItems: { type: Object as PropType<any> },
  },
  data() {
    return {
      inEdit: false,
      edit: {
        currentEditedObject: Object as any,
        currentEditedID: "",
        currentObjectKey: "",
        currentObjectValue: "" as string | boolean,
        currentObjectType: "" as "string" | "number" | "boolean" | "color",
      },
      configSelectionItems: this.selectionItems as any,
      configUnchangeableItems: this.unchangeableItems as any,
      config: this.initialOptions as any,
      defaultTreeProps: {
        children: "children",
        label: "label",
      },
      configTree: [],
      leafLastClicked: 0,
    };
  },
  watch: {
    config: {
      deep: true,
      handler: function (this: any) {
        this.updateTree();
      },
    },
    initialOptions: {
      deep: true,
      handler: function (this: any) {
        this.config = this.initialOptions;
        console.log("config updated!");
      },
    },
  },
  mounted() {
    console.log(this.config);
    this.updateTree();
    console.log(this.configTree);
  },
  methods: {
    updateTree() {
      const obj: ValueTreeType = {
        label: "parameters",
        children: [],
        id: "root",
      } as any;

      walker(this.config, obj);
      this.configTree = [obj] as any;
      console.log(this.configTree);
    },
    formatValue(value: string | number | boolean): string {
      let text = "";
      if (typeof value === "string") {
        text = `"${value}"`;
      } else {
        text = `${value}`;
      }
      return text;
    },
    exitEdit() {
      console.log("Exit Edit!");
      this.inEdit = false;
      this.updateEditedValue();
      this.$emit("config-modified", this.config);
    },
    convertIDPattern(id): string {
      const splitted = id.split("-");
      let convertedID = "root";
      for (let i = 1; i < splitted.length; i++) {
        let idPart = splitted[i];
        if (/^[0-9]+$/.test(idPart)) {
          idPart = "*";
        }
        convertedID = convertedID + "-" + idPart;
      }
      console.log("converted ID:", convertedID);
      return convertedID;
    },
    valueType(id: string) {
      id = this.convertIDPattern(id);
      return this.configSelectionItems[id];
    },
    valueChangeable(id: string): boolean {
      id = this.convertIDPattern(id);
      return this.configUnchangeableItems[id] === undefined;
    },
    treeToModel(obj: any, key: string, value: any, id: string) {
      this.edit.currentEditedObject = obj;
      this.edit.currentObjectKey = key;
      this.edit.currentObjectValue = value;
      this.edit.currentEditedID = id;
      this.edit.currentObjectType = typeof value as any;
    },

    updateEditedValue() {
      const rawValue = this.edit.currentObjectValue;
      let value: any = undefined;
      if (this.edit.currentObjectType === "number") {
        value = parseInt(this.edit.currentObjectValue as string);
      } else {
        value = rawValue;
      }
      this.edit.currentEditedObject[this.edit.currentObjectKey] = value;

      this.config.updatedAt = new Date();
    },

    onNodeClick(node) {
      //return if node is not leaf
      if (node.children.length > 0) {
        return;
      }
      if (Date.now() - this.leafLastClicked > 500) {
        this.leafLastClicked = Date.now();
        return;
      } else {
        this.leafLastClicked = Date.now();
      }

      const path = node.id.split("-");
      let p = this.config;
      for (let i = 1; i < path.length - 1; i++) {
        p = p[path[i]];
      }
      if (!this.valueChangeable(node.id)) {
        console.log(`clicked id ${node.id} is unchangeable`);
        return;
      }
      if (this.inEdit) {
        this.updateEditedValue();
      }
      this.treeToModel(
        p,
        path[path.length - 1],
        p[path[path.length - 1]],
        node.id
      );
      this.inEdit = true;
    },
  },
});
</script>
<template>
  <div>
    <el-tree
      :data="configTree"
      :props="defaultTreeProps"
      :default-expand-all="true"
      @node-click="onNodeClick"
    >
      <template #default="{ node, data }">
        <span
          :class="{
            unchangeable: !valueChangeable(data.id),
          }"
        >
          <span>{{ node.label }} : </span>

          <div v-if="data.children.length === 0" style="display: inline-block">
            <span
              v-if="!inEdit || (inEdit && edit.currentEditedID !== data.id)"
            >
              <p v-if="data.type !== 'color'">
                {{ formatValue(data.value) }}
              </p>
              <div
                v-else
                :style="{
                  backgroundColor: data.value,
                  width: '14px',
                  height: '14px',
                }"
              ></div>
            </span>
            <div v-else class="treeEditor">
              <el-input
                v-model="edit.currentObjectValue"
                v-if="
                  (data.type === 'string' || data.type === 'number') &&
                  valueType(data.id) === undefined
                "
              ></el-input>
              <el-select
                v-model="edit.currentObjectValue"
                v-else-if="
                  data.type === 'string' && valueType(data.id) !== undefined
                "
              >
                <el-option
                  v-for="(item, i) in valueType(data.id)"
                  :key="i"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>

              <el-switch
                v-model="edit.currentObjectValue"
                v-if="data.type === 'boolean'"
              />

              <el-color-picker
                v-model="edit.currentObjectValue"
                v-if="data.type === 'color'"
              />
            </div>
          </div>
        </span>
      </template>
    </el-tree>
    <el-button @click.stop="exitEdit" v-show="inEdit">保存</el-button>
  </div>
</template>

<style>
.treeEditor .el-input__inner {
  height: 26px;
}

.unchangeable {
  color: darkgrey;
}
</style>