<template>
  <div class="container">

    <div class="file-tree-container">
      <file-tree @open-file="onOpenFile"></file-tree>
    </div>
    <div class="editor-main">
      <div :style="{ height: terminalsShown ? '70%' : '100%', position: 'relative' }">
        <editor-tabs ref="codeEditor" style="height: 100%;"></editor-tabs>
        <float-label></float-label>
      </div>

      <terminal-tabs :style="{
        height: terminalsShown ? '30%' : '0%',
        visibility: terminalsShown ? 'unset' : 'none',
      }"></terminal-tabs>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  ref,
  onActivated,
  onDeactivated,
  onUnmounted,
  defineComponent,
} from "vue";
import FileTree from "./FileTree.vue";
import EditorTabs from "./EditorTabs.vue";
import FloatLabel from "@/components/float-label/FloatLabel.vue"
import TerminalTabs from "@/components/terminal/TerminalTabs.vue";
import { requestRunCommand } from "@/components/terminal/terminal_events";
import store from "@/store";

const codeEditor = ref(null);
const terminalsShown = ref(true);
const onOpenFile = (absPath: string) => {
  if (codeEditor.value != null) {
    (codeEditor.value as any).openFile(absPath);
  }
};
const id = Math.random();

</script>

<style scoped>
.file-tree-container {
  min-width: 300px;
  height: 100%;
  overflow-y: scroll;
}

.container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.container :deep(.editor-tabs) {
  height: 100%;
  /* margin-left: 12px; */
}

.editor-main {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: calc(100% - 300px);

  margin-left: 12px;
}

.container :deep(.el-tabs__content) {
  height: calc(100% - var(--el-tabs-header-height));
}

.container :deep(.el-tab-pane) {
  height: 100%;
}
</style>