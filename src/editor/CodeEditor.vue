<template>
  <div class="container">
    <div class="file-tree-container">
      <file-tree></file-tree>
    </div>

    <cython-editor></cython-editor>
  </div>
</template>

<script lang="ts" setup>
import FileTree from "./FileTree.vue";
import CythonEditor from "./CythonEditor2.vue";
</script>

<style scoped>
.file-tree-container {
  width: 30%;
}

.container {
  display: flex;
  flex-direction: row;
  width: 100%;
}
</style>