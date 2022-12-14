<template>
    <div class="centerize">
        <!-- <h1>Charts</h1> -->
        <div class="display">
            <div>
                <p><b>wallet address</b>{{ stepStore.getConnectedAccount || empty }}</p>
            </div>
            <Btn v-if="stepStore.connectedWallet === null" wide @click="stepStore.connectWallet()"> connect </Btn>
            <Btn v-else secondary thin wide @click="stepStore.disconnectConnectedWallet">disconnect</Btn>
        </div>
    </div>
</template>

<script setup>
import { useStepStore } from "@/stores/step"
const stepStore = useStepStore()
const empty = "ᕙ(⇀‸↼‶)ᕗ"
</script>

<style lang="scss" scoped>
.display {
    width: 540px;
    background-color: var(--swap-bg);
    transition: background-color var(--transition);
    border-radius: var(--outer-wdg-radius);
    box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px;
    margin-left: 2rem;
    margin-bottom: 100%;
    padding: 2rem;
    div {
        margin-bottom: 2rem;
        p {
            margin-bottom: 0.5rem;
        }
    }
    b {
        font-size: 1.7rem;
        font-weight: bolder;
        margin-right: 1rem;
    }
    h3 {
        font-size: 2rem;
    }
}
</style>
