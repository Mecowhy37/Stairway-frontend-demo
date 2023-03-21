<template>
    <button
        class="btn"
        ref="btn"
        :class="[
            {
                'btn--secondary': props.secondary,
                'btn--secondary--thin': props.secondary && props.thin,
                'btn--plain': props.plain,
                'btn--transparent': props.transparent,
                'btn--wide': props.wide,
                'btn--bulky': props.bulky,
                'btn--pill': props.pill,
            },
        ]"
    >
        <!-- <slot name="default"></slot> -->
        <component
            is="h3"
            id="default-slot"
            :class="{ wicon: slots.icon && slots.default }"
        >
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

const props = defineProps({
    secondary: Boolean,
    thin: Boolean,
    wide: Boolean,
    bulky: Boolean,
    transparent: Boolean,
    plain: Boolean,
    pill: Boolean,
})
const emits = defineEmits([])
const slots = useSlots()
</script>

<style lang="scss">
$vert-padd: 0.4rem;
$horiz-padd: 1rem;
.btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid transparent;
    background-color: var(--primary-btn-bg);
    transition-property: background-color, color;
    transition-duration: var(--transition);
    padding: $vert-padd $horiz-padd;
    white-space: nowrap;
    cursor: pointer;
    * {
        color: var(--primary-btn-color);
        pointer-events: none;
    }
    &:hover {
        border: 1px solid transparent;
    }
    #default-slot {
        &.wicon {
            margin-right: 0.5rem;
        }
    }
    &--plain {
        background-color: var(--flat-bg);
        * {
            color: var(--main-color);
        }
        &:hover {
            border: 1px solid var(--flat-outline) !important;
        }
    }
    &--secondary {
        background-color: transparent;
        border: 2px solid var(--primary-btn-bg);
        * {
            color: var(--primary-btn-bg);
        }
        &--thin {
            border: 1px solid var(--primary-btn-bg);
        }
    }
    &--transparent {
        background-color: transparent;
    }
    &--wide {
        width: 100%;
    }
    &--pill {
        border-radius: 9999px;
    }
    &--bulky {
        $height: 3.5rem;
        height: $height;
        border-radius: var(--inner-wdg-radius);
        /* #default-slot {
            line-height: $height;
        } */
    }
}
.cta-dd {
    /* > button {
        border: none !important;
    } */
    > :first-child {
        padding-right: 13px !important;
    }
    > :last-child button {
        padding-left: 10px !important;
    }
}
</style>
