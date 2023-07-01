import "./io-variable.css"
import { AnchorConfig, BaseNodeModel, HtmlNode, HtmlNodeModel, h } from "@logicflow/core";

export class BaseIOVariableNode extends HtmlNode {
  /**
   * 1.1.7版本后支持在view中重写锚点形状。
   * 重写锚点新增
   */
  getAnchorShape(anchorData) {
    const { x, y, type } = anchorData;
    return h("rect", {
      x: x - 5,
      y: y - 5,
      width: 10,
      height: 10,
      className: `custom-anchor ${type === "left" ? "incomming-anchor" : "outgoing-anchor"
        }`
    });
  }
  setHtml(rootEl) {
    rootEl.innerHTML = "";
    const {
      properties: { tableName, inputs, outputs }
    } = this.props.model;
    rootEl.setAttribute("class", "table-container");
    const container = document.createElement("div");
    container.className = `table-node table-color-${Math.ceil(
      Math.random() * 4
    )}`;
    const tableNameElement = document.createElement("div");
    tableNameElement.innerText = tableName;
    tableNameElement.className = "table-name";
    container.appendChild(tableNameElement);
    const fragment = document.createDocumentFragment();

    const rows = Math.max(inputs.length, outputs.length)

    for (let i = 0; i < rows; i++) {
      const itemElement = document.createElement("div");
      itemElement.className = "table-feild";
      const itemKey = document.createElement("span");
      itemKey.innerText = inputs[i] != null ? inputs[i].name : "";
      const itemType = document.createElement("span");
      itemType.innerText = outputs[i] != null ? outputs[i].name : "";
      itemType.className = "feild-type";
      itemElement.appendChild(itemKey);
      itemElement.appendChild(itemType);
      fragment.appendChild(itemElement);
    }
    container.appendChild(fragment);
    rootEl.appendChild(container);
  }
}

export class BaseIOVariableNodeModel extends HtmlNodeModel {
  /**
   * 给model自定义添加字段方法
   */
  addAnchor(item, dir: "in" | "out") {
    if (dir == "in") {
      this.properties.inputs.unshift(item);
    } else {
      this.properties.outputs.unshift(item);
    }
    this.setAttributes();
    // 为了保持节点顶部位置不变，在节点变化后，对节点进行一个位移,位移距离为添加高度的一半。
    this.move(0, 24 / 2);
    // 更新节点连接边的path
    this.incoming.edges.forEach((egde) => {
      // 调用自定义的更新方案
      egde.updatePathByAnchor();
    });
    this.outgoing.edges.forEach((edge) => {
      // 调用自定义的更新方案
      edge.updatePathByAnchor();
    });
  }
  getDefaultIO(): { inputs: { name: string, type: string }[], outputs: { name: string, type: string }[] } {
    return {
      inputs: [],
      outputs: []
    }
  }

  getOutlineStyle() {
    const style = super.getOutlineStyle();
    style.stroke = "none";
    style.hover!.stroke = "none";
    return style;
  }
  // 如果不用修改锚地形状，可以重写颜色相关样式
  getAnchorStyle(anchorInfo) {

    const style = super.getAnchorStyle(undefined);
    if (anchorInfo == null) {
      return style
    }
    if (anchorInfo.type === "left") {
      style.fill = "red";
      style.hover.fill = "transparent";
      style.hover.stroke = "transpanrent";
      style.className = "lf-hide-default";
    } else {
      style.fill = "green";
    }
    return style;
  }
  setAttributes() {
    this.width = 200;
    const {
      properties
    } = this;
    if (properties.inputs == null) {
      properties.inputs = this.getDefaultIO().inputs
    }
    if (properties.outputs == null) {
      properties.outputs = this.getDefaultIO().outputs
    }
    const height = Math.max(properties.inputs.length, properties.outputs.length)

    this.height = 60 + height * 24;
    const circleOnlyAsTarget = {
      message: "只允许从右边的锚点连出",
      validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
        return sourceAnchor.type === "right";
      }
    };
    this.sourceRules.push(circleOnlyAsTarget);
    this.targetRules.push({
      message: "只允许连接左边的锚点",
      validate: (source?: BaseNodeModel, target?: BaseNodeModel, sourceAnchor?: AnchorConfig, targetAnchor?: AnchorConfig) => {
        if (targetAnchor != null) {
          return targetAnchor.type === "left";
        } else {
          throw Error("target Anchor was null")
        }
      }
    });
  }
  getDefaultAnchor() {
    const {
      id,
      x,
      y,
      width,
      height,
      isHovered,
      isSelected,
      properties: { fields, isConnection, inputs, outputs }
    } = this;
    console.log("inputs", inputs, "outputs", outputs)
    const anchors: any[] = [];
    inputs.forEach((feild, index) => {
      // 如果是连出，就不显示左边的锚点
      anchors.push({
        x: x - width / 2 + 10,
        y: y - height / 2 + 60 + index * 24,
        id: `${id}_${feild.name}_left`,
        edgeAddable: false,
        type: "left"
      });
    });
    outputs.forEach((field, index) => {
      anchors.push({
        x: x + width / 2 - 10,
        y: y - height / 2 + 60 + index * 24,
        id: `${id}_${field.name}_right`,
        type: "right"
      });
    })
    return anchors;
  }
}

export default {
  type: "io-variable-node",
  model: BaseIOVariableNodeModel,
  view: BaseIOVariableNode
};
