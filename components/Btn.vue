<template>
    <!-- <button>{{ $slots.default }}</button> -->
    <button>
        <slot name="default"></slot>
    </button>
</template>

<script setup lang="ts">
import { useStepStore } from "@/stores/step"
const stepStore = useStepStore()

const props = defineProps({})
const emits = defineEmits([])
</script>

<style lang="scss" scoped>
button {
    font-size: inherit;
    padding: 0.8rem 1.9rem;
    background-color: var(--nav-actions-bg);
    transition: background-color var(--transition);
    border-radius: 8px;
    border: 1px solid var(--swap-main-btn-bg);
}
</style>
