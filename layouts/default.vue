<template>
    <div
        id="base"
        :class="[stepStore.isDark ? themes.dark : themes.light]"
    >
        <div
            class="bg-gradient bg-gradient--light"
            :class="{ hide: stepStore.isDark }"
        ></div>
        <div
            class="bg-gradient bg-gradient--dark"
            :class="{ hide: !stepStore.isDark }"
        ></div>
        <Nav />
        <div
            class="page-slot"
            id="slot-wrap"
        >
            <slot />
        </div>

        <div
            class="page-slot"
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
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap");
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    transition: color var(--transition);
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
    display: grid;
    height: 100vh;
    position: relative;
}
.page-slot {
    display: contents;
    &#modal-wrap {
        > span {
            display: none;
        }
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
}
h4 {
    font-size: 1.25rem;
}
p {
    font-size: 1rem;
    &.caption {
        font-size: 0.9rem;
    }
}
.text-highlight {
    color: var(--primary-btn-bg);
}
.grey-text {
    color: var(--text-grey);
}

.row {
    display: flex;
    &.space-between {
        justify-content: space-between;
    }
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
