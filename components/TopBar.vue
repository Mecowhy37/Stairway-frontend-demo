<template>
    <div
        class="top-bar"
        :class="[{ compact: props.compact, 'thin-line': props.thinLine }]"
    >
        <Btn
            v-if="props.routerDirection"
            @click="routerNavigation"
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
        <component
            :is="props.is"
            class="widget-title"
            :class="{ 'widget-title--margin': props.routerDirection }"
        >
            <slot name="widget-title"></slot>
        </component>
        <div class="right-icon">
            <slot name="right-icon"></slot>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    routerDirection: String,
    compact: Boolean,
    thinLine: Boolean,
    is: {
        type: String,
        default: "h3",
    },
})
const router = useRouter()
function routerNavigation() {
    if (props.routerDirection === "back") {
        router.back()
    } else {
        navigateTo(props.routerDirection)
    }
}
</script>

<style lang="scss" scoped>
.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-color-reverse);
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
        margin: -3px 0;
        .icon {
            margin: 0 6.75px !important;
        }
    }

    .right-icon {
        /* align-self: flex-start; */
    }
}
</style>
