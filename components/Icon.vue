<template>
    <div class="icon">
        <img
            :src="getIconPath()"
            :alt="name"
        />
    </div>
</template>

<script setup lang="ts">
export interface Props {
    name: string
}

const props = defineProps<Props>()

function getIconPath() {
    return `/icons/${props.name}.svg`
}
</script>

<style lang="scss" scoped>
.icon {
    width: 30px;
    /* height: 30px; */
}
</style>
