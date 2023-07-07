<template>
    <div class="icon">
        <div
            :alt="props.name"
            v-html="svgContent"
        ></div>
    </div>
</template>

<script setup lang="ts">
export interface Props {
    name: string
    size?: number
}

const props = withDefaults(defineProps<Props>(), {
    size: 25,
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
async function loadSvgAsString(filePath: string) {
    try {
        const response = await $fetch(filePath)
        console.log("response:", response)
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
    img {
        display: block;
    }
}
</style>
