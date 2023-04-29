<template>
    <div
        id="base"
        :class="[stepStore.isDark ? themes.dark : themes.light]"
    >
        <div class="bg-gradient bg-gradient--light"></div>
        <div
            class="bg-gradient bg-gradient--dark"
            :class="{ hide: !stepStore.isDark }"
        ></div>
        <Nav />
        <div
            class="slot"
            id="slot-wrap"
        >
            <slot />
        </div>

        <div
            class="slot"
            id="modal-wrap"
        >
            <!-- <ClientOnly> -->
            <SelectTokenModal ref="tokenModal"></SelectTokenModal>
            <!-- </ClientOnly> -->
        </div>
    </div>
</template>

<script setup>
import { provide } from "vue"
import { useStepStore } from "@/stores/step"

const stepStore = useStepStore()

const tokenModal = ref()
function toggleTokenModal(...args) {
    tokenModal.value.toggleTokenModal(...args)
}
provide("modal", toggleTokenModal)
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
    font-size: calc(15px + (15 - 15) * ((100vw - 300px) / (1600 - 300)));
}
body #base {
    display: grid;
    height: 100vh;
    position: relative;
}
.slot {
    display: contents;
    &#modal-wrap {
        > span {
            display: none;
        }
    }
}
h2 {
    font-size: 2.6rem;
}
h3 {
    font-size: 1.25rem;
}
p {
    font-size: 1.1rem;
}
.bolder {
    font-size: 1.4rem;
    font-weight: bolder;
}

.row {
    display: flex;
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

.contents {
    display: contents;
}

.bg-gradient {
    grid-row: 1;
    grid-column: 1;
    width: 100%;
    height: 100%;
    z-index: -2;
    transition: opacity var(--transition);
    opacity: 1;
    &--light {
        background: var(--bg-gradient-light);
    }
    &--dark {
        background: var(--bg-gradient-dark);
    }
    &.hide {
        opacity: 0;
    }
}
</style>
