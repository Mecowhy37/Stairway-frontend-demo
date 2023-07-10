<template>
    <div
        class="icon"
        :alt="props.name"
        :class="{ rotate: props.rotate }"
        v-html="svgContent"
    ></div>
</template>

<script setup>
const props = defineProps({
    size: {
        type: Number,
        default: 25,
    },
    name: {
        type: String,
    },
    rotate: {
        type: Number,
        default: 0,
    },
})
const iconSize = ref(props.size)
const sizeWithPx = computed(() => {
    return iconSize.value + "px"
})

const rotateDeg = computed(() => {
    return props.rotate + "deg"
})

//icons can be placed as svg strings
const svgContent = ref("")
// loadSvgAsString(getIconPath())
//     .then((svgString) => {
//         svgContent.value = svgString
//     })
//     .catch((error) => {
//         console.error("Error loading SVG:", error)
//     })

function getIconPath() {
    return `/icons/${props.name}.svg`
}
async function loadSvgAsString(filePath) {
    try {
        const response = await $fetch(filePath)
        const svgString = await response.text()
        return svgString
    } catch (error) {
        return ""
    }
}
</script>

<style lang="scss" scoped>
.icon {
    transform: rotate(v-bind(rotateDeg));
    width: v-bind(sizeWithPx);
}
</style>
