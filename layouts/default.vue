<template>
    <div :class="[stepStore.isDark ? themes.dark : themes.light]">
        <div class="wrapper">
            <Nav />
            <div class="page-slot">
                <slot />
            </div>
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
const { featuredTokens, addresses, positions, connectedAccount, chainId } = storeToRefs(stepStore)

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
const isNewTokenModalOpen = computed(() => {
    if (!newTokenModal.value) {
        return null
    }
    return newTokenModal.value.showModal
})

provide("newTokenModal", { toggleNewTokenModal, isNewTokenModalOpen })
// MODAL STUFF ------------------

if (!featuredTokens.value) {
    await useAsyncData("tokens", () => stepStore.fetchTokens())
}

if (!addresses.value) {
    await useAsyncData("addresses", () => stepStore.fetchAddresses())
}

watch(
    () => connectedAccount.value,
    (account) => {
        if (account) {
            useAsyncData("positions", () => stepStore.fetchPositions(account, chainId.value))
        }
    },
    {
        immediate: true,
    }
)
watch(
    () => chainId.value,
    (newVal) => {
        console.log(newVal)
    },
    {
        immediate: true,
    }
)
</script>

<style lang="scss" module="themes" src="assets/main.scss"></style>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,500&display=swap");
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: "DM Sans";
    line-height: 100%;
    font-weight: 500;
}
html {
    /* font-size: calc([minimum size] + ([maximum size] - [minimum size]) * ((100vw - [minimum viewport width]) / ([maximum viewport width] - [minimum viewport width]))); */
    color: var(--text-color);
    $size: 16px;
    /* font-size: calc($size + 0 * ((100vw - 300px) / (1600 - 300))); */
    font-size: $size;
}
.wrapper {
    position: relative;
    margin: 0 auto;
    @media (min-width: 1536px) {
        max-width: 1536px;
    }
}
.page-slot {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - var(--nav-height));
    padding-bottom: var(--nav-height);
    -webkit-box-align: center;
    align-items: center;

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
.list-item {
    border-top: 1px solid transparent;
    border-right: 1px solid transparent;
    border-left: 1px solid transparent;
    border-bottom: 1px solid var(--grey-opaque);
    cursor: pointer;

    &:first-of-type {
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
    }
    &:last-of-type {
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
    }
    &:hover {
        background-color: var(--list-hover-bg);
        border: 1px solid var(--list-hover-stroke);
    }
    &:active {
        background-color: var(--list-click-bg);
        border: 1px solid var(--list-click-stroke);
    }
    &--padded {
        padding: 1rem;
    }
    &--padded-sm {
        padding: 0.7rem;
    }
    &--centered {
        text-align: center;
    }
    &--all-rounded {
        border-radius: inherit;
    }
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
    background-color: var(--widget-bg);
    backdrop-filter: var(--backdrop-blur);
    color: var(--text-color-reverse);

    &--solid {
        background-color: var(--widget-bg-solid);
    }
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
