

<template>
  <div>
    <el-dialog v-model="dialogVisible">
      <el-button @click="gotoParent_">ToParentDir</el-button>
      <el-button @click="select" v-if="selectMode == 'directory'">Select</el-button>
      <p>{{ currentDirectory }}</p>
      <div>
        <div v-for="(value, index) in fsItemsList" :key="index" @click="itemClicked(value)">
          <el-icon>
            <Folder v-if="value.type == 'directory'" />
            <Document v-else />
          </el-icon>
          <a v-if="value.type == 'directory'" @click="gotoSubDir_(value.name)">{{ value.name }}</a>
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
import { defineComponent, PropType } from "vue";
import { getFSItems, gotoSubDir, gotoParentDir } from "@/api/fs";
import { FileSystemItem } from "@/models/fs"

export default defineComponent({
  emits: ["select-directory", "select-file"],
  props: {
    selectMode: {
      type: String as PropType<"directory" | "file">,
      default: () => "directory"
    }
  },
  data() {
    return {
      dialogVisible: false,
      currentDirectory: "",
      fsItemsList: [] as FileSystemItem[],
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
      const fsItems = await getFSItems(this.currentDirectory);
      this.currentDirectory = fsItems.currentDirectory;
      this.fsItemsList = fsItems.fsItemsList;
    },

    async gotoSubDir_(subdirName: string) {
      const fsItems = await gotoSubDir(this.currentDirectory, subdirName);
      this.currentDirectory = fsItems.currentDirectory;
      this.fsItemsList = fsItems.fsItemsList;
    },

    async gotoParent_() {
      console.log(this.currentDirectory)
      const fsItems = await gotoParentDir(this.currentDirectory);
      this.currentDirectory = fsItems.currentDirectory;
      this.fsItemsList = fsItems.fsItemsList;
    },

    itemClicked(item: FileSystemItem) {
      if ((this.selectMode == "file") && (item.type == "file")) {
        this.$emit("select-file", item.absPath)
        this.dialogVisible = false;
        return
      }
    },

    select() {
      this.$emit("select-directory", this.currentDirectory);
      this.dialogVisible = false;
    },
  },
});
</script>

<style></style>