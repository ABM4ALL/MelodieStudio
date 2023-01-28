import { showChartWindow } from "@/components/events/globalevents"
import { ResponseToFile, DownloadOperation, OperationTypes, ShowChartWindow } from "@/models"
import { downloadFile } from "@/utils/file"
import { AxiosResponse } from "axios"

interface Context {
    globals: { response: AxiosResponse | null }
}

export const evaluatorFunctions: { [key: string]: (ctx: Context, operation: OperationTypes, args: any[]) => Promise<any> } = {
    'op-response-to-file': async (ctx: Context, operation: ResponseToFile, args: AxiosResponse[]): Promise<File> => {
        const resp = args[0]
        const blob = new Blob([resp.data])
        const file = new File([blob], operation.defaultName, { type: resp.headers['content-type'] });
        return file
    },
    'op-download': async (ctx: Context, operation: DownloadOperation, args: File[]) => {
        downloadFile(args[0])
        return null
    },
    'op-show-chart-window': async (ctx: Context, operation: ShowChartWindow, args: { options: any }[]) => {
        console.log('args', args)
        showChartWindow(args[0])
        return null
    },
    'op-response-to-json': async (ctx: Context, operation: ShowChartWindow, args: AxiosResponse[]) => {
        if (ctx.globals.response == null) {
            throw Error("response was null!")
        }
        const dataBlob: Blob = ctx.globals.response.data
        const obj = JSON.parse(await dataBlob.text())
        if (obj.status == 0) {
            return obj.data
        } else {
            console.error(obj)
            throw Error("Response status error")
        }
    }
} as { [key: string]: (ctx: Context, operation: OperationTypes, args: any[]) => any }

export class OperationEvaluator {
    context: Context = { globals: { response: null } }
    constructor() {
        return
    }

    evaluate(response: AxiosResponse, operation: OperationTypes) {
        this.context.globals.response = response
        console.log(operation)
        return this.evalOpration(operation)
    }
    async evalOpration(operation: OperationTypes) {
        const args: any[] = []
        for (const oprand of operation.oprands) {
            if (oprand.name === 'op-response-to-file') {
                if (this.context.globals.response == null) {
                    throw Error("response is null!")
                }
                if (evaluatorFunctions[oprand.name] == null) {
                    throw Error(`No oprand handler '${oprand.name}' in current melodiestudio.`)
                }
                const val = await evaluatorFunctions[oprand.name](this.context, oprand, [this.context.globals.response])
                args.push(val)
            } else {
                const val = await this.evalOpration(oprand)
                args.push(val)
            }

        }
        if (evaluatorFunctions[operation.name] == null) {
            throw Error(`No oprand handler '${operation.name}' in current melodiestudio.`)
        }
        return await evaluatorFunctions[operation.name](this.context, operation, args)
    }
}