<template>
    <button
        class="btn"
        ref="btn"
        :disabled="props.disabled"
        :class="[
            {
                'btn--primary': !props.plain && !props.opaque && !props.transparent,
                'btn--cta': props.cta,
                'btn--plain': props.plain,
                'btn--tiny': props.tiny,
                'btn--radio': props.radio,
                'btn--small': props.small,
                'btn--compact': props.compact,
                'btn--sm-radius': props.smRadius,
                'btn--bulky': props.bulky,
                'btn--custom': props.custom,
                'btn--wide': props.wide,
                'btn--opaque': props.opaque,
                'btn--active': props.active,
                'btn--selectable': props.selectable,
                'btn--transparent': props.transparent,
                'btn--circle': props.circle,
                'btn--unclickable': props.loading,
                'btn--w-icon': slots.icon && slots.default,
                'btn--icon': slots.icon && !slots.default,
                'btn--reverse': props.reverse,
            },
        ]"
    >
        <component
            :is="props.is"
            class="slot"
            id="default-slot"
        >
            <slot name="default"></slot>
        </component>
        <div
            v-if="slots.icon"
            class="slot"
            id="icon-slot"
            :class="{ contrast: props.iconContrast }"
        >
            <slot name="icon"></slot>
        </div>
        <span
            v-if="loading"
            class="loader"
        ></span>
    </button>
</template>

<script setup lang="ts">
import { useSlots } from "vue"
import { useStepStore } from "@/stores/step"

const stepStore = useStepStore()

export interface Props {
    is?: string
    tiny?: boolean
    radio?: boolean
    small?: boolean
    compact?: boolean
    smRadius?: boolean
    bulky?: boolean
    custom?: boolean
    wide?: boolean
    cta?: boolean
    transparent?: boolean
    plain?: boolean
    opaque?: boolean
    active?: boolean
    selectable?: boolean
    circle?: boolean
    disabled?: boolean
    loading?: boolean
    iconContrast?: boolean
    reverse?: boolean
    rotate?: number
}

const props = withDefaults(defineProps<Props>(), {
    is: "p",
    rotate: 0,
})

const slots = useSlots()

const rotateDeg = computed(() => {
    return props.rotate + "deg"
})
</script>

<style lang="scss">
$vert-padd: 13px;
$horiz-padd: 16px;
/* $vert-padd: 0.6rem;
$horiz-padd: 1.3rem; */
.btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--inner-wdg-radius);
    border: 1px solid transparent;
    padding: $vert-padd $horiz-padd;
    white-space: nowrap;
    background-color: var(--primary-btn-bg);
    box-shadow: 0px 5px 14px rgba(0, 0, 0, 0.05);
    transform: rotate(v-bind(rotateDeg));
    cursor: pointer;
    * {
        pointer-events: none;
    }

    &:disabled {
        background-color: var(--grey-opaque);
        color: var(--text-grey);
    }

    #default-slot {
        position: relative;
        line-height: 100%;
    }

    &--primary {
        &:not(:disabled):hover {
            background: linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), var(--primary-btn-bg);
            border: 1px solid rgba(255, 255, 255, 0.4);
        }
        &:not(:disabled):active {
            background: linear-gradient(0deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), var(--primary-btn-bg);
            border: 1px solid #ffffff;
        }
    }

    // SIZES ------------
    &--tiny {
        padding: 0;
    }
    &--radio {
        border-radius: var(--small-wdg-radius);
        padding: 8px 10px;
        @media (max-width: 447px) {
            padding: 5px;
        }
    }
    &--small {
        padding: 5px 10px;
    }
    &--compact {
        padding: 7px 15px;
    }
    &--sm-radius {
        border-radius: var(--small-wdg-radius);
    }
    &--bulky {
        $height: 3rem;
        height: $height;
        border-radius: var(--inner-wdg-radius);
    }
    &--custom {
        border-radius: var(--small-wdg-radius);
        padding: 13px 15px;
    }
    &--wide {
        width: 100%;
    }
    // SIZES ------------

    &--w-icon {
        gap: 0.2rem;
        #icon-slot {
            margin-right: -0.2rem;
            margin-left: 0.3rem;
        }
    }
    &--plain {
        border: none;
        /* background-color: var(--grey-solid); */
        background-color: var(--widget-bg);
        * {
            color: var(--text-color-reverse);
        }
    }
    &--opaque {
        background-color: var(--grey-opaque);
        border: 1px solid transparent;
        * {
            color: var(--text-color-reverse);
        }
        &:disabled {
            background-color: var(--selectors-disabled-bg);
            * {
                color: var(--selectors-disabled-color);
            }
        }
    }
    &--active {
        &:not(:disabled)::before {
            position: absolute;
            content: "";
            height: 100%;
            width: 100%;
            border-radius: var(--inner-wdg-radius);
        }
        &:not(:disabled):hover::before {
            background-color: var(--blue-hover);
        }
        &:not(:disabled):active::before {
            background-color: var(--blue-active);
        }
    }
    &--selectable {
        &:not(:disabled)::before {
            position: absolute;
            content: "";
            height: 100%;
            width: 100%;
        }
        &:not(:disabled):hover {
            border: 1px solid var(--list-click-stroke);
        }
        &:not(:disabled):active::before {
            background-color: var(--list-click-bg-lighter);
        }
        &:not(:disabled).selected:hover {
            border: 1px solid var(--primary-btn-bg);

            &::before {
                background-color: var(--opaque-btn-bg);
            }
        }
        &:not(:disabled).selected {
            border: 1px solid var(--primary-btn-bg);
            &::before {
                background-color: var(--opaque-btn-bg);
            }
            &:hover {
                border: 1px solid white;
            }
            &:active {
                border: 1px solid white;
                &::before {
                    background-color: var(--opaque-active-btn-bg-selected);
                }
            }
        }
    }
    &--transparent {
        background-color: transparent;
        box-shadow: none;
        &:hover {
            background-color: var(--trans-hover);
        }
    }
    &--cta {
        background-color: var(--cta-bg);
    }
    &--circle {
        border-radius: 9999px;
        padding: 0px;
        #icon-slot {
            .icon {
                margin: 3px;
            }
        }
    }
    &--unclickable {
        pointer-events: none;
    }
    &--reverse {
        flex-direction: row-reverse;
        #icon-slot {
            margin-left: -0.3rem !important;
            margin-right: 0.3rem !important;
        }
    }
}

.loader {
    margin-left: 0.5rem;
    height: 25px;
    aspect-ratio: 1/1;
    border: 5px dotted #fff;
    border-radius: 50%;
    display: inline-block;
    position: relative;
    box-sizing: border-box;
    animation: rotation 2s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
