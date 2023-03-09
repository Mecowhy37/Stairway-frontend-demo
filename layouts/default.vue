<template>
    <div
        id="base"
        :class="[stepStore.isDark ? themes.dark : themes.light]"
    >
        <!-- <div class="bg-gradient bg-gradient--dark" :class="[stepStore.isDark ? '' : 'hide']"></div> -->
        <!-- <div class="bg-gradient bg-gradient--light" :class="[stepStore.isDark ? 'hide' : '']"></div> -->
        <div
            class="bg-gradient bg-gradient--dark"
            :class="{ hide: !stepStore.isDark }"
        ></div>
        <div
            class="bg-gradient bg-gradient--light"
            :class="{ hide: stepStore.isDark }"
        ></div>
        <Nav />
        <slot />
        <SelectTokenModal />
    </div>
</template>

<script>
import { useStepStore } from "@/stores/step"
import { mapStores } from "pinia"

export default {
    data() {
        return {}
    },
    computed: {
        ...mapStores(useStepStore),
    },
    async serverPrefetch() {
        const stepStore = useStepStore(this.$pinia)
        const { data } = await useFetch(() => "https://gateway.ipfs.io/ipns/tokens.uniswap.org")
        stepStore.$patch({
            isDark: true,
            tokenList: data.value.tokens,
        })
        // stepStore.isDark = true
        // stepStore.tokenList = data.value.tokens
    },
}
</script>

<style lang="scss" module="themes" src="assets/main.scss"></style>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap");

* {
    color: var(--main-color);
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    transition: color var(--transition);
    font-family: "Quicksand", sans-serif;
    font-weight: 500;
    user-select: none;
}
html {
    /* font-size: calc([minimum size] + ([maximum size] - [minimum size]) * ((100vw - [minimum viewport width]) / ([maximum viewport width] - [minimum viewport width]))); */
    font-size: calc(14px + (16 - 14) * ((100vw - 300px) / (1600 - 300)));
}
body #base {
    display: grid;
    height: 100vh;
    position: relative;
}
h2 {
    font-size: 2.6rem;
}
h3 {
    font-size: 1.25rem;
}

.row {
    display: flex;
    flex-direction: row;
}

.centerize {
    grid-row: 1;
    grid-column: 1;
    place-self: center;
}

.main {
    padding-top: 50px;
}

.inset {
    box-shadow: var(--inset-shadow);
    transition: box-shadow var(--transition);
}

.bg-gradient {
    grid-row: 1;
    grid-column: 1;
    width: 100%;
    height: 100%;
    z-index: -1;
    transition: opacity var(--transition);
    &--light {
        opacity: 1;
        background: var(--bg-gradient-light);
    }
    &--dark {
        opacity: 1;
        background: var(--bg-gradient-dark);
    }
    &.hide {
        opacity: 0;
    }
}
</style>
