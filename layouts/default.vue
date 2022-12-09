<template>
    <div id="base" :class="[stepStore.isDark ? themes.dark : themes.light]">
        <!-- <div class="bg-gradient bg-gradient--dark" :class="[stepStore.isDark ? '' : 'hide']"></div> -->
        <!-- <div class="bg-gradient bg-gradient--light" :class="[stepStore.isDark ? 'hide' : '']"></div> -->
        <div class="bg-gradient bg-gradient--dark" :class="{ hide: !stepStore.isDark }"></div>
        <div class="bg-gradient bg-gradient--light" :class="{ hide: stepStore.isDark }"></div>
        <Nav />
        <slot />
        <WalletModal />
    </div>
</template>

<script setup>
import { useStepStore } from "@/stores/step"

const stepStore = useStepStore()
</script>

<style lang="scss" module="themes" src="assets/main.scss"></style>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap");
html {
    font-size: 62.5%;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    color: var(--main-color);
    transition: color var(--transition);
    font-family: "Quicksand", sans-serif;
    font-weight: 500;
    user-select: none;
}

body {
    font-size: 1.6rem;
}
#base {
    display: grid;
    height: 100vh;
    position: relative;
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

/* darkcontrast: #1c3b30 */
/* deep dark 18%: #18302b */
/* 53%: #192625 */
/* pink: #ffd1d1 */
</style>
