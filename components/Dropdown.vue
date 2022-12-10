<template>
    <div class="dropdown" ref="toActivate">
        <slot name="default"></slot>
    </div>
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core"

const toActivate = ref(null)
const isDropdownActive = ref(false)
onClickOutside(toActivate, () => {
    console.log("clicked")
})
function toggleDropdown() {
    isDropdownActive.value = !isDropdownActive.value
}
</script>

<style scoped>
.dropdown {
    position: absolute;
    left: 100%;
    top: 100%;
    margin-top: 1.6rem;
    transform: translate(-100%, 0%);
    width: 250px;
    padding: 1rem;
    background-color: transparent;
    border-radius: 8px;
    border: 1px solid var(--swap-main-btn-bg);
}
</style>
