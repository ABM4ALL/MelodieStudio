<template>
  <div>
    <div class="context" v-html="compiledMarkdown"></div>
  </div>
</template>
  
<script>
import { getFile } from "@/api/fs";
import { marked } from "marked";
// import hljs from "highlight.js";
import hljs from "highlight.js/lib/core";
import Python from "highlight.js/lib/languages/python.js";
hljs.registerLanguage("python", Python);

import "highlight.js/styles/vs.css"; // 引入高亮样式 这里我用的是sublime样式

export default {
  name: "MarkdownViewer",
  props: {
    wsHost: { type: String, required: true },
    file: { type: String, required: false },
  },
  data() {
    return {
      articleDetail: {
        context: "",
      }, //数据，可以从数据库中读取
    };
  },

  computed: {
    compiledMarkdown() {
      return marked.parse(this.articleDetail.context);
    },
  },
  mounted() {
    let rendererMD = new marked.Renderer();
    marked.setOptions({
      renderer: rendererMD,

      highlight: function (code) {
        return hljs.highlightAuto(code).value;
      },
      baseUrl: `/api/fs/getFileByPath/`,
      pedantic: false,
      gfm: true,
      tables: true,
      breaks: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      xhtml: false,
    });
    let fileName = "";
    if (this.file != null) {
      fileName = this.file;
    } else if (this.$route.query.file != null) {
      fileName = this.$route.query.file;
    } else {
      throw Error("No file defined for this markdown viewer");
    }
    getFile(fileName).then((content) => {
      this.articleDetail.context = content;
    });
  },
  watch: {
    $route: {
      handler: function (val, oldVal) {
        console.debug("route changed", this.$route);
        // let fileName =
        //     this.$route.query.file == null ? "README.md" : this.$route.query.file;
        // this.articleDetail.context = this.readFile("docs/" + fileName);
      },
      // 深度观察监听
      deep: true,
    },
  },
};
</script>
  
<style scoped>
.context {
  text-align: left;
  padding: 20px;
  font-size: 1.4em;
}

.context :deep(pre) {
  background-color: #f8f8f8;
  padding-left: 5px;
}

.context :deep(img) {
  width: 80%;
  border: 1px solid;
}
</style>
  