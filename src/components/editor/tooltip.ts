import { Tooltip, showTooltip, hoverTooltip } from "@codemirror/view"
import { StateField } from "@codemirror/state"
import { EditorState } from "@codemirror/state";
import { EditorView } from "codemirror";
import { requestHint } from "@/api/tools";
import createMessage from "./tooltip-utils";
const cursorTooltipField = StateField.define<readonly Tooltip[]>({
  create: getCursorTooltips,

  update(tooltips, tr) {
    if (!tr.docChanged && !tr.selection) return tooltips
    return getCursorTooltips(tr.state)
  },

  provide: f => showTooltip.computeN([f], state => state.field(f))
})

function getCursorTooltips(state: EditorState): readonly Tooltip[] {
  return state.selection.ranges
    .filter(range => range.empty)
    .map(range => {
      let line = state.doc.lineAt(range.head)
      let text = line.number + ":" + (range.head - line.from)
      return {
        pos: range.head,
        above: true,
        strictSide: true,
        arrow: true,
        create: () => {
          let dom = document.createElement("div")
          dom.className = "cm-tooltip-cursor"
          dom.textContent = text
          return { dom }
        }
      }
    })
}


const cursorTooltipBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-cursor": {
    backgroundColor: "#66b",
    color: "white",
    border: "none",
    padding: "2px 7px",
    borderRadius: "4px",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#66b"
    },
    "& .cm-tooltip-arrow:after": {
      borderTopColor: "transparent"
    }
  }
})

export function cursorTooltip() {
  return [cursorTooltipField, cursorTooltipBaseTheme]
}


export const wordHoverConstructor = (vue: any) => {
  return hoverTooltip(async (view, pos, side) => {
    let { from, to, text } = view.state.doc.lineAt(pos)
    let start = pos, end = pos
    while (start > from && /\w/.test(text[start - from - 1])) start--
    while (end < to && /\w/.test(text[end - from])) end++
    if (start == pos && side < 0 || end == pos && side > 0)
      return null
    console.log(vue)
    let textShown = text.slice(start - from, end - from)
    let hint: any = []
    if (vue != null) {
      const code = vue.code as string
      const file = vue.file as string
      hint = await requestHint({ code, pos, file })

      textShown = JSON.stringify(hint)
    }
    console.log(textShown)
    return {
      pos: start,
      end,
      above: true,
      create(view) {
        let dom = document.createElement("div")
        // dom.textContent = textShown
        // const div2 = document.createElement("div")
        // dom.appendChild(div2)
        createMessage(dom, hint.data)
        return { dom }
      }
    }
  })
}