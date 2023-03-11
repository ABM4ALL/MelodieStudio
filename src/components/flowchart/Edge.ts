import { PolylineEdge, PolylineEdgeModel, EdgeData } from "@logicflow/core";

interface EdgeDataWithAnchorID extends EdgeData {
    pointsList: {
        x: any;
        y: any;
    }[];
    sourceAnchorId: string
    targetAnchorId: string
}


class CustomEdgeModel2 extends PolylineEdgeModel {
    /**
     * 重写此方法，使保存数据是能带上锚点数据。
     */
    getData() {
        const data = super.getData() as EdgeDataWithAnchorID;
        data.sourceAnchorId = this.sourceAnchorId;
        data.targetAnchorId = this.targetAnchorId;
        return data;
    }
}

export default {
    type: "custom-edge",
    view: PolylineEdge,
    model: CustomEdgeModel2
};