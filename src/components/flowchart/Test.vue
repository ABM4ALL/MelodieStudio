
<template>
    <div>
        <el-button @dblclick="showDialog">双击打开对话框</el-button>
        <el-dialog v-model="dialogVisible" title="配置信息">
            <el-form :model="form" label-width="80px">
                <el-form-item label="姓名">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="班级">
                    <el-input v-model="form.class"></el-input>
                </el-form-item>
            </el-form>
            <template v-slot:footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                </div>
            </template>

        </el-dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'MyComponent',
    setup() {
        const dialogVisible = ref(false);
        const form = ref({
            name: '',
            class: '',
        });

        const showDialog = () => {
            dialogVisible.value = true;
        };

        const submitForm = () => {
            console.log(form.value);
            dialogVisible.value = false;
        };

        return {
            dialogVisible,
            form,
            showDialog,
            submitForm,
        };
    },
});
</script>