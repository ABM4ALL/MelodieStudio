<template>
  <div id="xterm" class="xterm" />
</template>

<script lang="ts">
import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { AttachAddon } from "xterm-addon-attach";
import { addOnMessageHandler, send, sendPtyCommand } from "@/api/ws";
import { WSMessage } from "@/models/models";

export default {
  name: "Xterm",
  props: {
    socketURI: {
      type: String,
      default: "",
    },
    termID: {
      type: String,
      required: false,
      default: `default-terminal`,
    },
  },
  setup() {
    return {
      socket: null as WebSocket | null,
      term: null as Terminal | null,
    };
  },
  mounted() {
    this.initTerm();
    this.term?.writeln("Welcome!");
    // this.initSocket();
  },
  beforeUnmount() {
    this.socket!.close();
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
      term.open(document.getElementById("xterm")!);
      fitAddon.fit();
      term.focus();
      this.term = term;
      term.onData((data) => {
        console.log("key pressed in browser:", data);
        sendPtyCommand(this.termID, data);
        //    this.socket.emit("pty-input", { input: data });
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
};
</script>