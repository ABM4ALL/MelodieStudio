<template>
  <codemirror v-model="code" placeholder="Code goes here..." :style="{ height: '400px' }" :autofocus="true"
    :indent-with-tab="true" :tab-size="4" :extensions="extensions" @ready="handleReady" @change="textChanged($event)"
    @focus="log('focus', $event)" @blur="log('blur', $event)" @keydown="onKeyDown" ref="editor" class="editor" />
</template>

<script lang="ts">
import { Codemirror } from "vue-codemirror";
// import { python } from "./python";
import { StreamLanguage } from "@codemirror/language";
import { lua } from "@codemirror/legacy-modes/mode/lua";
import { python, cython } from "@codemirror/legacy-modes/mode/python";

import { oneDark } from "@codemirror/theme-one-dark";
import { defineComponent, ref, shallowRef } from "vue";
import { EditorView, basicSetup } from "codemirror";
import { CompletionContext } from "@codemirror/autocomplete";
import { CompletionHandler } from "./completion";
import { requestAutoComplete } from "@/api/tools";
import { readFile } from "@/utils/utils";
import { ElNotification } from "element-plus";
import { getFile, writeFile } from "@/api/fs";
// import { StateEffect } from "@codemirror/state";
import { Compartment } from "@codemirror/state";
const comphandler = new CompletionHandler();
import { keymap } from "@codemirror/view";

import { cursorTooltip, wordHover, wordHoverConstructor } from "./tooltip";



const keyAction = new Compartment();
const saveOnEnter = keymap.of([
  {
    key: "Cmd-K",
    run: () => {
      alert("Saving...");
      return true;
    },
    preventDefault: true,
  },
]);

export default defineComponent({
  components: {
    Codemirror,
  },
  props: {
    file: {
      type: String,
      required: true,
    },
  },
  emits: ["unsaved"],
  setup() {
    const code = ref(`
from typing import TYPE_CHECKING

import numpy as np
from Melodie import DataLoader

from source import data_info

if TYPE_CHECKING:
    from .scenario import CovidScenario


class CovidDataLoader(DataLoader):
    def setup(self):
        self.load_dataframe(data_info.simulator_scenarios)
        self.load_dataframe(data_info.id_age_group)
        self.load_dataframe(data_info.id_health_state)
        self.load_dataframe(data_info.id_vaccination_trust)
        self.load_matrix(data_info.grid_stay_prob)
        self.generate_agent_dataframe()

    @staticmethod
    def init_age_group(scenario: 'CovidScenario'):
        young_percentage = scenario.young_percentage
        age_group = 0
        if np.random.uniform(0, 1) > young_percentage:
            age_group = 1
        return age_group

    @staticmethod
    def init_health_state(scenario: 'CovidScenario'):
        infection_percentage = scenario.initial_infected_percentage
        health_state = 0
        if np.random.uniform(0, 1) < infection_percentage:
            health_state = 1
        return health_state

    @staticmethod
    def init_vaccination_trust_state(scenario: 'CovidScenario'):
        vaccination_trust_percentage = scenario.vaccination_trust_percentage
        vaccination_trust_state = 0
        if np.random.uniform(0, 1) < vaccination_trust_percentage:
            vaccination_trust_state = 1
        return vaccination_trust_state

    def generate_agent_dataframe(self):
        with self.dataframe_generator(
            data_info.agent_params,
            lambda scenario: scenario.agent_num
        ) as g:
            def generator_func(scenario: "CovidScenario"):
                return {
                    "id": g.increment(),
                    "age_group": self.init_age_group(scenario),
                    "health_state": self.init_health_state(scenario),
                    "vaccination_trust_state": self.init_vaccination_trust_state(scenario)
                }
            g.set_row_generator(generator_func)
`);






    // extensions.push(cursorTooltip());
    const editor = shallowRef<EditorView | null>(null);

    return {
      lastCode: "",
      code,
      extensions: [] as any[],
      changedRecently: false,
      log: console.log,
      timer: -1,
      editor: editor,
    };
  },
  beforeMount() {
    const extensions: any[] = [
      basicSetup,
      StreamLanguage.define(cython),
      keyAction.of(saveOnEnter),
      wordHoverConstructor(this)
    ];
    this.extensions = extensions;
    
    if (this.file != null) {
      getFile(this.file).then((resp: string) => {
        if (resp != null) {
          this.code = resp;
          this.lastCode = this.code;
        } else {
          ElNotification.error(
            "Cannot read from file " + this.file + `\n Errors: ` + resp
          );
        }
      });
    }
  },
  methods: {
    textChanged() {
      this.changedRecently = true;
    },
    async onSave() {
      await writeFile(this.file, this.code).then(() => {
        this.changedRecently = false;
        this.lastCode = this.code;
        this.$emit("unsaved", false);
      });
    },
    keyHandled(evt: any) {
      console.log(evt);
    },
    onKeyDown(evt: KeyboardEvent) {
      // console.log(evt);
      if (evt.key == "s" && (evt.metaKey || evt.ctrlKey)) {
        console.log("save!")
        this.onSave()
        evt.preventDefault();
      }
    },
    handleReady({ view, state, container }) {
      this.editor = view;
      console.log(view, state, container);
      console.log(this.editor);
      // view.dispatch({
      //   effects: StateEffect.reconfigure.of(
      //     keymap.of([
      //       {
      //         key: "K",
      //         preventDefault: true,
      //         run() {
      //           console.log("aaaaaaaaaa");
      //           return true;
      //         },
      //       },
      //     ])
      //   ),
      // });
      // const map = {
      //   "Ctrl+K": function (cm) {
      //     console.log("cm", cm);
      //   },
      // };
      // view.addKeyMap(map);
    },
  },
  mounted() {

    this.timer = window.setInterval(() => {
      console.log(this.changedRecently, this.code != this.lastCode);
      if (this.changedRecently && this.code != this.lastCode) {
        this.$emit("unsaved", true);
      }
    }, 1000);
    const compStatus = {
      lastWordToPull: "",
      lastPulledCompletions: [] as { label: string }[],
      lastPullPos: 0,
    }
    const myCompletions = async (context: CompletionContext) => {
      let word = context.matchBefore(/[.\w]*/);
      const wordToMatch = context.matchBefore(/[\w]*/);
      if (word == null) {
        return;
      }
      if (word.from == word.to && !context.explicit) return null;

      const lastChar = word.text.at(-1)
      console.log(lastChar, wordToMatch, compStatus,
        lastChar != null, /[\w]*/.test(lastChar!), wordToMatch != null, wordToMatch!.text.startsWith(compStatus.lastWordToPull));
      if (lastChar != null && /\w/.test(lastChar) && wordToMatch != null && wordToMatch.text.startsWith(compStatus.lastWordToPull)
        && compStatus.lastPullPos <= context.pos
      ) {
        const l: { label: string }[] = []
        for (const comp of compStatus.lastPulledCompletions) {
          if (comp.label.toLowerCase().startsWith(wordToMatch.text.toLowerCase())) {
            l.push(comp)
          }
        }
        console.log(l)
        return {
          from: wordToMatch?.from,
          options: l,
          filter: false,
        }
      } else {
        const res = await requestAutoComplete({
          code: this.code,
          pos: context.pos,
          file: this.file,
        });
        compStatus.lastPulledCompletions = res.data
        compStatus.lastWordToPull = wordToMatch!.text
        compStatus.lastPullPos = context.pos
        return {
          from: wordToMatch?.from,
          options: res.data,
          filter: false,
        };
      }
    };
    cython.languageData!.autocomplete = myCompletions;

  },
});
</script>
<style scoped>
.editor :deep(.cm-editor) {
  width: 100%;
  height: 100%;

}
</style>