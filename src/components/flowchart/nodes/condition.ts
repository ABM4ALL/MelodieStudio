import "./io-variable.css"
import { BaseIOVariableNode, BaseIOVariableNodeModel } from "./io-variable"
class ConditionNode extends BaseIOVariableNode {

}

class ConditionNodeModel extends BaseIOVariableNodeModel {
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
  getDefaultIO() {
    return {
      inputs: [{ name: "in", type: "integer" }],
      outputs: [{ name: "true", type: "" }, { name: "false", type: "" }]
    }
  }
}

export default {
  type: "condition-node",
  model: ConditionNodeModel,
  view: ConditionNode
};
