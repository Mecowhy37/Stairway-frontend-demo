import { defineStore } from "pinia"

export const useTempStore = defineStore("temp", {
    state: () => {
        return {
            poolAddress: null,
        }
    },
    actions: {},
    getters: {},
})
