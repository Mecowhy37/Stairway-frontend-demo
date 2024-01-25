<template>
    <span
        class="icon-holder"
        ref="jazzIcon"
    />
</template>

<script setup>
import jazzicon from "@metamask/jazzicon"

const props = defineProps({
    account: {
        type: String,
        default: "",
    },
    size: {
        type: Number,
        default: 16,
    },
})

const jazzIcon = ref(null)

watchEffect(() => {
    if (props.account && jazzIcon.value) {
        const addr = props.account.slice(2, 10)
        const seed = parseInt(addr, 16)
        const icon = jazzicon(props.size, seed)

        icon.style.display = "block"
        jazzIcon.value.innerHTML = ""
        jazzIcon.value.append(icon)
    }
})
</script>

<style lang="scss" scoped>
.icon-holder {
    margin-right: 7px !important;
}
</style>
