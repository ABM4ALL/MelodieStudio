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
import { AttachAddon } from "xterm-addon-attach";
import { addOnMessageHandler, send, sendPtyCommand } from "@/api/ws";
import { WSMessage } from "@/models/models";
import { defineComponent, ref } from "vue";

import { ElNotification } from "element-plus";
import store from "@/store";
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
            binding.value(); // 关键
          }
          width = style.width;
          height = style.height;
        }
        el.__vueSetInterval__ = setInterval(isReize, 300);
      },
      unmounted(el) {
        clearInterval(el.__vueSetInterval__);
      },
    },
  },
  setup() {
    return {
      elemID: `terminal-${Math.random() + Date.now()}`,
      socket: null as WebSocket | null,
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
    this.term?.writeln("Welcome!");
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
            // if (!this.initialized) {
            //   this.injectCMD(`cd ${(store.state as any).controls.cwd}`);
            //   this.initialized = true;
            // }
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
    socketOnOpen() {
      this.socket!.onopen = () => {
        // 链接成功后
        this.initTerm();
      };
    },
    socketOnClose() {
      this.socket!.onclose = () => {
        // console.log('close socket')
      };
    },
    socketOnError() {
      this.socket!.onerror = () => {
        // console.log('socket 链接失败')
      };
    },
  },
});
</script>