<template>
  <el-tooltip :content="action.label" :show-after="200">
    <el-button class="filetree-button" @click="onClick">
      <el-icon>
        <svg-icon :svgIconName="props.action.icon"></svg-icon>
      </el-icon>
    </el-button>
  </el-tooltip>
</template>

<script lang="ts" setup>
import { defineProps, PropType } from "vue";
import { FileTreeItemAction, formatCMD } from "./filetree-items";
import SvgIcon from "@/components/basic/SvgIcon.vue";
import { requestRunCommand } from "@/components/events/globalevents";
import { baseName } from "@/utils/file";
const props = defineProps({
  fileABSPath: { type: String, required: true },
  action: { type: Object as PropType<FileTreeItemAction>, required: true },
});

const onClick = () => {
  if (props.action.action.cmd != null) {
    requestRunCommand(formatCMD(props.fileABSPath, props.action.action.cmd), baseName(props.fileABSPath));
  } else if (props.action.action.emitter != null) {
    props.action.action.emitter();
  } else {
    console.error("No handler registered for action", props.action.action);
  }
};
</script>

<style scoped>
.filetree-button {
  width: 24px;
  height: 24px;
  padding: 0px;
  margin-left: unset;
}
</style>