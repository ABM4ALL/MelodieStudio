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
  emits: ["config-modified", "delete-saved-option", "drawer-close"],
  props: {
    showDrawer: { type: Boolean, required: true },
    chartName: { type: String, required: true },
    initialOptions: { type: Object as PropType<EChartsCoreOption> },
    selectionItems: { type: Object as PropType<any> },
    unchangeableItems: { type: Object as PropType<any> },
  },
  data() {
    return {
      inEdit: false,
      configDrawerShow: false,
      deleteConfirmationShow: false,
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
      },
    },
    selectionItems: {
      deep: true,
      handler: function (this: any) {
        this.configSelectionItems = this.selectionItems;
      },
    },
    unchangeableItems: {
      deep: true,
      handler: function (this: any) {
        this.configUnchangeableItems = this.unchangeableItems;
      },
    },
    showDrawer: {
      handler: function (this: any) {
        this.configDrawerShow = this.showDrawer;
      },
    },
  },
  mounted() {
    this.updateTree();
  },
  methods: {
    voidFcn() {
      return;
    },
    updateTree() {
      const obj: ValueTreeType = {
        label: "parameters",
        children: [],
        id: "root",
      } as any;

      walker(this.config, obj);
      this.configTree = [obj] as any;
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
    deleteSavedOptions() {
      this.$emit("delete-saved-option");
      this.deleteConfirmationShow = false;
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
    onDrawerClose() {
      this.$emit("drawer-close");
    },
  },
});
</script>
<template>
  <div
    @mousemove.stop="voidFcn"
    @mousedown.stop="voidFcn"
    @mouseup.stop="voidFcn"
  >
    <el-drawer
      v-model="configDrawerShow"
      title="Chart Options"
      :modal="false"
      @close="onDrawerClose"
    >
      <template #title>
        <h3>{{ chartName }}</h3>

        <el-button @click.stop="exitEdit" size="mini" type="primary"
          >Save</el-button
        >

        <el-popover
          :visible="deleteConfirmationShow"
          placement="top"
          :width="160"
        >
          <h3>Warning</h3>
          <p class="noBreakOut">
            All options will be reset to default values, and this operation is
            NOT reversible
          </p>
          <p class="noBreakOut">Are you sure to reset?</p>
          <div style="text-align: right; margin: 0">
            <el-button
              size="mini"
              type="text"
              @click="this.deleteConfirmationShow = false"
              >Cancel</el-button
            >
            <el-button
              type="danger"
              size="mini"
              @click="this.deleteSavedOptions"
              >Reset</el-button
            >
          </div>
          <template #reference>
            <el-button
              @click="this.deleteConfirmationShow = true"
              type="danger"
              size="mini"
              >Reset</el-button
            >
          </template>
        </el-popover>
      </template>
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

              <div
                v-if="data.children.length === 0"
                style="display: inline-block"
              >
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
      </div>
    </el-drawer>
  </div>
</template>

<style>
.treeEditor .el-input__inner {
  height: 26px;
}

.unchangeable {
  color: darkgrey;
}
.noBreakOut {
  /* 这两个在技术上是一样的, 为了兼容了浏览器两个都加上 */
  overflow-wrap: break-word;
  word-wrap: break-word;

  -ms-word-break: break-all;
  /* 这个的使用在web-kit中有些危险，他可能会阶段所有东西 */
  word-break: break-all;
  /* Instead use this non-standard one: */
  word-break: break-word;

  /* 如果浏览器支持的话增加一个连接符(Blink不支持) */
  -ms-hyphens: auto;
  -moz-hyphens: auto;
  -webkit-hyphens: auto;
  hyphens: auto;
}
</style>