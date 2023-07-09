<template>
    <div
        class="top-bar row"
        :class="[{ compact: props.compact, 'thin-line': props.thinLine }]"
    >
        <Btn
            tiny
            transparent
            class="back-btn"
            v-if="!noReturn"
        >
            <template #icon>
                <Icon
                    name="arrow"
                    :size="15"
                    :rotate="90"
                ></Icon>
            </template>
        </Btn>
        <component
            :is="props.is"
            class="widget-title"
            ><slot name="widget-title"></slot
        ></component>
        <div class="grey-text">
            <slot name="right-icon"></slot>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    noReturn: Boolean,
    compact: Boolean,
    thinLine: Boolean,
    is: {
        type: String,
        default: "h3",
    },
})
</script>

<style lang="scss" scoped>
.top-bar {
    color: var(--text-color-reverse);
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--text-color-reverse);
    padding: 20px 0;
    margin: 0 20px;
    &.compact {
        margin: 0;
        padding: 12px;
    }
    &.thin-line {
        border-bottom: 1px solid var(--text-color-reverse);
    }
    .widget-title {
        margin-right: auto;
        color: inherit;
    }
    .back-btn {
        margin-right: 20px;
        color: var(--text-color-reverse);
    }
}
</style>
