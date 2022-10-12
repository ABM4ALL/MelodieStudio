export default function (app) {
    app.directive('focus', {
        mounted(el) {
            console.log('focus!')
            el.focus()
        }
    })
    app.directive('as-editor', {
        mounted(el, binding, vnode) {
            console.log('as-editor', el, binding, vnode, vnode.parent, vnode.componentInstance, vnode.$emit)
        }
    })
}