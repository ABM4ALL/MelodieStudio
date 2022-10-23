import { time } from 'echarts'
import { createApp, onUnmounted } from 'vue'
// 弹窗组件单文件
import Message from './Tooltips.vue'

const createMessage = (el: HTMLDivElement, hint) => {
    // 获取body并且创建一个新的div节点
    console.log('created message!')
    const t0 = Date.now()
    // 这里我们return一个新的Vue实例并且将实例挂载到我们刚创建的DOM节点上
    const app = createApp(
        Message, { messages: hint }
    )
    app.mount(el)

    onUnmounted(() => {
        app.unmount()
    })
    console.log(Date.now() - t0)
}

export default createMessage