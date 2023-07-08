<template>
    <div class="icon">
        <div
            :alt="props.name"
            :class="{ rotate: props.rotate }"
            v-html="svgContent"
        ></div>
    </div>
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
        type: Boolean,
    },
})
const iconSize = ref(props.size)
const sizeWithPx = computed(() => {
    return iconSize.value + "px"
})

// const { data: svgContent } = await useFetch(getIconPath(), {
//     onResponse({ response }) {
//         console.log("response._data.text():", response._data.text())
//         return response._data.text()
//     },
// })
const svgContent = ref("")
loadSvgAsString(getIconPath())
    .then((svgString) => {
        svgContent.value = svgString
    })
    .catch((error) => {
        console.error("Error loading SVG:", error)
    })

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
    width: v-bind(sizeWithPx);
    div.rotate {
        transform: rotate(180deg);
    }
    img {
        display: block;
    }
}
</style>
