<template>
    <!-- <button>{{ $slots.default }}</button> -->
    <button
        class="btn"
        :class="[levelStyling, { thin: props.secondary && props.thin, compact: props.compact, wide: props.wide }]"
    >
        <!-- <slot name="default"></slot> -->
        <component is="h3">
            <slot name="default"></slot>
        </component>
    </button>
</template>

<script setup lang="ts">
import type { Ref } from "vue"
import { useSlots } from "vue"
import { useStepStore } from "@/stores/step"

const stepStore = useStepStore()

interface Props {
    secondary?: boolean
    wide?: boolean
    compact?: boolean
    thin?: boolean
}
const props = defineProps<Props>()
const emits = defineEmits([])
const slots = useSlots()

const levelStyling = computed(() => {
    return "btn" + (props.secondary !== true ? "--primary" : "--secondary")
})
const levelFontSizing = computed(() => {
    return
})
</script>

<style lang="scss" scoped>
.btn {
    position: relative;
    padding: 0.8rem 1.9rem;
    &.compact {
        padding: 0.5rem 1.9rem;
    }
    background-color: var(--nav-actions-bg);
    transition-property: background-color, color;
    transition-duration: var(--transition);
    border-radius: 8px;
    border: 1px solid var(--swap-main-btn-bg);
    > * {
        transition: color var(--transition);
    }
    &--primary {
        background-color: var(--swap-main-btn-bg);
        & > * {
            color: var(--swap-main-btn-color);
        }
    }
    &--secondary {
        background-color: transparent;
        border: 2px solid var(--swap-main-btn-bg);
        /* & > * {
            color: var(--swap-main-btn-bg);
        } */
        &.thin {
            border: 1px solid var(--swap-main-btn-bg);
        }
    }
    &.wide {
        width: 100%;
    }
}
</style>
