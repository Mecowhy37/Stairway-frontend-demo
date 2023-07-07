<template>
    <div
        v-if="showModal"
        @click.self.prevent="toggleModal"
        class="modal modal--lower modal--focus"
    >
        <div class="getTokens widget base-box">
            <div class="token-part">
                <div class="token-part__wrap token-part__wrap__symbol">
                    <div class="row space-between">
                        <h4 class="grey-text">symbol</h4>
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
                <div class="token-part__wrap">
                    <h4 class="grey-text">amount</h4>
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
        </div>
    </div>
</template>

<script setup>
import { BrowserProvider, Contract, parseEther } from "ethers"
import { getToken, useBalances, usePools } from "~/helpers/index"

import * as Foundry from "../ABIs/TokenFoundry.json"
const FoundryABI = Foundry.default

import * as Token from "../ABIs/ERC20.json"
const TokenABI = Token.default

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
.getTokens {
    width: 450px;
    place-self: center;
    padding-top: 15px;
    z-index: 3;
    .token-part {
        width: 100%;
        gap: 12px;
        margin-bottom: 15px;
        .token-part__wrap {
            flex-grow: 1;
            overflow: hidden;
            h4 {
                margin-bottom: 12px;
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
            &__symbol {
                .address {
                    * {
                        transition: color 0.1s;
                        &:hover {
                            cursor: pointer;
                            transition: color 0.1s;
                            color: var(--primary-btn-bg);
                        }
                    }
                    .mdi:hover {
                        color: var(--text-color-reverse);
                    }
                }
                .divider {
                    margin: 7px 0;
                    width: 1px;
                    background-color: var(--text-color-reverse);
                }
            }
            &:last-of-type {
                margin-top: 12px;
            }
        }
    }
}
</style>
