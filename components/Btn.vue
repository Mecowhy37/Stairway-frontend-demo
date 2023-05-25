<template>
    <button
        class="btn"
        ref="btn"
        :disabled="props.disabled"
        :class="[
            {
                'btn--secondary': props.secondary,
                'btn--cta': props.cta,
                'btn--secondary--thin': props.secondary && props.thin,
                'btn--plain': props.plain,
                'btn--opaque': props.opaque,
                'btn--transparent': props.transparent,
                'btn--wide': props.wide,
                'btn--bulky': props.bulky,
                'btn--pill': props.pill,
                'btn--unclickable': props.loading,
                'btn--tiny': props.tiny,
                'btn--compact': props.compact,
                'btn--w-icon': slots.icon && slots.default,
                'btn--reverse': props.reverse,
            },
        ]"
    >
        <component
            :is="props.is"
            class="slot"
            id="default-slot"
            :class="{ wicon: slots.icon && slots.default }"
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
    secondary?: boolean
    cta?: boolean
    thin?: boolean
    wide?: boolean
    bulky?: boolean
    transparent?: boolean
    plain?: boolean
    opaque?: boolean
    pill?: boolean
    disabled?: boolean
    loading?: boolean
    tiny?: boolean
    compact?: boolean
    iconContrast?: boolean
    reverse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    is: "p",
})

// const {
//     is = "p",
//     secondary,
//     thin,
//     wide,
//     bulky,
//     transparent = false,
//     plain,
//     pill,
//     disabled,
//     loading,
//     tiny,
//     iconContrast,
// } = defineProps<{
//     is?: String
//     secondary?: Boolean
//     thin?: Boolean
//     wide?: Boolean
//     bulky?: Boolean
//     transparent?: Boolean
//     plain?: Boolean
//     pill?: Boolean
//     disabled?: Boolean
//     loading?: Boolean
//     tiny?: Boolean
//     iconContrast?: Boolean
// }>()

const emits = defineEmits([])
const slots = useSlots()
const attrs = useAttrs()
</script>

<style lang="scss">
$vert-padd: 0.6rem;
$horiz-padd: 1.3rem;
.btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--inner-wdg-radius);
    border: 1px solid transparent;
    transition-property: background-color, color;
    transition-duration: var(--transition);
    padding: $vert-padd $horiz-padd;
    white-space: nowrap;
    background-color: var(--primary-btn-bg);

    &:disabled {
        background-color: var(--primary-disabled-bg);
        color: var(--text-grey);
    }

    cursor: pointer;
    * {
        /* color: var(--primary-btn-color); */
        pointer-events: none;
    }
    &:hover {
        border: 1px solid transparent;
    }
    #default-slot {
        line-height: 100%;
        &.wicon {
        }
    }
    .slot {
        &.contrast {
            * {
                color: var(--text-color-reverse);
            }
        }
    }
    &--secondary {
        background-color: transparent;
        border: 2px solid var(--primary-btn-bg);
        &:hover {
            border: 2px solid var(--primary-btn-bg);
            background-color: rgba(67, 187, 112, 0.15);
        }
        * {
            color: var(--primary-btn-bg);
        }
        &--thin {
            border: 1px solid var(--primary-btn-bg);
        }
    }
    &--cta {
        background-color: var(--cta-bg);
    }
    &--plain {
        background-color: var(--primary-disabled-bg-solid);
        * {
            color: var(--text-color-reverse);
        }
    }
    &--opaque {
        /* background-color: var(--primary-disabled-bg); */
        background-color: #3f4040;
        border: 2px solid transparent;
        * {
            color: var(--text-color-reverse);
        }
        /* &.selectable:hover, */
        &:hover,
        &.selected {
            /* border: 1px solid var(--flat-outline) !important; */
            border: 2px solid var(--primary-btn-bg);
            background-color: rgba(67, 187, 112, 0.3);
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
        $height: 3rem;
        height: $height;
        border-radius: var(--inner-wdg-radius);
    }
    &--unclickable {
        pointer-events: none;
    }
    &--tiny {
        padding: 0;
    }
    &--compact {
        border-radius: 3px;

        padding-right: 10px;
        padding-left: 10px;
    }
    &--reverse {
        flex-direction: row-reverse;
        #icon-slot {
            margin-left: -0.3rem !important;
            margin-right: 0 !important;
        }
    }
    &--w-icon {
        gap: 0.2rem;
        #icon-slot {
            margin-right: -0.3rem;
            margin-left: 0;
        }
    }
}

.cta-dd {
    /* > button {
        border: none !important;
    } */
    > :first-child {
        /* padding-right: 13px !important; */
    }
    > :last-child button {
        /* padding-left: 10px !important; */
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
