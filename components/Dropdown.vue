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
            :class="[{ 'no-padding': props.noPadding, 'base-box--solid': props.solid }]"
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
    noPadding: Boolean,
    solid: Boolean,
})

const toActivate = ref(null)
const openner = ref(null)
const isDropdownActive = ref(false)
function toggleDropdown() {
    if (props.settingsRef) {
        if (!props.settingsRef.isValidSettings) {
            let isDeadlineValid
            let isSlippageValid
            if (!props.settingsRef.noSlippage) {
                const slippage = props.settingsRef.slippage
                isSlippageValid = props.settingsRef.validateSlippage(slippage, true)
            }
            const deadline = props.settingsRef.deadline
            isDeadlineValid = props.settingsRef.validateDeadline(deadline, true)

            if (isSlippageValid === false || isDeadlineValid === false) {
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
        padding: 0.5rem;
        border: 1px solid var(--grey-opaque);
        &.no-padding {
            padding: 0;
        }
    }
}
</style>
