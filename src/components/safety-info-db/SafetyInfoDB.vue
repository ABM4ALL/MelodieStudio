<template>
    <div>
        aaaaa{{ p }}
        <base-table :columns="['date', 'name']"></base-table>
    </div>
</template>
<script setup lang="ts">
import BaseTable from "./BaseTable.vue";
import { getAllSafetyInfo } from "./requests"
// console.log(await getAllSafetyInfo());
import { ref } from "vue"
const p = ref("aaaa")
</script>