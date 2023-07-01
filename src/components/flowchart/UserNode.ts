import { GraphModel, HtmlNode, HtmlNodeModel, NodeConfig, NodeData } from "@logicflow/core";
import { createApp, ref, h, VNode, App } from "vue";
import VueNode from "./VueNode.vue";

class VueHtmlNode extends HtmlNode {
  isMounted: boolean
  r: VNode
  app: App
  constructor(props: { model: VueHtmlNodeModel }) {
    super(props);
    this.isMounted = false;
    this.r = h(VueNode, {
      properties: props.model.getProperties() as { t: number, style: any },
      text: props.model.inputData as any,
      onValueChange: (i) => {
        console.log('value', i)
        props.model.inputBlockValue = i
        props.model.properties['data'] = i
      },
      onBtnClick: (i) => {
        this.r.component!.props.text = String(
          Number(this.r.component!.props.text) + Number(i)
        );
        console.log('text', props.model)
        props.model.inputData = this.r.component!.props.text

      }
    });
    this.app = createApp({
      render: () => this.r
    });
  }
  setHtml(rootEl) {
    if (!this.isMounted) {
      this.isMounted = true;
      const node = document.createElement("div");
      rootEl.appendChild(node);
      this.app.mount(node);
    } else {
      this.r.component!.props.properties = this.props.model.getProperties();
    }
  }
}

class VueHtmlNodeModel extends HtmlNodeModel {
  constructor(data: NodeConfig, model: GraphModel) {
    super(data, model)
    console.log('data', data, model)
    console.log(this.inputData, this.properties)
  }

  setAttributes() {
    this.width = 300;
    this.height = 100;
    this.text.editable = false;
    this.inputData = this.text.value;
  }
  getDefaultAnchor() {
    const { width, height, x, y, id } = this;
    return [
      {
        x: x - width / 2,
        y,
        type: 'left',
        edgeAddable: false, // 控制锚点是否可以从此锚点手动创建连线。默认为true。
        id: `${id}_0`
      },
      {
        x: x + width / 2,
        y,
        type: 'right',
        id: `${id}_1`
      },
    ]

  }
  getData() {
    const data = super.getData();
    data.inputData = this.inputData
    data.inputBlockValue = this.inputBlockValue
    console.log(data)
    return data;
  }
}

export default {
  type: "UserNode",
  model: VueHtmlNodeModel,
  view: VueHtmlNode
};
