import builtinWords from "./builtin_words.json"
export interface CompletionItem {
    label: string,
    type: string,
    apply?: string,
    detail?: string,
    boost: number

}

class CompletionHandler {
    builtins: CompletionItem[];
    constructor() {
        const words: string[] = builtinWords;
        this.builtins = []
        for (let i = 0; i < words.length; i++) {
            this.builtins.push({
                label: words[i],
                type: "keyword",
                boost: 0
            })
        }
    }

    public getCompletion(word: string, line: number, col: number): CompletionItem[] {
        return this.builtins
    }
}

export { CompletionHandler }