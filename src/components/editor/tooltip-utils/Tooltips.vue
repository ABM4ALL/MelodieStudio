<template>
    <div class="tooltips-container">
        <p v-for="line of lines" :key="line">{{line}}</p>
    </div>
</template>
<script setup lang="ts">
import { computed, defineProps, PropType } from "vue"
const props = defineProps({
    messages: {
        type: Array as PropType<{ docs: string }[]>,
        required: true
    }
})

const lines = computed(() => {
    const lines: string[] = []
    for (const item of props.messages) {
        for (const line of item.docs.split('\n')) {
            lines.push(line)
        }
    }
    return lines
})
</script>

<style>
.tooltips-container {
    max-height: 40vh;
    max-width: 50vw;
    overflow-y: auto;
}
</style>