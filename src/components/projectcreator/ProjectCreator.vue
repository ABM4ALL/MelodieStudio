

<template>
  <div class="project-creator">
    <el-form label-position="top">
      <el-form-item label="Project Directory">
        <el-row style="width: 100%">
          <el-col :span="22">
            <el-input :readonly="true" v-model="config.directory"></el-input>
          </el-col>
          <el-col :span="2">
            <directory-selector
              @select-directory="directorySelected"
            ></directory-selector>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="Project Name">
        <el-input
          v-model="config.projectName"
          @change="onProjectNameChange"
        ></el-input>
      </el-form-item>
      <el-form-item label="Project Alias">
        <el-input v-model="config.projectNameAlias"></el-input>
      </el-form-item>
    </el-form>
    <el-divider></el-divider>
    <p>All project files will be placed at</p>
    <p>{{ config.directory }}/{{ config.projectName }}</p>
    <p>
      All classes related to this project will be named by default like this:
    </p>
    <p>
      {{ config.projectNameAlias }}Agent\{{
        config.projectNameAlias
      }}Environment\{{ config.projectNameAlias }}Model
    </p>
    <el-divider />
    <el-button @click="create">Create</el-button>
  </div>
</template>
<script setup lang="ts">
import { Folder, Document } from "@element-plus/icons-vue";
</script>

<script lang="ts">
import { defineComponent } from "vue";
import DirectorySelector from "./DirectorySelector.vue";
import { createNewProject } from "@/api/tools";
import { ElMessage } from "element-plus";
interface FSItem {
  name: string;
  type: string;
}

export default defineComponent({
  components: { DirectorySelector },
  data() {
    return {
      config: {
        directory: "",
        projectName: "",
        projectNameAlias: "",
      },
    };
  },
  methods: {
    directorySelected(dir: string) {
      console.log(dir);
      this.config.directory = dir;
    },
    onProjectNameChange() {
      console.log(this.config.projectName, this.config.projectNameAlias);
      if (this.config.projectNameAlias === "") {
        this.config.projectNameAlias = this.config.projectName;
      }
    },
    async create() {
      const resp = await createNewProject(this.config);

      if (resp.status === 0) {
        ElMessage.success(resp.data);
      } else {
        ElMessage.error(resp.msg);
      }
    },
  },
});
</script>

<style>
/* .project-creator .el-form-item__content{
    display: flex;
} */
</style>