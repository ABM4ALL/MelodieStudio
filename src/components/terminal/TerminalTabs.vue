<template>
  <el-tabs
    v-model="currentTermID"
    class="mld-terminal-tabs"
    @tab-click="handleTabClick"
  >
    <el-tab-pane
      label="User"
      :name="termID"
      v-for="termID in termIDs"
      :key="termID"
    >
      <terminal-view :termID="termID" :ref="termID"></terminal-view>
    </el-tab-pane>
  </el-tabs>
</template>

<script lang="ts">
import { allActivePTYs } from "@/api/tools";
import TerminalView from "./TerminalView.vue";
import { createPTY } from "@/api/tools";
import { ElNotification, TabsPaneContext } from "element-plus";
import { defineComponent } from "vue-demi";
import { registerOnRunCommandRequest } from "../events/globalevents";
export default defineComponent({
  components: { TerminalView },
  data() {
    return {
      currentTermID: "",
      termIDs: [] as string[],
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
  },
  beforeMount() {
    allActivePTYs().then((ptys: string[]) => {
      console.log("ptys", ptys);
      if (ptys.length == 0) {
        createPTY("bash")
          .then((terminal: { termID: string }) => {
            console.log("created pty:", terminal.termID, terminal);
            ElNotification.error("PTY connection success!");
            this.termIDs = [terminal.termID];
          })
          .catch(() => {
            ElNotification.error("Error when creating PTY!");
          });
      } else {
        this.termIDs = ptys;
      }
    });

    registerOnRunCommandRequest((cmd: string) => {
      console.log(cmd);
      // return;
      createPTY(["bash", "-c", cmd])
        .then((terminal: { termID: string }) => {
          console.log("created pty:", terminal.termID, terminal);
          ElNotification.error("PTY connection success!");
          this.termIDs.push(terminal.termID);
          this.currentTermID = terminal.termID;
          // window.setTimeout(() => {
          //   this.sendCommand(terminal.termID, cmd + "&& exit");
          // }, 1000);
        })
        .catch(() => {
          ElNotification.error("Error when creating PTY!");
        });
    });
  },
});
</script>

<style scoped>
.mld-terminal-tabs .el-tabs__header {
  margin: 0 0;
}
</style>