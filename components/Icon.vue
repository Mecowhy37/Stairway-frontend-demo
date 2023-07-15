<template>
    <div
        class="icon"
        :alt="props.name"
        :class="{ rotate: props.rotate }"
        v-html="svgContent"
    ></div>
</template>

<script setup>
import icons from "~/helpers/icons"
const props = defineProps({
    size: {
        type: Number,
        default: 25,
    },
    name: {
        type: String,
    },
    rotate: {
        required: false,
        type: Number,
        default: 0,
    },
})
const iconSize = ref(props.size)
const sizeWithPx = computed(() => {
    return iconSize.value + "px"
})

const svgContent = computed(() => {
    return icons[props.name]
})
const rotateDeg = computed(() => {
    return props.rotate + "deg"
})
</script>

<style lang="scss" scoped>
.icon {
    width: v-bind(sizeWithPx);
    height: min-content;
    transform: rotate(v-bind(rotateDeg));
}
</style>
