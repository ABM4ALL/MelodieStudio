<template>
  <database-browser></database-browser>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import DatabaseBrowser from "../components/dbbrowser/DatabaseBrowser.vue";
export default defineComponent({
  components: { DatabaseBrowser },
});
</script>

<style>
</style>