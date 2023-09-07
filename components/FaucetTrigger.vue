<template>
    <p v-if="props.connectedChainId === 80001">
        <span class="text-highlight">Tip: </span>
        Get tokens for test in the
        <span
            @click="openNewTokenModal"
            class="activator-link text-highlight text-highlight--border"
            >faucet</span
        >
    </p>
</template>

<script setup>
const { toggleNewTokenModal, isNewTokenModalOpen } = inject("newTokenModal")

const props = defineProps({
    closingCallback: Function,
    connectedChainId: Number,
})
function openNewTokenModal() {
    toggleNewTokenModal()
}
watch(isNewTokenModalOpen, (newVal) => {
    if (!newVal) {
        props.closingCallback.call(this)
    }
})
</script>

<style lang="scss" scoped></style>
