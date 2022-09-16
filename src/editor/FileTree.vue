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
      <el-button-group
        style="display: flex; flex-wrap: nowrap; margin-left: 8px"
      >
        <el-button @click="onDownload(selected)">
          <el-icon>
            <upload></upload>
          </el-icon>
        </el-button>
        <el-button
          @click="
            showDialog(
              selected.endsWith('/') ? selected : getDirName(selected) + '/'
            )
          "
        >
          <el-icon>
            <upload />
          </el-icon>
        </el-button>
        <el-button @click="onDelete(selected)">
          <el-icon>
            <delete />
          </el-icon>
        </el-button>
      </el-button-group>
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
            </div>
          </template>
          <div style="display: flex; flex-direction: column">
            <span> {{ data.absPath }}</span>
            <div style="display: flex">
              <el-button type="danger" @click="onDelete(data.absPath)"
                >删除</el-button
              >
              <el-button
                type="primary"
                @click.stop="
                  showDialog(
                    data.absPath.endsWith('/')
                      ? data.absPath
                      : getDirName(data.absPath) + '/'
                  )
                "
                >向此路径上传...</el-button
              >
              <el-button type="primary" @click="onDownload(data.absPath)"
                >下载</el-button
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
import { deleteFSItem, listDir } from "@/api/fs";
import { ElNotification } from "element-plus";
import { baseName, downloadFile, getDirName } from "@/utils/file";
import { Search, Upload, Download } from "@element-plus/icons-vue";
import store from "@/store";
import { addOnMessageHandler } from "@/api/ws";
const dialogShow = ref(false);
const fileList = ref<{ name: string }[]>([]);
const absPathToUpload = ref("");
const filterText = ref("");
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
    listDir(store.state!.cwd).then((data: FileTreeItem[]) => {
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
    console.log("msg", msg, msg.parent == store.state.cwd);
    if (msg.parent == store.state.cwd) {
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
  }else{
    return data.name.includes(value)
  }
};

watch(filterText, (val) => {
  treeRef.value!.filter(val);
});
// onMounted(() => {
//   window.setTimeout(() => {
//     expandTreeTo("result/");
//   }, 1000);
//   treeRef.value.getNode();
// });

// const onDownload = async (filePath: string) => {
//   const content = await getFile(filePath, false);
//   console.log(content);
//   const fileBaseName = baseName(filePath);

//   const file = new File([content], fileBaseName);
//   downloadFile(file);
// };
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
