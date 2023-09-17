<template>
    <div class="modal">
        <div class="notify-wrapper">
            <!-- <Btn @click="notify(null, 'approve')">Notify</Btn> -->
            <Notification
                v-for="notif in notifications"
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
const allStates = ["approve", "pending", "success", "error"]

function notify(id, state) {
    if (!allStates.includes(state)) {
        console.log("notif(): provided invalid state")
        return null
    }
    const existingNotif = notifications.value.find((el) => el.id === id)
    if (!existingNotif) {
        return createNotif(state)
    } else {
        return updateNotification(existingNotif, state)
    }
}
stepStore.notify = notify

function createNotif(state) {
    const newNotif = {
        id: uuid(),
        state,
    }
    notifications.value.unshift(newNotif)
    console.log("created", state, "notification")
    return newNotif.id
}

function updateNotification(existingNotif, state) {
    const notifIndex = notifications.value.indexOf(existingNotif)
    const updatedNotif = { ...existingNotif, state: state }
    notifications.value[notifIndex] = updatedNotif
    console.log("updated notification to", state)
    return existingNotif.id
}
function deleteNotif(id) {
    console.log("removing notification", id)
    notifications.value = notifications.value.filter((notif) => notif.id !== id)
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
