<template>
  <svg :class="svgClass" aria-hidden="true">
    <!-- aria-hidden="true"为避免现代辅助技术错误的朗读该元素而产生的标签属性 -->
    <!-- xlink:href="iconName"为引入svg图片的名字 -->
    <use :xlink:href="iconName" />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";
const requireAll = (requireContext) =>
  requireContext.keys().map(requireContext);
const req = require.context("@/assets/icons", false, /\.svg$/);
/*
   第一个参数是:'./svg' => 需要检索的目录，
   第二个参数是：false => 是否检索子目录,
   第三个参数是: /\.svg$/ => 匹配文件的正则
  */
requireAll(req);
export default defineComponent({
  name: "SvgIcon",
  props: {
    className: {
      type: String,
      default: "",
    },
    svgIconName: {
      type: String,
      default: "",
    },
  },
  computed: {
    iconName() {
      return `#icon-${this.svgIconName}`;
    },
    svgClass() {
      if (this.className) {
        return "svg-icon " + this.className;
      } else {
        return "svg-icon";
      }
    },
  },
});
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
