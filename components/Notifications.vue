<template>
    <div class="modal">
        <div class="notify-wrapper">
            <div
                v-for="notif in notifs"
                class="notify base-box"
            >
                event {{ notif }}
            </div>
        </div>
    </div>
</template>

<script setup>
const notifs = ref([1, 2])
</script>

<style lang="scss" scoped>
.modal {
    pointer-events: none;
}
.notify-wrapper {
    place-self: end;
    width: 350px;
    height: 50vh;
    padding: 5px;
    display: flex;
    flex-direction: column;
    justify-content: end;

    /* background-color: red; */

    .notify {
        margin-top: 5px;
        padding: 1rem;
        border-radius: var(--semi-wdg-radius);
        box-shadow: var(--modal-box-shadow);
    }
}
</style>
