<template>
    <div
        id="base"
        :class="[stepStore.isDark ? themes.dark : themes.light]"
    >
        <div class="bg-gradient"></div>
        <Nav ref="nav" />
        <div
            class="page-slot"
            id="slot-wrap"
        >
            <slot />
        </div>

        <div class="page-slot">
            <SelectTokenModal ref="selectTokenModal"></SelectTokenModal>
            <NewToken ref="newTokenModal"></NewToken>
        </div>
    </div>
</template>

<script setup>
import { provide } from "vue"
import { useStepStore } from "@/stores/step"

const stepStore = useStepStore()
watch(
    () => stepStore.connectedAccount,
    async (newVal) => {
        if (newVal) {
            // await stepStore.onboard.setChain({ chainId: "0x13881" })
            // console.log("onboard:", stepStore.connectedChain)
        }
    }
)

const nav = ref(null)
const navHeight = ref("")
onMounted(() => {
    const navbar = nav.value
    if (navbar) {
        navHeight.value = navbar.$el.offsetHeight + "px"
    }
})

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
body #base {
    height: 100vh;
    /* height: 150vh; */
    position: relative;
}
.page-slot {
    display: contents;
}
h1 {
    font-size: 3.5rem;
}
h2 {
    font-size: 2.25rem;
}
h3 {
    font-size: 1.5rem;
    line-height: 1.7rem;
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
}

.centerize {
    width: 100%;
    display: grid;
    place-content: center;
    height: calc(100vh - v-bind(navHeight));
    padding-bottom: v-bind(navHeight);
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
    position: absolute;
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
