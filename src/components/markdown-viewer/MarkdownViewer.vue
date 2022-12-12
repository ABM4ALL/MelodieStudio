<template>
    <div>
        <div class="context" v-html="compiledMarkdown"></div>
    </div>
</template>
  
<script>
import { getFile } from "@/api/fs"
import { marked } from "marked";
// import hljs from "highlight.js";
import hljs from "highlight.js/lib/core";
import Python from "highlight.js/lib/languages/python.js";
hljs.registerLanguage("python", Python);

import "highlight.js/styles/vs.css"; // 引入高亮样式 这里我用的是sublime样式

const renderer = {
    link(href, title, text) {
        console.log(marked);
        return `
                <a class="anchor" href="/#/docs?file=${href}">
                  ${text}
                </a>
               `;
    },
};

export default {
    name: "MarkdownViewer",

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
        rendererMD.link = renderer.link;
        // marked.use(renderer)
        marked.setOptions({
            renderer: rendererMD,

            highlight: function (code) {
                return hljs.highlightAuto(code).value;
            },
            baseUrl: "http://127.0.0.1:8765/fs/",
            pedantic: false,
            gfm: true,
            tables: true,
            breaks: false,
            sanitize: false,
            smartLists: true,
            smartypants: false,
            xhtml: false,
        });
        let fileName =
            this.$route.query.file == null ? "README.md" : this.$route.query.file;
        //   this.articleDetail.context = this.readFile("docs/" + fileName);
        getFile("README.md").then((content) => {
            this.articleDetail.context = content
        })
    },
    // methods: {
    //   readFile(filePath) {
    //     // 创建一个新的xhr对象
    //     let xhr = null,
    //       okStatus = document.location.protocol === "file" ? 0 : 200;
    //     xhr = new XMLHttpRequest();
    //     xhr.open("GET", filePath, false);
    //     xhr.overrideMimeType("text/html;charset=utf-8");
    //     xhr.send(null);
    //     return xhr.status === okStatus ? xhr.responseText : null;
    //   },
    // },
    watch: {
        $route: {
            handler: function (val, oldVal) {
                console.debug("route changed", this.$route)
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
  