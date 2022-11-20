<template>

  <el-tabs v-model="activeName" class="editor-tabs" @tab-click="handleClick" closable @tab-remove="removeTab">
    <el-tab-pane :label="file.unsaved ? file.name + ' *' : file.name" :name="file.absPath" v-for="file in openedFiles"
      :key="file.absPath">
      <div class="pane">
        <cython-editor :file="file.absPath" @unsaved="setUnsaved(file.absPath, $event)" v-if="file.type == 'python'">
        </cython-editor>
        <database-browser v-if="file.type == 'sqlite'" :sqlite-path="file.absPath"></database-browser>
        <table-viewer v-if="file.type == 'table'" @unsaved="setUnsaved(file.absPath, $event)" :path="file.absPath">
        </table-viewer>
        <network-viewer v-as-editor v-if="file.type == 'network'" @unsaved="setUnsaved(file.absPath, $event)"
          :path="file.absPath"></network-viewer>
        <visualizer v-if="file.type == 'visualizer'"></visualizer>
        <!-- <network-viewer
          v-as-editor
          v-if="file.type == 'network'"
          @unsaved="setUnsaved(file.absPath, $event)"
          :path="file.absPath"
        ></network-viewer> -->
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import CythonEditor from "./CythonEditor2.vue";
import DatabaseBrowser from "@/components/dbbrowser/DatabaseBrowser.vue";
import TableViewer from "@/components/tableviewer/TableViewer.vue";
import NetworkViewer from "@/components/network/NetworkViewerNew.vue";
import Visualizer from "@/views/Visualizer.vue";
import { ref, defineExpose } from "vue";
import { ElNotification } from "element-plus";
import { baseName, getExt } from "@/utils/file";
import { setOnOpenVisualizer } from "../events/globalevents";

const activeName = ref("");
const openedFiles = ref<
  {
    absPath: string;
    name: string;
    type: "python" | "plain" | "table" | "builtin" | string;
    unsaved: boolean;
  }[]
>([]);

const getFileType = (path: string): string => {
  const ext = getExt(path);
  const fileTypeMap = {
    py: "python",
    sqlite: "sqlite",
    xls: "table",
    xlsx: "table",
    csv: "table",
    gexf: "network",
  };
  return fileTypeMap[ext];
};

const removeTab = (tabName: string) => {
  closeFile(tabName);
};

const isPlainText = (path: string): boolean => {
  const ext = getExt(path);
  const fileTypeMap = { py: "python", c: "c", cpp: "cpp" };
  return fileTypeMap[ext] == null;
};

const openFile = (fileName: string) => {
  if (getFileType(fileName) == null) {
    ElNotification.error("Unrecognized file type " + fileName);
    return;
  }
  if (openedFiles.value.findIndex((file) => file.absPath == fileName) < 0) {
    openedFiles.value.push({
      absPath: fileName,
      name: baseName(fileName),
      type: getFileType(fileName),
      unsaved: false,
    });
  }
  activeName.value = fileName;
};

const openVisualizer = () => {
  if (openedFiles.value.findIndex((file) => file.absPath == "visualizer") < 0) {
    openedFiles.value.push({
      absPath: "visualizer",
      name: "visualizer",
      type: "visualizer",
      unsaved: false,
    });
  }
  activeName.value = 'visualizer'
};

setOnOpenVisualizer(() => {
  openVisualizer();
});

const closeFile = (fileName: string) => {
  const index = openedFiles.value.findIndex((file) => file.absPath == fileName);
  if (index >= 0) {
    openedFiles.value.splice(index, 1);
    const newIndex = index - 1;
    if (newIndex >= 0) {
      activeName.value = openedFiles.value[newIndex].absPath;
    }
  }

};

const setUnsaved = (fileName: string, unsaved: boolean) => {
  const index = openedFiles.value.findIndex((file) => file.absPath == fileName);
  if (index != -1) {
    openedFiles.value[index].unsaved = unsaved;
  }
};

defineExpose({ openFile });

const onKeyDown = (evt) => {
  console.debug('key down!', evt);
};
</script>

<style scoped>
.pane {
  height: 100%;
}

.container {
  height: 100%;
  width: 100%;
  display: flex;
}
</style>
