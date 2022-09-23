<template>
  <div class="term-outer">
    <div class="termview-header">
      <p>Command:{{ cmd }}</p>
    </div>

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
import { createPTY } from "@/api/tools";
import { ElNotification } from "element-plus";
import store from "@/store";
import { registerOnRunCommand } from "./terminal_events";
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
  },
  setup() {
    return {
      elemID: `terminal-${Math.random() + Date.now()}`,
      socket: null as WebSocket | null,
      term: null as Terminal | null,
      termID: ref(""),
      initialized: ref(false),
    };
  },
  beforeMount() {
    createPTY(this.cmd)
      .then((cmd: { termID: string }) => {
        console.log("created pty:", cmd.termID, cmd);
        ElNotification.error("PTY connection success!");
        this.termID = cmd.termID;
      })
      .catch(() => {
        ElNotification.error("Error when creating PTY!");
      });
  },
  mounted() {
    this.initTerm();
    this.term?.writeln("Welcome!");
    // this.initSocket();
  },
  beforeUnmount() {
    this.term!.dispose();
  },
  methods: {
    initTerm() {
      const term = new Terminal({
        fontSize: 14,
        cursorBlink: true,
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(document.getElementById(this.elemID)!);
      fitAddon.fit();
      term.focus();
      this.term = term;
      term.onData((data) => {
        console.log("key pressed in browser:", data);
        sendPtyCommand(this.termID, data, "cmd-pty");
        //    this.socket.emit("pty-input", { input: data });
      });
      console.log("term-dim", fitAddon.proposeDimensions());
      
      registerOnRunCommand((cmd: string) => {
        this.injectCMD(cmd);
      });
      addOnMessageHandler(
        "pty-output",
        (msg: { output: string; termID: string }) => {
          console.log("recv msg", msg);
          if (this.term != null && this.termID == msg.termID) {
            this.term.write(msg.output);
            if (!this.initialized) {
              this.injectCMD(`cd ${(store.state as any).controls.cwd}`);
              this.initialized = true;
            }
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