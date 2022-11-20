

<template>
  <div>
    <el-dialog v-model="dialogVisible">
      <!-- <el-button @click="onSelectDirectory">Select Directory</el-button> -->
      <el-button @click="gotoParent_">ToParentDir</el-button>
      <el-button @click="select">Select</el-button>
      <p>{{ currentDirectory }}</p>
      <div>
        <div v-for="(value, index) in fsItemsList" :key="index">
          <el-icon>
            <Folder v-if="value.type == 'directory'" />
            <Document v-else />
          </el-icon>
          <a
            v-if="value.type == 'directory'"
            @click="gotoSubDir_(value.name)"
            >{{ value.name }}</a
          >
          <a v-else>{{ value.name }}</a>
        </div>
      </div>
    </el-dialog>
    <el-button @click="dialogVisible = true">...</el-button>
  </div>
</template>
<script setup lang="ts">
import { Folder, Document } from "@element-plus/icons-vue";
</script>

<script lang="ts">
import { defineComponent } from "vue";
import { getFSItems, gotoSubDir, gotoParentDir } from "@/api/fs";

export default defineComponent({
  emits: ["select-directory"],
  data() {
    return {
      dialogVisible: false,
      currentDirectory: "",
      fsItemsList: [],
    };
  },
  mounted() {
    this.getFSItems_();
  },
  methods: {
    async onSelectDirectory() {
      let directory = await (window as any).showDirectoryPicker({
        startIn: "desktop",
      }); // 从桌面开始选择文件。
      for await (const entry of directory.values()) {
        console.log(entry);
      }
    },
    async getFSItems_() {
      const resp = await getFSItems(this.currentDirectory);
      const fsItems = resp.data;
      this.currentDirectory = fsItems.currentDirectory;
      this.fsItemsList = fsItems.fsItemsList;
    },

    async gotoSubDir_(subdirName: string) {
      const resp = await gotoSubDir(this.currentDirectory, subdirName);
      const fsItems = resp.data;
      this.currentDirectory = fsItems.currentDirectory;
      this.fsItemsList = fsItems.fsItemsList;
    },

    async gotoParent_() {
      const resp = await gotoParentDir(this.currentDirectory);
      const fsItems = resp.data;
      this.currentDirectory = fsItems.currentDirectory;
      this.fsItemsList = fsItems.fsItemsList;
    },

    select() {
      this.$emit("select-directory", this.currentDirectory);
      this.dialogVisible = false;
    },
  },
});
</script>

<style>
</style>