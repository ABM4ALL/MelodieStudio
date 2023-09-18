export class LocalStorageVar {
    value = false
    constructor() {
        this
    }
    valueOf(): boolean {
        return this.value
    }
}


const proxies: { [key: string]: typeof Proxy } = {}

const getFromLocalStorage = <T>(key: string, initialValue: T): { v: { value: T } | null, status: boolean } => {
    const strFromLocalStorage = localStorage.getItem(key)
    const valFromLocalStorage: { value: T } | null = strFromLocalStorage != null ? JSON.parse(strFromLocalStorage) : null
    if (valFromLocalStorage != null) {
        if (typeof valFromLocalStorage.value == typeof initialValue) {
            return { v: valFromLocalStorage, status: true }
        }
    }
    return { v: null, status: false }

}

export const createStorageProxy = <T>(storageKey: string, initialValue: T,): { value: T } => {
    const val = { value: initialValue }

    const { v, status } = getFromLocalStorage(storageKey, initialValue)
    if (!status) {
        localStorage.setItem(storageKey, JSON.stringify(val))
    } else {
        if (v != null) {
            val.value = v.value
        } else {
            console.error('v was null!')
        }

    }
    const valProxy: any = new Proxy(val, {
        get(target, key): boolean {
            return (target as any)[key] as boolean
        },
        set(target, key, value) {
            const ret = Reflect.set(target, key, value)
            if (key == 'value') {
                localStorage.setItem(storageKey, JSON.stringify(target))
            }
            return ret
        }
    })
    proxies[storageKey] = valProxy
    return valProxy
}