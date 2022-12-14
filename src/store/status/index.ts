const LANGUAGE_SERVICE_IDLE = "Language Service Idle"
export default {
    state: {
        languageService: {
            busy: false,
            hint: LANGUAGE_SERVICE_IDLE
        },
        developmentMode: false
    },
    mutations: {
        SET_LANGUAGE_SERVICE_BUSY(state, jobdesc: string) {
            state.languageService.busy = true
            state.languageService.hint = jobdesc
        },
        SET_LANGUAGE_SERVICE_IDLE(state) {
            state.languageService = { busy: false, hint: LANGUAGE_SERVICE_IDLE }
        },
        SET_DEVELOPMENT_MODE(state, mode: boolean) {
            state.developmentMode = mode
        }

    },
    actions: {
    },
    getters: {
    },
    modules: {
    }
};
