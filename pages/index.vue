<template>
    <div class="centerize">
        <!-- <h1>Charts</h1> -->
        <div class="display">
            <div>
                <p><b>wallet address</b>{{ stepStore.connectedWallet?.accounts[0]?.address || empty }}</p>
            </div>
            <button v-if="stepStore.connectedWallet === null" @click="connectWallet" class="btn btn--primary">
                <h3>
                    {{ stepStore.isConnectingText }}
                </h3>
            </button>
            <template v-else>
                <button class="btn btn--secondary" @click="stepStore.disconnectConnectedWallet">
                    <h3>disconnect</h3>
                </button>
                <button class="btn btn--primary">
                    <h3>swap</h3>
                </button>
            </template>
        </div>
    </div>
</template>

<script setup>
import { useStepStore } from "~/stores/step"
const stepStore = useStepStore()
const empty = "ᕙ(⇀‸↼‶)ᕗ"

function connectWallet() {
    stepStore.connectingWallet = true
    stepStore.connectWallet().then(() => {
        stepStore.connectingWallet = false
    })
}
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
    .btn {
        margin-top: 1rem;

        width: 100%;
        border-radius: 12px;
        text-align: center;
        padding: 1.3rem 0;
        border: none;
        transition-property: background-color, border;
        transition-duration: var(--transition);
        cursor: pointer;
        h3 {
            transition: color var(--transition);
        }
        &--primary {
            background-color: var(--swap-main-btn-bg);
            h3 {
                color: var(--swap-main-btn-color);
            }
        }
        &--secondary {
            background-color: transparent;
            border: 2px solid var(--swap-main-btn-bg);
            h3 {
                color: var(--swap-main-btn-bg);
            }
        }
    }
}
</style>
