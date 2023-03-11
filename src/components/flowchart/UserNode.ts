import { HtmlNode, HtmlNodeModel } from "@logicflow/core";
import { createApp, ref, h, VNode, App } from "vue";
import VueNode from "./VueNode.vue";

class VueHtmlNode extends HtmlNode {
  isMounted: boolean
  r: VNode
  app: App
  constructor(props) {
    super(props);
    this.isMounted = false;
    this.r = h(VueNode, {
      properties: props.model.getProperties(),
      text: props.model.inputData,
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
  // getText() {
  //   return null;
  // }
}

class VueHtmlNodeModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 300;
    this.height = 100;
    this.text.editable = false;
    this.inputData = this.text.value;
    // this.anchorsOffset = [
    //   [this.width / 2, 0],
    //   [0, this.height / 2],
    //   [-this.width / 2, 0],
    //   [0, -this.height / 2],
    // ]
  }
  // getOutlineStyle() {
  //   const style = super.getOutlineStyle();
  //   style.stroke = "none";
  //   style.hover!.stroke = "none";
  //   return style;
  // }
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
    data.text = this.inputData
    console.log(data)
    // data.text!.value = this.inputData;
    return data;
  }
}

export default {
  type: "UserNode",
  model: VueHtmlNodeModel,
  view: VueHtmlNode
};
