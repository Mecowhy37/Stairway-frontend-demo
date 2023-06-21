<template>
    <div class="icon">
        <img
            :src="getIconPath()"
            :alt="props.name"
        />
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

function getIconPath() {
    return `/icons/${props.name}.svg`
}

const iconSize = ref(props.size)
const sizeWithPx = computed(() => {
    return iconSize.value + "px"
})
</script>

<style lang="scss" scoped>
.icon {
    width: v-bind(sizeWithPx);
    img {
        display: block;
    }
}
</style>
