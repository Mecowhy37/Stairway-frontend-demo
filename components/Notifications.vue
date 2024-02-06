<template>
    <div class="modal">
        <div class="notify-wrapper">
            <div
                v-if="notifications.length < 1"
                class="empty-notif"
                @click="notify({ id: null }, 'approve')"
            >
                Show a notification.
            </div>
            <Notification
                v-for="notif in notifications"
                :key="notif.id"
                :notif="notif"
                :delete-notif="deleteNotif"
                @click="toggleNotifState(notif)"
            ></Notification>
        </div>
    </div>
</template>

<script setup>
import { v4 as uuid } from "uuid"
import { useStepStore } from "@/stores/step"

const stepStore = useStepStore()

const notifications = ref([])
const allStates = ["approve", "sign", "pending", "success", "pending", "error"]
let stateTicker = 0

function notify(notifyHolder, state, symbol = false, successData = false, keepNotification = false) {
    if (!allStates.includes(state)) {
        console.log("notif(): provided invalid state")
        return null
    }
    const existingNotif = notifications.value.find((el) => el.id === notifyHolder.id)
    if (!existingNotif) {
        notifyHolder.id = createNotif(state, symbol, successData, keepNotification)
    } else {
        notifyHolder.id = updateNotification(existingNotif, state, symbol, successData, keepNotification)
    }
}
stepStore.notify = notify

function toggleNotifState(notif) {
    const lengthOfAllStates = allStates.length
    if (stateTicker === lengthOfAllStates - 1) {
        stateTicker = 0
    } else {
        stateTicker++
    }
    console.log("stateTicker:", stateTicker)
    const newNotifState = allStates[stateTicker]
    updateNotification(notif, newNotifState, false, null, false)
}

function createNotif(state, symbol, successData, keepNotification) {
    const newNotif = {
        id: uuid(),
        state,
        symbol,
        successData,
        keepNotification,
    }
    notifications.value.push(newNotif)
    // notifications.value.unshift(newNotif)
    console.log("created", state, "notification")
    return newNotif.id
}

function updateNotification(existingNotif, state, symbol, successData, keepNotification) {
    const notifIndex = notifications.value.indexOf(existingNotif)
    const updatedNotif = { ...existingNotif, state, symbol, successData, keepNotification }
    console.log("updatedNotif:", updatedNotif)
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
    $width: 450px;
    width: $width;
    flex-direction: column;
    justify-content: flex-end;
    height: 50vh;
    padding: 5px;
    z-index: 100;
    pointer-events: none;
    & * {
        pointer-events: all;
    }
    @media (max-width: $width) {
        width: 100%;
    }
}
.empty-notif {
    $vert-padd: 31px;
    $horiz-padd: 16px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--semi-wdg-radius);
    border: 1.5px dashed var(--text-color-reverse);
    /* border: 2px dashed var(--text-grey); */
    padding: $vert-padd $horiz-padd;
    color: var(--text-color-reverse);
    white-space: nowrap;
    background-color: transparent;
    box-shadow: var(--button-box-shadow);
    cursor: pointer;
}
</style>
