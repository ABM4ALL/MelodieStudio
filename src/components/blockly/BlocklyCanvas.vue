<template>
    <div>
        <button @click="getJavascriptCode">获取javascript code</button>
        <button @click="getWorkspaceXml">获取当前工作区xml</button>
        <div id="blocklyDiv" style="height: 800px; width: 100%;"></div>
    </div>
</template>
  
<script lang="ts">
import Blockly from 'blockly';
import { javascriptGenerator } from "blockly/javascript"
// import * as Ch from 'blockly/msg/zh-hans';
import { defineComponent } from "vue"
// Blockly.setLocale(Ch);
export default defineComponent({
    data() {
        return {
            workspace: null,
            toolboxXml: `
            <xml  style="height: 100%">
                 <category name="Logic" categorystyle="logic_category">
                      <block type="controls_if"></block>
                      <block type="logic_compare"></block>
                      <block type="logic_operation"></block>
                      <block type="logic_negate"></block>
                      <block type="logic_boolean"></block>
                      <block type="logic_null" disabled="true"></block>
                      <block type="logic_ternary"></block>
                      <block type="text_print"></block>
                  </category>
                  <category name="Math" categorystyle="math_category">
                        <block type="math_number" gap="32"></block>
                  </category>
              </xml>
           `
        }
    },
    mounted() {
        this.workspace = Blockly.inject('blocklyDiv', {
            toolbox: {
                "kind": "categoryToolbox",
                "contents": [
                    {
                        "kind": "category",
                        "name": "Control",
                        "contents": [
                            {
                                "kind": "block",
                                "type": "controls_if"
                            },
                            {
                                "kind": "block",
                                "type": "controls_whileUntil"
                            },
                            {
                                "kind": "block",
                                "type": "controls_for"
                            }
                        ]
                    },
                    {
                        "kind": "category",
                        "name": "Logic",
                        "contents": [
                            {
                                "kind": "block",
                                "type": "logic_compare"
                            },
                            {
                                "kind": "block",
                                "type": "logic_operation"
                            },
                            {
                                "kind": "block",
                                "type": "logic_boolean"
                            }
                        ]
                    }
                ]
            }
        });
        if (localStorage.getItem('workspaceXml')) {
            this.getLocalStorageXml();
        }
    },
    methods: {
        getJavascriptCode() {
            // console.log(Blockly.JavaScript, Blockly)
            let code = javascriptGenerator.workspaceToCode(this.workspace);
            console.log('--------Javascript code-------');
            console.log(code)
        },
        getWorkspaceXml() {
            var xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(this.workspace))
            localStorage.setItem('workspaceXml', xml)
            console.log('--------workspace xml-------');
            console.log(xml);
            console.log('当前工作区 xml 已保存到 localStorage 中...');
        },
        getLocalStorageXml() {
            let xml = localStorage.getItem('workspaceXml');
            Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), this.workspace)
        }
    }
})
</script>
  
  