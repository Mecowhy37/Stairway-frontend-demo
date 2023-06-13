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
        if (!props.settingsRef.isValidSettings) {
            let isValid
            if (!props.settingsRef.noSlippage) {
                const slippage = props.settingsRef.slippage
                isValid = props.settingsRef.validateSlippage(slippage, true)
            }
            const deadline = props.settingsRef.deadline
            props.settingsRef.validateDeadline(deadline, true)

            if (!isValid) {
                return
            }
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
            // when activator clicked
            event.stopPropagation()
        }
    }
})
</script>

<style scoped lang="scss">
.dropdown {
    display: flex;
    position: relative;
    z-index: 100;

    &__activator {
        display: flex;
    }
    &__box {
        position: absolute;
        right: 0%;
        z-index: 150;
        top: 100%;
        margin-top: 0.8rem;
        width: 250px;
        border-radius: var(--semi-wdg-radius);

        /* background-color: transparent; */
    }
}
</style>
