<template>
    <div
        v-if="showModal"
        @click.self.prevent="toggleModal"
        class="modal modal--lower modal--focus"
    >
        <!-- <div class="base-box"> -->
        <Widget
            no-return
            no-bar
            class="get-tokens"
        >
            <template #widget-content>
                <div class="token-part">
                    <div class="token-picker">
                        <div class="row space-between">
                            <p class="grey-text">symbol</p>
                            <span
                                v-if="truncatedTokenAddress"
                                class="address row"
                                @click="copyAddress"
                                @mouseover="hoverIn"
                                @mouseout="hoverOut"
                            >
                                <p v-if="!copied">
                                    {{ truncatedTokenAddress }}
                                </p>
                                <p v-else-if="copied">copied!</p>
                            </span>
                        </div>
                        <div class="layer-wdg-box row">
                            <Btn
                                transparent
                                icon-contrast
                                @click="openTokenSelectModal()"
                            >
                                <template #icon>
                                    <Icon
                                        name="chevron"
                                        :size="16"
                                    />
                                </template>
                            </Btn>
                            <div class="divider"></div>
                            <input
                                v-model="tokenSymbol"
                                type="text"
                                placeholder="STRVY"
                            />
                        </div>
                    </div>
                    <div>
                        <p class="grey-text">amount</p>
                        <div class="layer-wdg-box">
                            <input
                                v-model="tokenAmount"
                                type="number"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>
                <div class="buttons">
                    <Btn
                        v-if="stepStore.connectedWallet"
                        @click="getTokens"
                        is="h4"
                        wide
                        bulky
                        :disabled="!canGetTokens"
                    >
                        {{ claimed ? "Tokens claimed!" : "Get Tokens" }}
                    </Btn>
                    <Btn
                        v-if="!stepStore.connectedWallet"
                        is="h4"
                        wide
                        bulky
                        @click="stepStore.connectWallet()"
                    >
                        Connect wallet
                    </Btn>
                </div>
            </template>
        </Widget>
    </div>
</template>

<script setup>
import { BrowserProvider, Contract, parseEther } from "ethers"
import { getToken, useBalances, usePools } from "~/helpers/index"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"
const stepStore = useStepStore()
const { featuredTokens } = storeToRefs(stepStore)

const { listenForTransactionMine } = usePools(stepStore.routerAddress)

const tokenSymbol = ref("")
const tokenAmount = ref(1000000)
const copied = ref(false)
const claimed = ref(false)

const showModal = ref(false)
function toggleModal() {
    showModal.value = !showModal.value
}
defineExpose({
    toggleModal,
})

async function getTokenList() {
    console.log("getTokenList()")
}
async function getTokens() {
    console.log("getTokens()")
}
function copyAddress() {
    copied.value = true
    navigator.clipboard.writeText(selectedAddress.value)
}
const canGetTokens = computed(() => {
    return tokenSymbol.value.length >= 1 && tokenAmount.value > 0
})
const selectedAddress = computed(() => {
    return featuredTokens.value.find((el) => el.symbol.toUpperCase() === tokenSymbol.value)?.address
})

const truncatedTokenAddress = computed(() => {
    if (!selectedAddress.value) {
        return null
    }

    const toTruncate = selectedAddress.value.split("")
    const start = toTruncate.splice(0, 5).join("")
    const end = toTruncate.splice(-4).join("")
    return start + "..." + end
})
// SELECT TOKEN MODAL -----------
const toggleSelectTokenModal = inject("selectTokenModal")
function openTokenSelectModal() {
    toggleSelectTokenModal(null, setToken)
}
function setToken(token) {
    tokenSymbol.value = token?.symbol ? token.symbol : ""
}
// SELECT TOKEN MODAL -----------
watch(tokenSymbol, (newVal, oldVal) => {
    newVal = newVal.replace(/[^a-zA-Z]/g, "")
    if (newVal.length > 5) {
        newVal = oldVal
    }
    tokenSymbol.value = newVal.toUpperCase()
})

watch(copied, (newVal) => {
    if (newVal) {
        setTimeout(() => {
            copied.value = false
        }, 1000)
    }
})
watch(claimed, (newVal) => {
    if (newVal) {
        setTimeout(() => {
            claimed.value = false
        }, 2000)
    }
})
</script>

<style lang="scss" scoped>
.get-tokens {
    place-self: center;
    z-index: 3;
}
</style>
