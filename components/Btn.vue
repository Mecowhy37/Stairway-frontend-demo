<template>
    <!-- <button>{{ $slots.default }}</button> -->
    <button
        class="btn"
        :class="[levelStyling, { thin: props.secondary && props.thin, compact: props.compact, wide: props.wide }]"
    >
        <!-- <slot name="default"></slot> -->
        <component is="h3" :class="{ wicon: slots.icon && slots.default }">
            <slot name="default"></slot>
        </component>
        <div v-if="slots.icon" class="icon">
            <slot name="icon"></slot>
        </div>
    </button>
</template>

<script setup lang="ts">
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

<style lang="scss">
.btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid var(--swap-main-btn-bg);
    background-color: var(--nav-actions-bg);
    transition-property: background-color, color;
    transition-duration: var(--transition);
    padding: 0.8rem 1.9rem;
    .wicon {
        margin-right: 0.5rem;
    }
    &.compact {
        padding: 0.5rem 1.9rem;
    }
    > * {
        transition: color var(--transition);
        pointer-events: none;
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
