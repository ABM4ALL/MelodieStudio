<template>
  <div class="term-outer" v-resize="onResize">
    <div :id="elemID" class="terminal" />
  </div>
</template>

<style scoped>
.term-outer {
  height: 100%;
}

.termview-header {
  height: 24px;
}

.term-outer :deep(.terminal) {
  height: calc(100% - 24px);
}
.term-outer :deep(.xterm) {
  height: 100%;
}
</style>

<script lang="ts">
import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { addOnMessageHandler, sendPtyCommand } from "@/api/ws";
import { defineComponent, ref } from "vue";
import { registerOnRunCommand } from "./terminal_events";
import { resizePTY } from "@/api/tools";
export default defineComponent({
  name: "Xterm",

  props: {
    socketURI: {
      type: String,
      default: "",
    },
    cmd: {
      type: String,
      default: "zsh",
    },
    termID: {
      type: String,
      required: true,
    },
  },
  directives: {
    // 使用局部注册指令的方式
    resize: {
      // 指令的名称
      mounted(el, binding) {
        // el为绑定的元素，binding为绑定给指令的对象
        let width = "",
          height = "";
        function isReize() {
          const style = document!.defaultView!.getComputedStyle(el);
          if (width !== style.width || height !== style.height) {
            if (style.width.endsWith("px") && style.height.endsWith("px")) {
              binding.value(); // 关键
            }
          }
          width = style.width;
          height = style.height;
        }
        el.__vueSetInterval__ = setInterval(isReize, 1000);
      },
      unmounted(el) {
        clearInterval(el.__vueSetInterval__);
      },
    },
  },
  setup() {
    return {
      elemID: `terminal-${Math.random() + Date.now()}`,
      term: null as Terminal | null,
      fitAddon: null as FitAddon | null,
      // termID: ref(""),
      initialized: ref(false),
      timer: -1,
      observer: null as MutationObserver | null,
    };
  },
  // beforeMount() {

  // },
  mounted() {
    this.initTerm();
    this.term?.writeln("Welcome! Press Enter to start terminal interaction!");
  },
  beforeUnmount() {
    this.term!.dispose();
    this.observer?.disconnect();
  },
  methods: {
    onResize() {
      if (this.term != null) {
        this.fitAddon?.fit();
        resizePTY(this.termID, this.term.rows, this.term.cols);
      }
    },
    initTerm() {
      const term = new Terminal({
        fontSize: 14,
        cursorBlink: true,
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      const elem = document.getElementById(this.elemID)!;
      term.open(elem);
      fitAddon.fit();
      this.fitAddon = fitAddon;
      term.focus();
      this.term = term;
      term.onData((data) => {
        console.log("key pressed in browser:", data);
        sendPtyCommand(this.termID, data, "cmd-pty");
        //    this.socket.emit("pty-input", { input: data });
      });
      registerOnRunCommand((cmd: string) => {
        this.injectCMD(cmd);
      });
      addOnMessageHandler(
        "pty-output",
        (msg: { output: string; termID: string }) => {
          console.log("recv msg", msg);
          if (this.term != null && this.termID == msg.termID) {
            this.term.write(msg.output);
          }
        }
      );

      addOnMessageHandler(
        "pty-status-change",
        (msg: { output: string; termID: string }) => {
          if (this.term != null && this.termID == msg.termID) {
            console.log("status changed!", msg);
          }
        }
      );
    },
    injectCMD(cmd: string) {
      if (this.term != null) {
        this.term.writeln(cmd);
        sendPtyCommand(this.termID, cmd + "\n", "cmd-pty");
      }
    },
  },
});
</script>