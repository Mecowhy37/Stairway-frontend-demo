<template>
    <div class="modal">
        <div class="notify-wrapper">
            <!-- <Btn @click="notify(null, 'approve')">Notify</Btn> -->
            <Notification
                v-for="notif in notifications"
                :key="notif.id"
                :notif="notif"
                :delete-notif="deleteNotif"
            ></Notification>
        </div>
    </div>
</template>

<script setup>
import { v4 as uuid } from "uuid"
import { useStepStore } from "@/stores/step"

const stepStore = useStepStore()

const notifications = ref([])
const allStates = ["approve", "sign", "confirming", "pending", "success", "error"]

function notify(notifyHolder, state, symbol = false) {
    if (!allStates.includes(state)) {
        console.log("notif(): provided invalid state")
        return null
    }
    const existingNotif = notifications.value.find((el) => el.id === notifyHolder.id)
    if (!existingNotif) {
        notifyHolder.id = createNotif(state, symbol)
    } else {
        notifyHolder.id = updateNotification(existingNotif, state, symbol)
    }
}
stepStore.notify = notify

function createNotif(state, symbol) {
    const newNotif = {
        id: uuid(),
        state,
        symbol,
    }
    notifications.value.unshift(newNotif)
    console.log("created", state, "notification")
    return newNotif.id
}

function updateNotification(existingNotif, state, symbol) {
    const notifIndex = notifications.value.indexOf(existingNotif)
    const updatedNotif = { ...existingNotif, state, symbol }
    notifications.value[notifIndex] = updatedNotif
    console.log("updated notification to", state)
    return existingNotif.id
}
function deleteNotif(id) {
    const targetNotification = notifications.value.find((notif) => notif.id === id)
    if (targetNotification) {
        console.log("removing notification:", targetNotification.state)
        notifications.value = notifications.value.filter((notif) => notif !== targetNotification)
    }
}
</script>

<style lang="scss" scoped>
.modal {
    pointer-events: none;
}
.notify-wrapper {
    place-self: flex-end;
    display: flex;
    width: 400px;
    flex-direction: column;
    justify-content: flex-end;
    height: 50vh;
    padding: 5px;
    z-index: 100;
    pointer-events: none;
    & * {
        pointer-events: all;
    }
    @media (max-width: 400px) {
        width: 100%;
    }
}
</style>
