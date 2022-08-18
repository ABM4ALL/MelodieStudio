<template>
  <div
    :id="'editor-' + id"
    :class="{ editor: true, 'editor-readonly': readonly }"
  ></div>
</template>

<script lang="ts" setup>
import * as monaco from "monaco-editor";
import {
  onMounted,
  defineProps,
  watch,
  defineEmits,
  onBeforeUnmount,
} from "vue";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";
import "./cython.contribution";
import { readFile } from "@/utils/utils";
const props = defineProps({
  readonly: {
    type: Boolean,
    required: false,
    default: false,
  },
  modelValue: {
    type: String,
    required: false,
    default: "aaaaaaaaaaaaa",
  },
});
const id = Math.round(Math.random() * 10000).toString();
let monacoEditor: monaco.editor.IStandaloneCodeEditor | null = null;
function createDependencyProposals(range) {
  console.log(range);
  // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
  // here you could do a server side lookup
  return [
    {
      label: '"lodash"',
      kind: monaco.languages.CompletionItemKind.Function,
      documentation: "The Lodash library exported as Node.js modules.",
      insertText: '"lodash": "*"',
      range: range,
    },
    {
      label: '"express"',
      kind: monaco.languages.CompletionItemKind.Function,
      documentation: "Fast, unopinionated, minimalist web framework",
      insertText: '"express": "*"',
      range: range,
    },
    {
      label: '"mkdirp"',
      kind: monaco.languages.CompletionItemKind.Function,
      documentation: "Recursively mkdir, like <code>mkdir -p</code>",
      insertText: '"mkdirp": "*"',
      range: range,
    },
    {
      label: '"my-third-party-library"',
      kind: monaco.languages.CompletionItemKind.Function,
      documentation: "Describe your library here",
      insertText: '"${1:my-third-party-library}": "${2:1.2.3}"',
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
    },
  ];
}

watch(
  () => props.modelValue,
  () => {
    if (monacoEditor == null) {
      return;
    }
    monacoEditor.setValue(props.modelValue);
  }
);

const emit = defineEmits(["change"]);
let line = 1;
let existingDecos = [];
onMounted(() => {
  monaco.languages.registerCompletionItemProvider("json", {
    provideCompletionItems: function (model, position) {
      // find out if we are completing a property in the 'dependencies' object.
      //   var textUntilPosition = model.getValueInRange({
      //     startLineNumber: 1,
      //     startColumn: 1,
      //     endLineNumber: position.lineNumber,
      //     endColumn: position.column,
      //   });
      //   var match = textUntilPosition.match(
      //     /"dependencies"\s*:\s*\{\s*("[^"]*"\s*:\s*"[^"]*"\s*,\s*)*([^"]*)?$/
      //   );
      //   if (!match) {
      //     return { suggestions: [] };
      //   }
      let word = model.getWordUntilPosition(position);
      let range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      console.log(range);
      return {
        suggestions: createDependencyProposals(range),
      };
    },
  });

  monacoEditor = monaco.editor.create(
    document.getElementById("editor-" + id) as HTMLDivElement,
    {
      value: readFile("test.pyx")!,
      language: "cython",
      readOnly: props.readonly,
      wordWrap: "on",
    }
  );
  window.setInterval(() => {
    if (monacoEditor == null) {
      return;
    }
    const content = monacoEditor.getModel()!.getLineContent(line);
    console.log(content);
    existingDecos = monacoEditor.deltaDecorations(existingDecos, [
      {
        range: new monaco.Range(line, 1, line, content.length + 1),
        options: { inlineClassName: "myInlineDecoration" },
      },
      // {
      //   range: new monaco.Range(9, 1, 9, 24),
      //   options: { inlineClassName: "myInlineDecoration" },
      // },
    ]);
    line += 1;
  }, 1000);
  monacoEditor.onDidChangeModelContent(() => {
    if (monacoEditor == null) {
      return;
    }
    emit("change", monacoEditor.getValue());
  });
});

onBeforeUnmount(() => {
  if (monacoEditor == null) {
    return;
  }
  monacoEditor.dispose();
});
</script>

<style>
.myInlineDecoration {
  color: red !important;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: wavy;
  font-weight: bold;
  font-style: oblique;
}
.editor {
  height: 100vh;
  text-align: left;
  width: 100vw;
}
</style>

<style scoped>
.editor-readonly :deep(.inputarea) {
  visibility: hidden;
}
</style>
