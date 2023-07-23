<template>
    <div
        class="top-bar row"
        :class="[{ compact: props.compact, 'thin-line': props.thinLine }]"
    >
        <NuxtLink
            v-if="!noReturn"
            to="/pools"
            class="link"
        >
            <Btn
                transparent
                circle
                class="back-btn"
                tiny
                :rotate="90"
            >
                <template #icon>
                    <Icon
                        name="arrow"
                        :size="15"
                    ></Icon>
                </template>
            </Btn>
        </NuxtLink>
        <component
            :is="props.is"
            class="widget-title"
            :class="{ 'widget-title--margin': !props.noReturn }"
            ><slot name="widget-title"></slot
        ></component>
        <div>
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
        &--margin {
            margin-left: 10px;
        }
    }
    .back-btn {
        color: var(--text-color-reverse);
        margin-left: -4px;
        .icon {
            margin: 0 6.75px !important;
        }
    }
}
</style>
