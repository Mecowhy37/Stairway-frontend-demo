<template>
    <div
        :key="id"
        class="notif base-box row"
        :class="[
            {
                'notif--approve': notif.state === 'approve',
                'notif--sign': notif.state === 'sign',
                'notif--pending': notif.state === 'pending',
                'notif--success': notif.state === 'success',
                'notif--error': notif.state === 'error',
            },
        ]"
    >
        <!-- @click.self="complete" -->
        <div
            class="notif__icon"
            :class="{ 'notif__icon--done': notif.isDone }"
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
            <TransitionGroup>
                <Icon
                    key="tick"
                    v-show="notif.isDone && notif.state === 'success'"
                    class="notif__icon__symbol"
                    name="tick"
                    :size="9"
                ></Icon>
                <Icon
                    key="soloWarrning"
                    v-show="notif.isDone && notif.state === 'error'"
                    class="notif__icon__symbol"
                    name="soloWarrning"
                    :size="3"
                ></Icon>
            </TransitionGroup>
        </div>
        <div class="notif__content">
            <h4>{{ notif.header }}</h4>
            <p class="caption">
                {{ notif.paragraph }}
            </p>
            <!-- <TransitionGroup mode="out-in">
                <div
                    class="notif__content__transition"
                    :key="notif.header"
                >
                    <h4 :key="notif.header">{{ notif.header }}</h4>
                    <p
                        :key="notif.paragraph"
                        class="caption"
                    >
                        {{ notif.paragraph }}
                    </p>
                </div>
            </TransitionGroup> -->
        </div>
        <div class="close">
            <Btn
                @click="deleteNotif(id)"
                circle
                transparent
                :class="{ 'grey-text': notif.state === 'approve' || notif.state === 'pending' }"
            >
                <template #icon>
                    <Icon
                        name="cross"
                        :size="13"
                    />
                </template>
            </Btn>
        </div>
    </div>
</template>

<script setup>
const notifications = {
    approve: {
        state: "approve",
        header: "Approve spending",
        paragraph: "Please approve spending funds",
        isDone: false,
    },
    sign: {
        state: "sign",
        header: "Please sign a transaction",
        paragraph: "Sign to complete a transaction",
        isDone: false,
    },
    confirming: {
        state: "confirming",
        header: "Waiting for confirmation",
        paragraph: "Your signature is getting confirmed",
        isDone: false,
    },
    pending: {
        state: "pending",
        header: "Transaction mining",
        paragraph: "Your transaction is being processed",
        isDone: false,
    },
    success: {
        state: "success",
        header: "Transaction succeeded",
        paragraph: "Your transaction was successfully processed",
        isDone: true,
    },
    error: {
        state: "error",
        header: "Transaction failed",
        paragraph: "Your transaction was not completed",
        isDone: true,
    },
}
const props = defineProps({
    notif: Object,
    deleteNotif: Function,
})
const notif = computed(() => notifications[props.notif.state])
const id = computed(() => props.notif.id)

const spinning = ref(true)
watch(
    () => notif.value.isDone,
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

.v-enter-active,
.v-leave-active {
    transition: opacity $color-transition;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
.notif {
    $top-padd: 0.9rem;
    $side-padd: 1.3rem;
    margin-top: 5px;
    padding: $top-padd $side-padd;
    padding-right: 0;
    border-radius: var(--semi-wdg-radius);
    box-shadow: var(--modal-box-shadow);
    transition: $color-transition;

    &__content {
        flex-grow: 1;
        /* height: 48px; */
        &__transition {
            position: absolute;
        }
        h4 {
            margin-bottom: 7px;
        }
        p {
            margin-bottom: 4px;
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
        position: relative;
        height: 35px;
        width: 35px;
        align-self: center;
        flex-shrink: 0;
        margin-right: $side-padd;

        &__symbol {
            position: absolute;
            transform: translate(-50%, -50%);
            top: 50%;
            left: 51%;
        }
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
                animation: spin 1.5s linear infinite;
            }
            @keyframes spin {
                100% {
                    transform: rotate(360deg);
                }
            }
        }
        &--done {
            .circle-progress {
                stroke-dasharray: 251.33 0 !important;
            }
        }
    }
    &--approve {
    }
    &--sign {
        .circle-progress {
            /* Adjusted for 135 degrees */
            stroke-dasharray: 106.03 176.71;
        }
    }
    &--pending {
        .circle-progress {
            /* Adjusted for 202.5 degrees */
            stroke-dasharray: 140.74, 110.59;

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
        .close .btn {
            color: inherit;
        }
    }
}
</style>
