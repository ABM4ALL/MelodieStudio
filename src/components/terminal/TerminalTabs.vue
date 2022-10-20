<template>
  <el-tabs v-model="currentTermID" :class="{ 'mld-terminal-tabs': true }" @tab-click="handleTabClick">
    <el-tab-pane :name="term.id" v-for="term in terms" :key="term.id">
      <template #label>
        <el-popover placement="bottom-start" :width="200" trigger="hover" :show-after="500">
          <template #reference>
            <span class="term-label">
              <div :class="{
                'status-indicator': true,
                'term-open': !term.closed,
                'term-closed': term.closed,
              }"></div>
              <span style="margin-left: 6px">{{ term.name }}</span>
            </span>
          </template>
          Status: {{ term.closed ? "Stopped" : "Running" }}
          <icon-button v-if="term.closed" @click="onRestartRequest(term.id)" icon="run" text="Restart"></icon-button>
          <icon-button v-else @click="onCloseRequest(term.id)" icon="stop" text="Soft stop"></icon-button>
          <!-- <el-button v-if="term.closed">Restart</el-button> -->
          <!-- <el-button v-else >Stop</el-button> -->
        </el-popover>
      </template>
      <terminal-view :termID="term.id" :ref="term.id"></terminal-view>
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts">
import TerminalView from "./TerminalView.vue";
import IconButton from "@/components/basic/IconButton.vue";
import { allActivePTYs, closePTY } from "@/api/tools";
import { createPTY } from "@/api/tools";
import { ElNotification, TabsPaneContext } from "element-plus";
import { defineComponent } from "vue-demi";
import { registerOnRunCommandRequest } from "../events/globalevents";
import { addOnMessageHandler } from "@/api/ws";
import store from "@/store";
import { TerminalType } from "@/models/models";
import { formatTerminalCommand, getSystemTerminal } from "./terminal_utils";

export default defineComponent({
  components: { TerminalView, IconButton },
  data() {
    return {
      currentTermID: "",
      terms: [] as TerminalType[],
    };
  },
  methods: {
    handleTabClick(tab: TabsPaneContext) {
      console.log(tab);
    },
    sendCommand(termID: string, terminal: string) {
      const terminalVue = (this.$refs[termID] as any)[0];
      console.log("terminal", terminalVue);
      (terminalVue as any).injectCMD(terminal);
    },
    findIdleTermTab() {
      return this.terms.find((term) => term.closed);
    },
    onCloseRequest(termID: string) {
      closePTY(termID);
    },
    onRestartRequest(termID: string) {
      const currentTerm = this.terms.find((term) => term.id == termID);
      if (currentTerm == null) {
        throw Error("Current term was null");
      }
      createPTY(currentTerm.command, currentTerm.name).then(
        (newPTY: TerminalType) => {
          currentTerm.closed = newPTY.closed;
          currentTerm.id = newPTY.id;
          this.currentTermID = newPTY.id;
        }
      );
    },
  },
  beforeMount() {
    allActivePTYs().then((ptys: TerminalType[]) => {
      console.log("ptys", ptys);
      if (ptys.length == 0) {
        createPTY(getSystemTerminal(), "Terminal")
          .then((terminal: TerminalType) => {
            console.log("created pty:", terminal.id, terminal);
            ElNotification.success("PTY connection success!");
            this.terms = [terminal];
            this.currentTermID = terminal.id;
          })
          .catch(() => {
            ElNotification.error("Error when creating PTY!");
          });
      } else {
        this.currentTermID = ptys[0].id;
        this.terms = ptys;
      }
    });

    registerOnRunCommandRequest(({ cmd, termName }) => {
      if (termName == null || termName == "") {
        ElNotification.error(`Terminal name undefined for command ${cmd}!`);
        return;
      }
      createPTY(
        formatTerminalCommand( `cd ${(store.state as any).controls.cwd} &&` + cmd),
        termName
      )
        .then((terminal: TerminalType) => {
          console.log("created pty:", terminal.id, terminal);
          ElNotification.success("PTY connection success!");
          const idleTerm = this.findIdleTermTab();
          if (idleTerm == null) {
            this.terms.push(terminal);
          } else {
            idleTerm.id = terminal.id;
            idleTerm.name = termName;
            idleTerm.closed = false;
          }
          this.currentTermID = terminal.id;
        })
        .catch(() => {
          ElNotification.error("Error when creating PTY!");
        });
    });
    addOnMessageHandler(
      "pty-status-change",
      (msg: { output: string; termID: string }) => {
        const term = this.terms.find((term) => term.id == msg.termID);
        if (term != null) {
          term.closed = true;
        }
      }
    );
  },
});
</script>

<style scoped>
.mld-terminal-tabs .el-tabs__header {
  margin: 0 0;
}

.term-label {
  display: flex;
  align-items: center;
}

.status-indicator {
  height: 12px;
  width: 12px;
  border-radius: 6px;
  display: inline-block;
}

.term-open {
  background-color: #11cb25;
}

.term-closed {
  background-color: #ce2a2a;
}
</style>