import builtinWords from "./builtin_words.json"
export interface CompletionItem {
    label: string,
    type: string,
    apply?: string,
    detail?: string,
    boost: number

}
console.log(builtinWords)

class CompletionHandler {
    builtins: CompletionItem[];
    constructor() {
        const words: string[] = builtinWords;
        console.log(this)
        this.builtins = []
        for (let i = 0; i < words.length; i++) {
            this.builtins.push({
                label: words[i],
                type: "keyword",
                boost: 0
            })
        }
        console.log(words)
    }

    public getCompletion(word: string, line: number, col: number): CompletionItem[] {
        console.log(word, line, col)
        return this.builtins
    }
}

export { CompletionHandler }