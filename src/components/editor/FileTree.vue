<template>
  <div>
    <div class="tree-header">
      <el-input v-model="filterText" style="margin-left: 24px">
        <template #append>
          <el-button>
            <el-icon>
              <search />
            </el-icon>
          </el-button>
        </template>
      </el-input>
    </div>
    <el-tree
      :props="props"
      :load="loadNode"
      node-key="absPath"
      lazy
      ref="treeRef"
      class="file-tree"
      :filter-node-method="filterNode"
    >
      <template #default="{ data }">
        <el-popover
          trigger="contextmenu"
          :show-after="100"
          placement="right"
          :width="250"
        >
          <template #reference>
            <div
              :class="{
                'custom-tree-node': true,
                'selected-tree-node': data.absPath == selected,
              }"
              @contextmenu.stop="() => false"
              @dblclick="onNodeDoubleClick(data)"
              @click="onNodeClick(data)"
            >
              <span v-if="data.absPath !== ''">{{
                baseName(data.absPath)
              }}</span>
              <div style="flex-grow: 1"></div>
              <file-tree-buttons :absPath="data.absPath"></file-tree-buttons>
            </div>
          </template>
          <div style="display: flex; flex-direction: column">
            <span> {{ data.absPath }}</span>
            <div style="display: flex">
              <el-button type="danger" @click="onDelete(data.absPath)"
                >Delete</el-button
              >
              <el-button type="primary" @click="onCopy(data.absPath)"
                >Copy</el-button
              >
              <el-button type="primary" @click="onCut(data.absPath)"
                >Cut</el-button
              >
              <el-button
                type="primary"
                @click="onPaste(data.absPath)"
                :disabled="fileToCopyOrCut.absPath == ''"
                >Paste</el-button
              >
            </div>
          </div>
        </el-popover>
      </template>
    </el-tree>
  </div>

  <el-dialog v-model="dialogShow" :append-to-body="true">
    <p v-if="absPathToUpload != ''">上传到{{ absPathToUpload }}</p>
    <p v-else>上传到用户根目录</p>
    <el-upload
      ref="uploadRef"
      class="upload-demo"
      action="/dev-api/oss"
      v-model:file-list="fileList"
      :data="{
        path:
          fileList.length == 0 ? 'unknown' : absPathToUpload + fileList[0].name,
        userID: 1,
      }"
      :auto-upload="false"
      :limit="1"
      :on-success="onSuccess"
    >
      <template #trigger>
        <el-button type="primary">select file</el-button>
      </template>
      <el-button class="ml-3" type="success" @click="submitUpload">
        upload to server
      </el-button>
      <template #tip>
        <div class="el-upload__tip">
          jpg/png files with a size less than 500kb
        </div>
      </template>
    </el-upload>
  </el-dialog>
</template>

<script lang="ts" setup>
import { defineEmits, onMounted, ref, watch } from "vue";
import type Node from "element-plus/es/components/tree/src/model/node";
import { UploadInstance } from "element-plus";
import { copyFSItem, deleteFSItem, listDir } from "@/api/fs";
import { ElNotification } from "element-plus";
import { baseName, downloadFile, getDirName } from "@/utils/file";
import { Search, Upload, Download } from "@element-plus/icons-vue";
import store from "@/store";
import { addOnMessageHandler } from "@/api/ws";
import {
  FILETREE_ITEMTYPES,
  loadItemActions,
} from "./filetree-utils/filetree-items";
import FileTreeButtons from "./filetree-utils/FileTreeButtons.vue"
import { setOnOpenVisualizer } from "../events/globalevents";
const dialogShow = ref(false);
const fileList = ref<{ name: string }[]>([]);
const absPathToUpload = ref("");
const filterText = ref("");
const fileToCopyOrCut = ref<{ absPath: string; operation: "copy" | "cut" }>({
  absPath: "",
  operation: "copy",
});
let parentNodeToUpload = "";

export interface FileTreeItem {
  // ContentType: string,
  // etag: string,
  // filepath: string,
  // modtime: string,
  // size: number,
  type: "file" | "directory";
  name: string;
  absPath: string;
}

const emit = defineEmits(["open-file"]);

interface Tree {
  name: string;
  absPath: string;
  leaf?: boolean;
}

const props = {
  label: "absPath",
  isLeaf: "leaf",
};

const selected = ref("");
let root: Node | null = null;
// eslint-disable-next-line
const loadNode = (node: Node, resolve: (data: Tree[]) => void) => {
  if (node.level === 0) {
    root = node;
    listDir((store.state as any).controls.cwd).then((data: FileTreeItem[]) => {
      const l: Tree[] = [];
      if (data == null) {
        resolve(l);
        return;
      }
      console.log("data", data);
      data.forEach((ftItem: FileTreeItem) => {
        l.push({
          absPath: ftItem.absPath,
          name: ftItem.name,
          leaf: ftItem.type == "file",
        });
      });
      console.log(l);
      resolve(l);
    });
  } else {
    const nodeData: Tree = node.data as Tree;
    listDir(nodeData.absPath).then((data: FileTreeItem[]) => {
      const l: Tree[] = [];
      data.forEach((ftItem: FileTreeItem) => {
        l.push({
          absPath: ftItem.absPath,
          name: ftItem.name,
          leaf: ftItem.type == "file",
        });
      });
      resolve(l);
    });
  }
};

addOnMessageHandler(
  "fs-event",
  (msg: {
    type: "added" | "removed";
    parent: string;
    added?: FileTreeItem;
    removed?: FileTreeItem;
  }) => {
    console.log("msg", msg, msg.parent == (store.state as any).controls.cwd);
    if (msg.parent == (store.state as any).controls.cwd) {
      if (root == null) {
        throw Error("Root node was null");
      }
      root.loaded = false;

      root.expand();
    } else {
      const node = treeRef.value.getNode(msg.parent);
      if (node != null) {
        node.loaded = false;
        if (node.expanded) {
          node.expanded = false;
          node.expand();
        }
      }
    }
  }
);


const onNodeDoubleClick = (data: Tree) => {
  selected.value = data.absPath;
  emit("open-file", data.absPath);
};

const onNodeClick = (data: Tree) => {
  selected.value = data.absPath;
};

const uploadRef = ref<UploadInstance>();
const treeRef = ref<any>();
const submitUpload = () => {
  uploadRef.value!.submit();
};

const showDialog = (uploadPath: string) => {
  dialogShow.value = true;
  fileList.value = [];
  absPathToUpload.value = uploadPath;
  parentNodeToUpload = uploadPath;
};

const updateTree = (nodeName: string, dirName: string) => {
  console.log("node name and dirname", nodeName, dirName);
  if (dirName !== "/") {
    const node = treeRef.value.getNode(dirName);
    node.loaded = false;
    if (node.data.absPath != "") {
      node.expand();
    }
  } else {
    const node = root;
    console.log("root", root);
    if (node != null) {
      node.loaded = false;
      if (node.data.absPath != "") {
        node.expand();
      }
    }
    // const node = treeRef.value.getNode(nodeName);
    // treeRef.value.remove(node);
  }
};

const onSuccess = () => {
  dialogShow.value = false;
  ElNotification.success("上传成功！");
  // window.setTimeout(() => {
  //   const node = treeRef.value.getNode(parentNodeToUpload);
  //   node.loaded = false;
  //   if (node.data.absPath != "") {
  //     node.expand();
  //   }
  // }, 200);
  updateTree(absPathToUpload.value, parentNodeToUpload);
};

const expandTreeTo = async (path: string) => {
  const node = treeRef.value.getNode(path);
  if (!node.data.leaf) {
    node.expand();
  }
};

const onDelete = async (file: string) => {
  await deleteFSItem(file);
};

const filterNode = (value: string, data: Tree) => {
  if (value == "") {
    return true;
  } else {
    return data.name.includes(value);
  }
};

const onCopy = (absPath: string) => {
  fileToCopyOrCut.value = { absPath: absPath, operation: "copy" };
};

const onCut = (absPath: string) => {
  fileToCopyOrCut.value = { absPath: absPath, operation: "cut" };
};

const onPaste = (path: string) => {
  if (fileToCopyOrCut.value.operation == "copy") {
    copyFSItem(fileToCopyOrCut.value.absPath, path);
  } else {
    ElNotification.warning("Not implemented yet!");
  }
  fileToCopyOrCut.value.absPath = "";
};

watch(filterText, (val) => {
  treeRef.value!.filter(val);
});
</script>

<style scoped>
.tree-header {
  display: flex;
}

.tree-header :deep(.el-button) {
  padding: 0px;
  min-width: var(--el-component-size);
  max-width: var(--el-component-size);
  height: var(--el-component-size);
  margin-left: 0px;
}

.tree-header :deep(.el-input-group__append) {
  padding-left: 0px;
  padding-right: 24px;
}

.file-tree {
  background: none;
}
.file-tree :deep(.el-tree-node__content) {
  height: 24px;
  --item-height: 24px;
}

.custom-tree-node {
  height: 100%;
  width: 100%;
  border: 1px solid rgba(230, 230, 230, 1);
  background-color: #ffffff;
  border-radius: 2px;
  text-align: left;
  padding-left: 8px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.selected-tree-node {
  border: 1px solid rgba(0, 82, 217, 1);
}

.custom-tree-node span {
  line-height: var(--item-height);
  max-width: 400px;
  display: block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
