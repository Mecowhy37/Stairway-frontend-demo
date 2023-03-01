<template>
    <button
        class="btn"
        ref="btn"
        :class="[
            {
                'btn--secondary': props.secondary,
                'btn--wide': props.wide,
                'btn--transparent': props.transparent,
                'btn--plain': props.plain,
                'btn--pill': props.pill,
                thin: props.secondary && props.thin,
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

interface Props {
    secondary?: boolean
    wide?: boolean
    thin?: boolean
    transparent?: boolean
    plain?: boolean
    pill?: boolean
}
const props = withDefaults(defineProps<Props>(), {})
const emits = defineEmits([])
const slots = useSlots()

const btn = ref(null)
const btnHeight = ref("")
onMounted(() => {
    const btnEl = btn.value
    btnHeight.value = btnEl.offsetHeight + "px"
})
defineExpose({
    btnHeight,
})
</script>

<style lang="scss">
$vert-padd: 0.8rem;
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
    padding: $vert-padd 1.5rem;
    white-space: nowrap;
    * {
        color: var(--primary-btn-color);
        pointer-events: none;
    }
    border: 1px solid transparent;
    &:hover {
        border: 1px solid;
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
            border-color: var(--flat-outline);
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
    &--transparent {
        background-color: transparent;
    }
    &--wide {
        width: 100%;
    }
    &--pill {
        border-radius: calc(v-bind(btnHeight) / 2);
    }
}
.cta-dropdown button {
    border: none !important;
}
</style>
