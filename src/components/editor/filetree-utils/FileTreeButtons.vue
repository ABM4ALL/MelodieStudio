<template>
  <div :class="{ 'file-tree-buttons': actions.length > 1 }">
    <file-tree-button
      v-for="(action, i) in actions"
      :key="i"
      :action="action"
      :fileABSPath="absPath"
    ></file-tree-button>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, onBeforeMount, ref } from "vue";
import FileTreeButton from "./FileTreeButton.vue";
import { loadItemActions, FileTreeItemAction } from "./filetree-items";
import { baseName } from "@/utils/file";
const props = defineProps({
  absPath: { type: String, required: true },
});

const actions = ref<FileTreeItemAction[]>([]);

onBeforeMount(() => {
  actions.value = loadItemActions(props.absPath);
  console.log(baseName(props.absPath), actions.value);
});
</script>

<style scoped>
.file-tree-buttons :first-child {
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
}

.file-tree-buttons :last-child {
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}
</style>