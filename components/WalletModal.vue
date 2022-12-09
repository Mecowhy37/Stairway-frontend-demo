<template>
    <div class="modal__overlay">
        <!-- <div class="modal__window"> -->
        <!-- <div class="modal__topbar"></div> -->
        <!-- </div> -->
        <div
            v-if="stepStore.activeWallet !== null"
            class="caption"
            @click="stepStore.getBalance(stepStore.activeWallet)"
        >
            active wallet:<br />
            <p>{{ stepStore.activeWallet }}</p>
        </div>
    </div>
</template>

<script>
import { useStepStore } from "@/stores/step"
import { mapStores } from "pinia"
import { ethers } from "ethers"

export default {
    computed: {
        ...mapStores(useStepStore),
    },
}
</script>

<style lang="scss" scoped>
.modal {
    &__overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        display: grid;
        pointer-events: none;
        /* background-color: rgba(0, 0, 0, 0.4); */
    }

    &__window {
        place-self: center;
        pointer-events: all;
        width: 400px;
        height: 350px;
        background-color: white;
        border-radius: 12px;
        transform: translateX(-110%);
    }

    &__topbar {
        width: 100%;
        height: 50px;
        border-bottom: 1px solid black;
    }
}

.caption {
    padding: 2rem;
    pointer-events: all;
    cursor: pointer;
    border-radius: 6px;
    text-align: center;
    justify-self: end;
    align-self: end;
    border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
