import { Operation, ResponseToFile, DownloadOperation, OperationTypes } from "@/models"
import { downloadFile } from "@/utils/file"
import { AxiosResponse } from "axios"

interface Context {
    globals: { response: AxiosResponse | null }
}

export const evaluatorFunctions = {
    'op-response-to-file': (ctx: Context, operation: ResponseToFile, args: AxiosResponse[]): File => {
        const resp = args[0]
        const blob = new Blob([resp.data])
        const file = new File([blob], operation.defaultName, { type: resp.headers['content-type'] });
        return file
    },
    'op-download': (ctx: Context, operation: DownloadOperation, args: File[]) => {
        downloadFile(args[0])
        return null
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
    evalOpration(operation: OperationTypes) {
        const args: any[] = []
        for (const oprand of operation.oprands) {
            if (oprand.name === 'op-response-to-file') {
                if (this.context.globals.response == null) {
                    throw Error("response is null!")
                }
                const val = evaluatorFunctions[oprand.name](this.context, oprand, [this.context.globals.response])
                args.push(val)
            } else {
                const val = this.evalOpration(oprand)
                args.push(val)
            }

        }
        return evaluatorFunctions[operation.name](this.context, operation, args)
    }
}