<template>
    <div class="centerize row">
        <div>
            <SwapWidget ref="swap" />
            <PoolWidget />
        </div>
        <div>
            <TempDisplay ref="display" @refresh="refreshAll()" />
        </div>
    </div>
</template>

<script>
import { useStepStore } from "~/stores/step"
import { mapStores } from "pinia"

import * as Factory from "../constants/factoryAddress.json"
const factoryAddresses = Factory.default

export default {
    head() {
        return {
            title: "Homepage",
            meta: [
                {
                    name: "description",
                    content: "This is a homepage!",
                    hid: "description",
                },
            ],
        }
    },
    data() {
        return {
            were: "here",
        }
    },
    methods: {
        refreshAll() {
            this.$refs["swap"].setupPool()
            this.$refs["display"].setupDisplay()
        },
    },
    computed: {
        ...mapStores(useStepStore),
    },
    async mounted() {
        await this.stepStore.initialize()
        window.ethereum.on("accountsChanged", () => {
            // console.log("accounts changed")
            this.stepStore.initialize()
        })
    },
    created() {
        //setting global state, will be moved to state instance itself
        this.stepStore.factoryAddress = factoryAddresses[this.stepStore.chainId]
    },
}
</script>

<style lang="scss">
.row {
    display: flex;
    flex-direction: row;
}

.centerize {
    grid-row: 1;
    grid-column: 1;
    place-self: center;
}
</style>
