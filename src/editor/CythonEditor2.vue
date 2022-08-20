<template>
  <codemirror
    v-model="code"
    placeholder="Code goes here..."
    :style="{ height: '400px' }"
    :autofocus="true"
    :indent-with-tab="true"
    :tab-size="4"
    :extensions="extensions"
    @ready="log('ready', $event)"
    @change="log('change', $event)"
    @focus="log('focus', $event)"
    @blur="log('blur', $event)"
    ref="editor"
    class="editor"
  />
</template>

<script lang="ts">
import { Codemirror } from "vue-codemirror";
// import { python } from "./python";
import { StreamLanguage } from "@codemirror/language";
import { lua } from "@codemirror/legacy-modes/mode/lua";
import { python, cython } from "@codemirror/legacy-modes/mode/python";

import { oneDark } from "@codemirror/theme-one-dark";
import { ref } from "vue";
import { EditorView, basicSetup } from "codemirror";
import { CompletionContext } from "@codemirror/autocomplete";
import { CompletionHandler } from "./completion";
import { requestAutoComplete } from "@/api/tools";
const comphandler = new CompletionHandler();

export default {
  components: {
    Codemirror,
  },
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

    // console.log(cython.languageData!.autocomplete);

    //   cython.languageData.of({
    //     autocomplete: myCompletions,
    //   });
    // } else console.log("language data null");
    const extensions = [basicSetup, StreamLanguage.define(cython)];

    return {
      code,
      extensions,
      log: console.log,
    };
  },
  mounted() {
    console.log(this.$refs["editor"]);
    const myCompletions = async (context: CompletionContext) => {
      let word = context.matchBefore(/[.\w]*/);
      const wordToMatch = context.matchBefore(/[\w]*/);
      console.log("context", word?.text, word.from, word.to, context.pos);
      if (word.from == word.to && !context.explicit) return null;
      //   const text: string[] = (context.state.doc as any).text;
      const res = await requestAutoComplete({
        code: this.code,
        pos: context.pos,
      });
      console.log("res", res);
      return {
        from: wordToMatch?.from,
        options: res.data, //.concat(comphandler.getCompletion("", 0, 0)),
        filter: false,
      };
    };
    cython.languageData!.autocomplete = myCompletions;
  },
};
</script>
<style scoped>
.editor :deep(.cm-editor) {
  width: 100%;
}
</style>