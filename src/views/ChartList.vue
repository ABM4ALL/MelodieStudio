<template>
  <div style="width:300px">
    <incremental-line-chart></incremental-line-chart>
    <chart-config></chart-config>
  </div>
</template>

<script>
import IncrementalLineChart from "@/components/dynamicChart/IncrementalLineChart.vue";
import ChartConfig from '@/components/dynamicChart/ChartConfig.vue';
export default {
  components: { IncrementalLineChart, ChartConfig }
};
</script>

<style>
</style>