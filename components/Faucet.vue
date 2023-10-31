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
                                placeholder="SYMBOL"
                            />
                        </div>
                    </div>
                    <!-- <div>
                        <p class="grey-text">amount</p>
                        <div class="layer-wdg-box">
                            <input
                                v-model="tokenAmount"
                                type="number"
                                placeholder="0"
                            />
                        </div>
                    </div> -->
                </div>
                <div class="buttons">
                    <Btn
                        v-if="stepStore.connectedWallet"
                        @click="getTokens"
                        is="h4"
                        wide
                        bulky
                        :disabled="!selectedAddress"
                    >
                        {{ claimed ? "Tokens claimed!" : "Get 100 tokens" }}
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
import { BrowserProvider, id } from "ethers"
import { listenForTransactionMine } from "~/helpers/index"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"
const stepStore = useStepStore()
const { featuredTokens } = storeToRefs(stepStore)

const tokenSymbol = ref("")
const copied = ref(false)
const claimed = ref(false)

const showModal = ref(false)
function toggleModal() {
    showModal.value = !showModal.value
}
defineExpose({
    toggleModal,
    showModal,
})

async function getTokens() {
    const provider = new BrowserProvider(stepStore.connectedWallet.provider)
    const signer = await provider.getSigner()

    let functionSignature = id("faucet()").substring(0, 10)
    const tx = {
        to: selectedAddress.value,
        data: functionSignature,
    }

    signer.sendTransaction(tx).then(async (txRes) => {
        console.log("txRes:", txRes)

        await listenForTransactionMine(txRes, provider).then(() => {
            claimed.value = true
        })
    })
}
const selectedToken = computed(() => {
    if (!featuredTokens.value) {
        return null
    }
    return featuredTokens.value.find((el) => el.symbol.toUpperCase() === tokenSymbol.value)
})
const selectedAddress = computed(() => {
    return selectedToken.value?.address
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

function copyAddress() {
    copied.value = true
    navigator.clipboard.writeText(selectedAddress.value)
}
watch(tokenSymbol, (newVal, oldVal) => {
    newVal = newVal.replace(/[^a-zA-Z]/g, "")
    if (newVal.length > 7) {
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

// SELECT TOKEN MODAL -----------
const toggleSelectTokenModal = inject("selectTokenModal")
function openTokenSelectModal() {
    toggleSelectTokenModal([selectedToken.value], setToken, 0)
}
function setToken(token) {
    tokenSymbol.value = token?.symbol ? token.symbol : ""
}
// SELECT TOKEN MODAL -----------
</script>

<style lang="scss" scoped>
.get-tokens {
    place-self: center;
    z-index: 3;
    .token-part {
        .token-picker {
            .address {
                * {
                    transition: color 0.1s;
                    &:hover {
                        cursor: pointer;
                        transition: color 0.1s;
                        color: var(--primary);
                    }
                }
                .mdi:hover {
                    color: var(--text-color-reverse);
                }
            }
            .icon {
                color: var(--text-color-reverse);
            }
            .divider {
                margin: 7px 0;
                width: 1px;
                background-color: var(--text-color-reverse);
            }
        }
        p {
            margin-bottom: 8px;
        }
        input {
            color: var(--text-color-reverse);
            width: 100%;
            height: 100%;
            background: transparent;
            border: none;
            outline: none;
            text-align: right;
            font-size: 2rem;
            padding: 8px;

            &::placeholder {
                color: var(--text-grey);
                opacity: 0.5;
            }
            // hiding browser default arrows
            &::-webkit-outer-spin-button,
            &::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            &[type="number"] {
                -moz-appearance: textfield;
            }
        }
    }
}
</style>
