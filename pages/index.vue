<template>
    <div class="centerize">
        <Widget />
    </div>
</template>

<script>
import { useStepStore } from "~/stores/step"
import { mapStores } from "pinia"

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
    computed: {
        ...mapStores(useStepStore),
    },
    async mounted() {
        await this.stepStore.initialize()
        window.ethereum.on("accountsChanged", () => {
            console.log("accounts changed")
            this.stepStore.initialize()
        })
    },
    created() {
        this.stepStore.factoryAddress = this.$config.public.devFactoryAddress
    },
}
</script>

<style lang="scss">
.centerize {
    grid-row: 1;
    grid-column: 1;
    place-self: center;
}
</style>
