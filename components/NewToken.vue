<template>
    <div class="getTokens widget base-wdg-box">
        <!-- <div class="top-bar row">
            <h3>Create token</h3>
            <Dropdown>
                <template #dropdown-activator="{ on }">
                    <Btn
                        transparent
                        tiny
                        icon-contrast
                    >
                        <template #icon>
                            <mdicon
                                name="cog"
                                size="30"
                            />
                        </template>
                    </Btn>
                </template>
                <template #dropdown>
                    <Settings
                        ref="settings"
                        :default-slippage="0.5"
                        :default-deadline="30"
                    ></Settings>
                </template>
            </Dropdown>
        </div> -->
        <!-- <div class="row space-between"> -->
        <div class="token-part">
            <div class="token-part__wrap token-part__wrap__symbol">
                <div class="row space-between">
                    <h4 class="grey-text">symbol</h4>
                    <span
                        v-if="truncatedTokenAddress"
                        class="address row"
                        @click="copyAddress"
                    >
                        <mdicon
                            size="20px"
                            name="content-copy"
                        />
                        <p v-if="!copied">{{ truncatedTokenAddress }}</p>
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
                            <mdicon name="chevron-down" />
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
const { tokenList } = storeToRefs(stepStore)

const { listenForTransactionMine } = usePools(stepStore.routerAddress)

const tokenSymbol = ref("")
const tokenAmount = ref(1000000)
const copied = ref(false)
const claimed = ref(false)

const toggleTokenModal = inject("modal")
function openTokenSelectModal() {
    toggleTokenModal(null, setToken)
}
function setToken(token) {
    tokenSymbol.value = token?.symbol ? token.symbol : ""
}

async function checkTokens() {
    const provider = new BrowserProvider(stepStore.connectedWallet.provider)
    const foundry = new Contract(stepStore.foundryAddress, FoundryABI, provider)
    const tokens = await foundry.getAllTokens()
    const tokenMap = []
    await Promise.all(
        tokens.map(async (tknAdd) => {
            const tkn = new Contract(tknAdd, TokenABI, provider)
            const symbol = await tkn.symbol()
            tokenMap.push({
                address: tknAdd,
                symbol,
                name: symbol,
                decimals: 18,
                chainId: parseInt(stepStore.connectedChain.id, 16),
            })
        })
    )
    tokenMap.forEach((el) => {
        if (!tokenList.value.find((tkn) => tkn?.address === el.address)) {
            tokenList.value.push(el)
        }
    })
}
async function getTokens() {
    const provider = new BrowserProvider(stepStore.connectedWallet.provider)
    const signer = await provider.getSigner()
    const foundry = new Contract(stepStore.foundryAddress, FoundryABI, signer)
    try {
        await foundry
            .createToken(tokenSymbol.value)
            .then(async (res) => {
                //token doesnt exist
                console.log(res)
                await res.wait(1)
                await listenForTransactionMine(res, provider)
                await mintTokens()
            })
            .catch(async (err) => {
                console.log("token exists")
                await mintTokens()
            })
            .finally(async () => {
                // tokenAmount.value = ""
                claimed.value = true
                checkTokens()
            })
    } catch (err) {
        console.log("failed to get tokens: ", err)
    }
    async function mintTokens() {
        const tx = await foundry.mint(tokenSymbol.value, parseEther(String(tokenAmount.value)))
        const res = await tx.wait(1)
        await listenForTransactionMine(res, provider)
    }
}
function copyAddress() {
    copied.value = true
    navigator.clipboard.writeText(selectedAddress.value)
}

const canGetTokens = computed(() => {
    return tokenSymbol.value.length >= 1 && tokenAmount.value > 0
})
const selectedAddress = computed(() => {
    return tokenList.value.find((el) => el.symbol.toUpperCase() === tokenSymbol.value)?.address
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

watch(tokenSymbol, (newVal) => {
    newVal = newVal.replace(/[^a-zA-Z]/g, "")
    if (newVal.length > 5) {
        newVal = newVal.slice(0, 5)
    }
    tokenSymbol.value = newVal.toUpperCase()
})
watch(
    () => stepStore.connectedAccount,
    (wallet, prevWallet) => {
        if (wallet !== prevWallet && wallet) {
            checkTokens()
        }
    },
    {
        immediate: true,
    }
)
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
    padding-top: 15px;
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
