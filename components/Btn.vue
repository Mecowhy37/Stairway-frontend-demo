<template>
    <button
        class="btn"
        :class="[
            {
                'btn--secondary': props.secondary,
                'btn--wide': props.wide,
                'btn--transparent': props.transparent,
                'btn--plain': props.plain,
                thin: props.secondary && props.thin,
            },
        ]"
    >
        <!-- <slot name="default"></slot> -->
        <component is="h3" class="default-slot" :class="{ wicon: slots.icon && slots.default }">
            <slot name="default"></slot>
        </component>
        <div v-if="slots.icon">
            <slot name="icon"></slot>
        </div>
    </button>
    <!-- <button>{{ $slots.default }}</button> -->
</template>

<script setup lang="ts">
import { useSlots } from "vue"
import { useStepStore } from "@/stores/step"

const stepStore = useStepStore()

interface Props {
    secondary?: boolean
    wide?: boolean
    thin?: boolean
    transparent?: boolean
    plain?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    secondary: false,
    wide: false,
    thin: false,
    transparent: false,
    plain: false,
})
const emits = defineEmits([])
const slots = useSlots()
</script>

<style lang="scss">
.btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: none;
    background-color: var(--primary-btn-bg);
    transition-property: background-color, color;
    transition-duration: var(--transition);
    padding: 0.8rem 1.9rem;
    white-space: nowrap;
    * {
        color: var(--primary-btn-color);
        pointer-events: none;
    }
    .default-slot {
        &.wicon {
            margin-right: 0.5rem;
        }
    }
    &--plain {
        background-color: var(--nav-actions-bg);
        * {
            color: var(--main-color);
        }
    }
    &--secondary {
        background-color: transparent;
        border: 2px solid var(--primary-btn-bg);
        * {
            color: var(--primary-btn-bg);
        }
        &.thin {
            border: 1px solid var(--primary-btn-bg);
        }
    }
    &--wide {
        width: 100%;
    }
}
</style>
