<template>
    <div class="modal">
        <div class="notify-wrapper">
            <div
                v-for="(notif, index) in notifs"
                class="notify base-box row"
                :class="[
                    {
                        'notify--approve': notif.state === getState(notifEnum.approve).state,
                        'notify--pending': notif.state === getState(notifEnum.pending).state,
                        'notify--success': notif.state === getState(notifEnum.success).state,
                        'notify--error': notif.state === getState(notifEnum.error).state,
                    },
                ]"
            >
                <div class="notify__icon"></div>
                <div class="notify__content">
                    <h4>{{ notif.header }}</h4>
                    <p class="caption">{{ notif.paragraph }}</p>
                </div>
                <div
                    class="close"
                    :class="{ 'grey-text': index === notifEnum.approve || index === notifEnum.pending }"
                >
                    <Icon
                        name="cross"
                        :size="13"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const notifEnum = {
    approve: 0,
    pending: 1,
    success: 2,
    error: 3,
}
function getState(index) {
    return notifStates[index]
}
const notifStates = [
    { state: "approve", header: "Approve spending", paragraph: "Please approve spending funds." },
    { state: "pending", header: "Transaction mining", paragraph: "Your transaction is being processed." },
    { state: "succes", header: "Transaction succeeded", paragraph: "funds added / swaped / redeemed." },
    {
        state: "error",
        header: "Transaction failed",
        paragraph: "There was an error while processing your transaction, please try again.",
    },
]
const notifs = ref([
    { ...getState(notifEnum.approve) },
    { ...getState(notifEnum.pending) },
    { ...getState(notifEnum.success) },
    { ...getState(notifEnum.error) },
])
</script>

<style lang="scss" scoped>
.modal {
    pointer-events: none;
}
.notify-wrapper {
    place-self: end;
    max-width: 400px;
    height: 50vh;
    padding: 5px;
    display: flex;
    flex-direction: column;
    justify-content: end;

    /* background-color: red; */

    .notify {
        $top-padd: 0.9rem;
        $side-padd: 1.3rem;
        margin-top: 5px;
        padding: $top-padd $side-padd;
        padding-right: 0;
        border-radius: var(--semi-wdg-radius);
        box-shadow: var(--modal-box-shadow);

        &__content {
            /* align-self: center; */
            h4 {
                margin-bottom: 7px;
            }
            p {
                margin-bottom: 3px;
            }
        }
        &__icon {
            height: 35px;
            width: 35px;
            background-color: aliceblue;
            align-self: center;
            flex-shrink: 0;
            margin-right: $side-padd;
        }
        .close {
            margin-left: auto;
            margin-right: $top-padd;
        }
        &--approve {
        }
        &--pending {
        }
        &--success {
            background-color: var(--primary-btn-bg);
            color: var(--text-color);
        }
        &--error {
            background-color: var(--error-color);
        }
    }
}
</style>
