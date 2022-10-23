<template>

    <div class="float-label">
        <el-icon class="loading" v-if="languageServiceStatus.busy">
            <Loading></Loading>
        </el-icon>
        {{languageServiceStatus.hint}}
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import store from "@/store"
import { Loading } from "@element-plus/icons-vue"
const languageServiceStatus = computed(() => {
    return (store.state as any).status.languageService
})
</script>

<style scoped>
@keyframes rotate {
    0% {
        -webkit-transform: rotate(0deg);
    }

    25% {
        -webkit-transform: rotate(90deg);
    }

    50% {
        -webkit-transform: rotate(180deg);
    }

    75% {
        -webkit-transform: rotate(270deg);
    }

    100% {
        -webkit-transform: rotate(360deg);
    }
}

.loading {
    animation: rotate 2s linear infinite;
}

.float-label {
    --label-width: 10vw;
    position: absolute;
    right: 0px;
    bottom: 0px;
    z-index: 100;
    font-size: 0.5em;
}
</style>