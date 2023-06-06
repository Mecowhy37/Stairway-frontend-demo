<template>
    <div class="dropdown">
        <div
            class="dropdown__activator"
            ref="openner"
            @click="toggleDropdown()"
        >
            <slot
                name="dropdown-activator"
                :on="isDropdownActive"
            ></slot>
        </div>

        <div
            v-show="isDropdownActive"
            class="dropdown__box base-box"
            ref="toActivate"
        >
            <slot
                name="dropdown"
                :toggle-dropdown="toggleDropdown"
            ></slot>
        </div>
    </div>
</template>

<script setup>
import { onClickOutside } from "@vueuse/core"

const props = defineProps({
    settingsRef: Object,
})

const toActivate = ref(null)
const openner = ref(null)
const isDropdownActive = ref(false)
function toggleDropdown() {
    if (props.settingsRef) {
        if (!props.settingsRef.validSettings) {
            return
        }
    }
    isDropdownActive.value = !isDropdownActive.value
}
onClickOutside(toActivate, (event) => {
    if (isDropdownActive.value === true) {
        toggleDropdown()
        event.stopPropagation()
        if (openner.value === event.target.parentNode) {
            // not used anymore?
            console.log("IS IT? ? ?")
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
        right: 1500%;
        top: 100%;
        margin-top: 0.8rem;
        width: 250px;
        border-radius: var(--semi-wdg-radius);
        z-index: 100;

        /* background-color: transparent; */
    }
}
</style>
