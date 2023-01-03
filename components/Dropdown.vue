<template>
    <div class="dropdown">
        <div class="dropdown--activator" ref="openner" @click="toggleDropdown()">
            <slot name="dropdown-activator" :on="isDropdownActive"> </slot>
        </div>

        <div v-show="isDropdownActive" class="dropdown--box" ref="toActivate">
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
    position: relative;
    &--box {
        position: absolute;
        right: 0%;
        margin-top: 1.6rem;
        width: 250px;
        padding: 1rem;
        background-color: transparent;
        border-radius: 8px;
        border: 1px solid var(--swap-main-btn-bg);
    }
}
</style>
