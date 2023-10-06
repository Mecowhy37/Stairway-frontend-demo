<template>
    <p>
        <span class="text-highlight">Tip: </span>
        Get tokens for test in the
        <span
            @click="openTokenSelectModal"
            class="activator-link text-highlight text-highlight--border"
            >faucet</span
        >
    </p>
</template>

<script setup>
const toggleSelectTokenModal = inject("selectTokenModal")

const props = defineProps({
    callback: Function,
})

function openTokenSelectModal() {
    toggleSelectTokenModal(null, props.callback, null, true)
}
</script>

<style lang="scss" scoped></style>
