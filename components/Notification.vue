<template>
    <div
        class="notify base-box row"
        :class="[
            {
                'notify--approve': notify.state === 'approve',
                'notify--pending': notify.state === 'pending',
                'notify--success': notify.state === 'success',
                'notify--error': notify.state === 'error',
            },
        ]"
    >
        <!-- @click.self="complete" -->
        <div
            class="notify__icon"
            :class="{ 'notify__icon--done': notify.isDone }"
        >
            <svg viewBox="0 0 100 100">
                <circle
                    class="circle-background"
                    cx="50"
                    cy="50"
                    r="42"
                ></circle>
                <circle
                    class="circle-progress"
                    :class="{ spinning: spinning }"
                    cx="50"
                    cy="50"
                    r="42"
                ></circle>
            </svg>
        </div>
        <div class="notify__content">
            <h4>{{ notify.header }}</h4>
            <p class="caption">{{ notify.paragraph }}</p>
        </div>
        <div
            class="close"
            :class="{ grey: notify.state === 'approve' || notify.state === 'pending' }"
        >
            <Icon
                name="cross"
                :size="13"
            />
        </div>
    </div>
</template>

<script setup>
const notifications = {
    approve: {
        state: "approve",
        header: "Approve spending",
        paragraph: "Please approve spending funds.",
        isDone: false,
    },
    pending: {
        state: "pending",
        header: "Transaction mining",
        paragraph: "Your transaction is being processed.",
        isDone: false,
    },
    success: {
        state: "success",
        header: "Transaction succeeded",
        paragraph: "funds added / swaped / redeemed.",
        isDone: true,
    },
    error: {
        state: "error",
        header: "Transaction failed",
        paragraph: "There was an error.",
        isDone: true,
    },
}
const props = defineProps({
    notify: String,
})
const notify = computed(() => notifications[props.notify])
const spinning = ref(true)
watch(
    () => notify.value.isDone,
    (newVal) => {
        if (newVal) {
            setTimeout(() => {
                spinning.value = false
            }, 700)
        } else {
            spinning.value = true
        }
    },
    {
        immediate: true,
    }
)
</script>

<style lang="scss" scoped>
$color-transition: 0.4s 0.3s ease-out;
$transition: 0.4s ease-out;
.notify {
    $top-padd: 0.9rem;
    $side-padd: 1.3rem;
    margin-top: 5px;
    padding: $top-padd $side-padd;
    padding-right: 0;
    border-radius: var(--semi-wdg-radius);
    box-shadow: var(--modal-box-shadow);
    cursor: pointer;
    pointer-events: all;
    transition: $color-transition;
    & * {
        pointer-events: none;
    }

    &__content {
        /* align-self: center; */
        h4 {
            margin-bottom: 7px;
        }
        p {
            margin-bottom: 3px;
        }
    }

    .close {
        margin-left: auto;
        margin-right: $top-padd;
        transition: color $color-transition;
        &.grey {
            color: var(--text-grey);
        }
    }

    &__icon {
        height: 35px;
        width: 35px;
        align-self: center;
        flex-shrink: 0;
        margin-right: $side-padd;

        .circle-background,
        .circle-progress {
            fill: none;
            stroke-width: 12;
        }
        .circle-background {
            stroke: var(--grey-opaque);
        }
        .circle-progress {
            stroke: var(--primary-btn-bg);

            /* Adjusted for 67.5 degrees */
            stroke-dasharray: 46.864, 204.466;

            /* Adjusted for 120 degrees */
            /* stroke-dasharray: 83.77, 167.56; */

            stroke-dashoffset: -26.51;
            stroke-linecap: round;
            transform-origin: 50% 50%;
            transition: stroke-dasharray $transition, stroke $color-transition;
            &.spinning {
                animation: spin 2s linear infinite;
            }
            @keyframes spin {
                100% {
                    transform: rotate(360deg);
                }
            }
        }
        &--done .circle-progress {
            stroke-dasharray: 251.33 0 !important;
        }
    }
    &--approve {
    }
    &--pending {
        .circle-progress {
            /* Adjusted for 135 degrees */
            stroke-dasharray: 106.03 176.71;

            /* Adjusted for 240 degrees */
            /* stroke-dasharray: 167.55, 83.78;  */
        }
    }
    &--success {
        background-color: var(--primary-btn-bg);
        color: var(--text-color);
        .circle-progress {
            stroke: var(--text-color);
        }
        .close {
            color: var(--text-color);
        }
    }
    &--error {
        background-color: var(--error-color);
        .circle-progress {
            stroke: var(--text-color-reverse);
        }
    }
}
</style>
