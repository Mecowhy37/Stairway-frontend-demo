<template>
    <div class="dropdown">
        <div class="dropdown__activator" ref="openner" @click="toggleDropdown()">
            <slot name="dropdown-activator" :on="isDropdownActive"></slot>
        </div>

        <div v-show="isDropdownActive" class="dropdown__box" ref="toActivate">
            <slot name="dropdown"></slot>
        </div>
    </div>
</template>

<script setup>
import { onClickOutside } from "@vueuse/core"

const toActivate = ref(null)
const openner = ref(null)
const isDropdownActive = ref(false)
function toggleDropdown() {
    isDropdownActive.value = !isDropdownActive.value
}
onClickOutside(toActivate, (event) => {
    if (isDropdownActive.value === true) {
        toggleDropdown()
        if (openner.value === event.target.parentNode) {
            event.stopPropagation()
        }
    }
})
</script>

<style scoped lang="scss">
.dropdown {
    display: flex;
    position: relative;

    &__activator {
        display: flex;
    }
    &__box {
        position: absolute;
        right: 0%;
        top: 100%;
        margin-top: 1.6rem;
        width: 270px;
        padding: 1.5rem;
        border-radius: 8px;
        background-color: var(--flat-bg);
        border: 1px solid var(--flat-outline);

        /* background-color: transparent; */
    }
}
</style>
