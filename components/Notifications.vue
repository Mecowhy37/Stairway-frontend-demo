<template>
    <div class="modal">
        <div class="notify-wrapper">
            <Notification
                v-for="(notify, index) in notifications"
                :notify="notify"
                @click="increment()"
            ></Notification>
        </div>
    </div>
</template>

<script setup>
const notifications = ref(["approve"])
const stateExectutionOrder = ["approve", "pending", "success", "approve", "pending", "error"]

let state = ref(0)
function increment() {
    state.value = state.value === stateExectutionOrder.length - 1 ? 0 : state.value + 1
}
watch(state, (newVal) => {
    notifications.value[0] = stateExectutionOrder[newVal]
})
</script>

<style lang="scss" scoped>
.modal {
    pointer-events: none;
}
.notify-wrapper {
    place-self: end;
    width: 400px;
    height: 50vh;
    padding: 5px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    z-index: 100;
}
</style>
