<template>
    <div :class="[stepStore.isDark ? themes.dark : themes.light]">
        <Nav />
        <div class="page-slot">
            <slot />
        </div>
        <div class="bg-gradient"></div>

        <div class="page-slot--modals">
            <SelectTokenModal ref="selectTokenModal"></SelectTokenModal>
            <NewToken ref="newTokenModal"></NewToken>
        </div>
    </div>
</template>

<script setup>
import { provide } from "vue"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"

const stepStore = useStepStore()
const { featuredTokens, pools, positions, connectedAccount } = storeToRefs(stepStore)

// MODAL STUFF ------------------
const selectTokenModal = ref()
function toggleSelectTokenModal(...args) {
    selectTokenModal.value.toggleModal(...args)
}
provide("selectTokenModal", toggleSelectTokenModal)

const newTokenModal = ref()
function toggleNewTokenModal() {
    newTokenModal.value.toggleModal()
}
provide("newTokenModal", toggleNewTokenModal)
// MODAL STUFF ------------------

if (!featuredTokens.value) {
    useAsyncData("tokens", () => stepStore.fetchTokens())
}
if (!pools.value) {
    // useAsyncData("pools", () => stepStore.fetchPools())
}

watch(
    () => connectedAccount,
    (account) => {
        if (account) {
            useAsyncData("positions", () => stepStore.fetchPositions(account))
        }
    },
    {
        immediate: true,
    }
)
</script>

<style lang="scss" module="themes" src="assets/main.scss"></style>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap");
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    /* transition: color var(--transition); */
    font-family: "DM Sans", sans-serif;
    line-height: 100%;
    font-weight: 500;
    user-select: none;
}
html {
    /* font-size: calc([minimum size] + ([maximum size] - [minimum size]) * ((100vw - [minimum viewport width]) / ([maximum viewport width] - [minimum viewport width]))); */
    color: var(--text-color);
    $size: 16px;
    font-size: calc($size + 0 * ((100vw - 300px) / (1600 - 300)));
    font-weight: 500;
}

.page-slot {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100vh;
    padding: var(--nav-height) 0px 5rem;
    -webkit-box-align: center;
    align-items: center;
    flex: 1 1 0%;

    &--modals {
        display: contents;
    }
    & > div {
        margin: auto 0;
    }
}

h1 {
    font-size: 3.5rem;
}
h2 {
    font-size: 2.25rem;
}
h3 {
    font-size: 1.5rem;
    /* line-height: 1.5rem; */
}
h4 {
    font-size: 1.25rem;
}

p {
    font-size: 1rem;
    line-height: 1.2rem;
}
.caption {
    &,
    & * {
        font-size: 13px !important;
    }
}
.text-highlight {
    color: var(--primary-btn-bg);
}
.activator-link {
    cursor: pointer;
    border-bottom: 1px solid var(--primary-btn-bg);
}
.grey-text {
    color: var(--text-grey);
    * {
        color: var(--text-grey);
    }
}
.base-box {
    color: var(--text-color-reverse);
    background-color: var(--widget-bg);
    backdrop-filter: var(--backdrop-blur);
}
.layer-wdg-box {
    background-color: var(--swap-windows);
    transition: background-color var(--transition);
    border-radius: var(--inner-wdg-radius);
    &--padded {
        padding: 1rem;
    }
}

.row {
    display: flex;
    &.space-between {
        justify-content: space-between;
    }
    &.flex-end {
        justify-content: flex-end;
    }
    &.align-center {
        align-items: center;
    }
    &.center {
        justify-content: center;
    }
}

.inset {
    box-shadow: var(--inset-shadow);
    transition: box-shadow var(--transition);
}

.contents {
    display: contents;
}

.bg-gradient {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -2;
    background-image: url("~/assets/img/stairway-background.jpg");
    background-size: cover;
    background-repeat: no-repeat;
}
input {
    // hiding browser default arrows
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    &[type="number"] {
        -moz-appearance: textfield;
    }
}
</style>
