<template>
  <div>
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
const props = defineProps({
  absPath: { type: String, required: true },
});

const actions = ref<FileTreeItemAction[]>([]);

onBeforeMount(() => {
  actions.value = loadItemActions(props.absPath);
  console.log(actions.value);
});
</script>

<style>
</style>