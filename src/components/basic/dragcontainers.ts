interface ContainerLayout {
    height: number;
    width: number;
    left: number;
    top: number;
}
export interface LayoutManager {
    [key: string]: ContainerLayout;
}
import { getLayout, saveLayout } from "@/api/chart";
import { ElMessage } from "element-plus";
let containerLayout: LayoutManager = {};
let needSave = false;
let timer = window.setInterval(async () => {
    if (needSave) {
        await saveLayout(containerLayout);
        needSave = false;
        ElMessage.success("Layout saved!");
    }
}, 3000);
let topPointer = 0;
let leftPointer = 0;
export const updateContainerLayout = (containerName: string, layout: ContainerLayout) => {
    containerLayout[containerName] = layout;
    console.log(containerLayout);
    needSave = true;
};

export const getContainersLayout = async () => {
    containerLayout = await getLayout();
    console.log(containerLayout);
};

const newLayout = (containerName: string): ContainerLayout => {
    if (containerName.indexOf("visualizer") != -1) {

        const layout = { left: 0, top: topPointer, width: 500, height: 500 };
        topPointer += 520;
        return layout;
    } else if (containerName.indexOf("chart") != -1) {
        const layout = { left: 0, top: topPointer, width: 500, height: 320 };
        topPointer += 320;
        return layout;
    } else {
        throw "Not implemented name: " + containerName;
    }

};

export const getContainerLayout = (containerName: string): ContainerLayout => {
    let layout = containerLayout[containerName];
    if (layout != null) {
        return layout;
    } else {
        layout = newLayout(containerName);
        containerLayout[containerName] = layout;
        return layout;
    }
};



