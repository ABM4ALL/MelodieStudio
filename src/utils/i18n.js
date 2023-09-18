import VueI18n, { createI18n } from 'vue-i18n'
const messages = {
    en: {
        message: {
            comma: ",",
            or: "or",
            edit: "edit",
            delete: "delete",
            newRecord: "New Record",
            importFile: "Import File",
            exportFile: "Export File",
            operation: "Operation",
            typeToSearch: "Type to Search",
            itemCount: "Items Count",
            ok: "Ok",
            cancel: "Cancel",
            delRecordSucc: "Record Deleted Successfully!",
            addRecordSucc: "Record Added Successfully!",
            updateRecordSucc: "Record Updated Successfully!",
            files: {
                dropFileHere: "Drop File Here",
                clickToUpload: "Click to Upload",
                pleaseUpload: "Please upload",
                fileExportStartedInBrowser: "Export has started, please view the file at the Downloaded list of your browser.",
            }
        }
    },
    zh: {
        message: {
            comma: "，",
            or: "或",
            edit: "编辑",
            delete: "删除",
            newRecord: "新增记录",
            importFile: "导入文件",
            exportFile: "导出文件",
            operation: "操作",
            typeToSearch: "输入过滤条件",
            itemCount: "计数",
            ok: "确定",
            cancel: "取消",
            delRecordSucc: "数据删除成功!",
            addRecordSucc: "数据添加成功!",
            updateRecordSucc: "数据更新成功!",
            files: {
                dropFileHere: "将文件拖拽到此处",
                clickToUpload: "点击上传",
                pleaseUpload: "请上传",
                fileExportStartedInBrowser: "导出已开始,请在浏览器下载列表查看相应文件",
            }
        }
    }
}


// 通过选项创建 VueI18n 实例

export const i18n = createI18n({
    locale: 'zh', // 设置地区
    messages, // 设置地区信息
    legacy: false
})
