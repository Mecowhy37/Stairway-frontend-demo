<template>
    <div
        v-show="showModal"
        @click.self.prevent="toggleModal"
        class="modal modal--focus"
    >
        <div class="modal__window base-box">
            <TopBar
                no-return
                compact
                thin-line
                is="h4"
            >
                <template #widget-title>
                    <template v-if="!isFaucet">Select token</template>
                    <template v-else> Claim 100 tokens</template>
                </template>
                <template #right-icon>
                    <Btn
                        @click="toggleModal"
                        circle
                        transparent
                        class="grey-text"
                    >
                        <template #icon>
                            <Icon
                                name="cross"
                                :size="13"
                            />
                        </template>
                    </Btn>
                </template>
            </TopBar>
            <div
                v-if="!isFaucet"
                class="search"
            >
                <div class="search__input-wrap layer-wdg-box row">
                    <!-- placeholder="Search name or address" -->
                    <input
                        placeholder="Search for symbol or name"
                        v-model="search"
                        class=""
                        type="text"
                        name=""
                        id=""
                    />
                    <Icon
                        name="search"
                        :size="16"
                    />
                </div>
            </div>
            <div
                class="token-list"
                ref="tokenListRef"
            >
                <div
                    v-if="!FeaturedTokensPending && !OutsiderTokenPending"
                    class="contents"
                >
                    <div
                        v-if="filteredTokenList.length > 0"
                        class="contents"
                    >
                        <div
                            v-for="token in filteredTokenList"
                            @click.self="!isFaucet ? setToken(token) : getTokens(token.address)"
                            class="list-item list-item--padded list-item--bottom-border row align-center"
                            :class="{
                                'list-item--opaque': ABTokensAddresses.includes(token.address),
                            }"
                        >
                            <img
                                class="token-icon token-icon--sm"
                                :src="token.logo_uri"
                            />
                            <p class="token-name">
                                {{ token.name }}
                            </p>
                            <Icon
                                v-if="!isFaucet && ABTokensAddresses.indexOf(token.address) === selectedTokenIndex"
                                name="tick"
                                class="tick-icon"
                                :size="9"
                            ></Icon>
                            <Icon
                                v-if="copied === token.address"
                                name="tick"
                                class="copy-tick"
                                :size="9"
                            />
                            <Btn
                                v-else
                                @click.self.prevent="copyAddress(token.address)"
                                class="copy-btn"
                                circle
                                transparent
                            >
                                <template #icon>
                                    <Icon
                                        name="copy"
                                        :size="15"
                                    />
                                </template>
                            </Btn>
                        </div>
                    </div>
                    <div
                        v-else-if="OutsiderToken"
                        class="contents"
                    >
                        <div
                            @click.self="setToken(OutsiderToken)"
                            class="list-item list-item--padded list-item--bottom-border row align-center"
                            :class="{
                                'list-item--opaque': ABTokensAddresses.includes(OutsiderToken.address),
                            }"
                        >
                            <img
                                class="token-icon token-icon--sm"
                                :src="OutsiderToken.logo_uri"
                            />
                            <p class="token-name">
                                {{ OutsiderToken.name }}
                            </p>
                            <Icon
                                v-if="ABTokensAddresses.indexOf(OutsiderToken.address) === selectedTokenIndex"
                                name="tick"
                                class="tick-icon"
                                :size="9"
                            ></Icon>
                            <Icon
                                v-if="copied === OutsiderToken.address"
                                name="tick"
                                class="copy-tick"
                                :size="9"
                            />
                            <Btn
                                v-else
                                @click.self.prevent="copyAddress(OutsiderToken.address)"
                                class="copy-btn"
                                circle
                                transparent
                            >
                                <template #icon>
                                    <Icon
                                        name="copy"
                                        :size="15"
                                    />
                                </template>
                            </Btn>
                        </div>
                    </div>
                    <div
                        v-else
                        class="token-list--empty row center grey-text"
                    >
                        <p>Token{{ FeaturedTokensData.length === 0 ? "s" : "" }} not found</p>
                    </div>
                </div>
                <div
                    v-else
                    class="token-list--empty row center grey-text"
                >
                    <p>Loading token{{ FeaturedTokensPending ? "s" : "" }}...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { BrowserProvider, id, isAddress } from "ethers"
import { listenForTransactionMine, getUrl, getOutsiderToken } from "~/helpers/index"
import { inject } from "vue"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"

const stepStore = useStepStore()
const { connectedChainId } = storeToRefs(stepStore)

const showModal = ref(false)
const tokenSetCallback = ref()
const ABTokens = ref([])
const selectedTokenIndex = ref()
const isFaucet = ref(false)

const search = ref("")

const { FeaturedTokensData, FeaturedTokensPending } = inject("FeaturedTokensAsyncData")
const filteredTokenList = computed(() => {
    const searchInput = search.value
    const searchTerm = searchInput.toLowerCase() // Convert search term to lowercase for case-insensitive comparison
    const filteredList = FeaturedTokensData.value
        .filter((tkn) => {
            const exludedSymbols = ["STR", "WMATIC", "WETH"]
            if (exludedSymbols.includes(tkn.symbol)) {
                return
            }
            return tkn
        })
        .filter((token) => {
            const { name, symbol, address } = token
            return (
                name.toLowerCase().includes(searchTerm) ||
                symbol.toLowerCase().includes(searchTerm) ||
                (isAddress(searchInput) && address.toLowerCase().includes(searchTerm))
            )
        })

    return filteredList
})

const {
    data: OutsiderToken,
    error: OutsiderTokenError,
    status: OutsiderTokenStatus,
    pending: OutsiderTokenPending,
    refresh: refreshOutsiderToken,
} = useAsyncData(
    "OutsiderToken",
    () => {
        if (filteredTokenList.value.length === 0 && isAddress(search.value)) {
            return getOutsiderToken(connectedChainId.value, search.value)
        } else {
            return null
        }
    },
    {
        default: () => null,
        transform: (data) => {
            return data?.symbol && data?.name ? data : null
        },
        watch: [search, connectedChainId],
    }
)

function toggleModal(tokens, callback, index, faucet = false) {
    showModal.value = !showModal.value
    if (typeof callback === "function") {
        tokenSetCallback.value = callback
    }

    if (Array.isArray(tokens)) {
        ABTokens.value = tokens
    }

    if (faucet) {
        isFaucet.value = true
    }

    selectedTokenIndex.value = index
}

const ABTokensAddresses = computed(() => {
    return ABTokens.value.map((el) => el?.address)
})

function setToken(token) {
    toggleModal()
    tokenSetCallback.value.call(this, token)
}

const copied = ref(null)
let intervalId = null
function copyAddress(address) {
    navigator.clipboard.writeText(address)
    copied.value = address

    if (intervalId) {
        clearInterval(intervalId)
    }
    intervalId = setTimeout(() => {
        copied.value = null
    }, 1000)
}

const tokenListRef = ref()
watch(showModal, (isOpen) => {
    if (!isOpen) {
        tokenListRef.value.scrollTop = 0
        ABTokens.value = []
        search.value = ""
        isFaucet.value = false
    }
})

defineExpose({
    toggleModal,
})

// FAUCET FUNCTIONALITY --------------
async function getTokens(tokenAddress) {
    toggleModal()

    let notifHolder = { id: null }

    const provider = new BrowserProvider(stepStore.connectedWallet.provider)
    const signer = await provider.getSigner()

    let functionSignature = id("faucet()").substring(0, 10)
    const tx = {
        to: tokenAddress,
        data: functionSignature,
    }
    stepStore.notify(notifHolder, "sign")

    signer
        .sendTransaction(tx)
        .then((txRes) => {
            console.log("txRes:", txRes)
            stepStore.notify(notifHolder, "pending")

            listenForTransactionMine(txRes, provider, tokenSetCallback.value).then(() => {
                stepStore.notify(notifHolder, "success")
            })
        })
        .catch((error) => {
            stepStore.notify(notifHolder, "error")
            console.log("error while claiming tokens")
            throw new Error(error)
        })
}
// FAUCET FUNCTIONALITY --------------}
</script>

<style lang="scss">
.modal {
    position: fixed;
    bottom: 0;
    right: 0;
    top: 0;
    width: 100%;
    height: 100dvh;
    display: grid;
    &--focus {
        background-color: rgba(232, 232, 232, 0.5);
        backdrop-filter: blur(5px);
    }
    z-index: 4;
    &--lower {
        z-index: 3;
    }

    &__window {
        width: 300px;
        height: 70vh;
        max-height: 500px;
        display: flex;
        flex-direction: column;
        place-self: center;
        padding: 0px 0px !important;
        overflow: hidden;
        border-radius: var(--semi-wdg-radius);
        box-shadow: var(--modal-box-shadow);

        .topbar {
            display: flex;
            justify-content: space-between;
            width: 100%;
            padding: 1rem;
            border-bottom: 1px solid var(--text-color-reverse);
            &__close {
                cursor: pointer;
            }
        }
        .token-list {
            height: 100%;
            overflow: auto;
            &--empty {
                height: 100%;
                align-items: center;
                padding-bottom: 15%;
            }
            .list-item {
                padding: 16px 8px;
                * {
                    pointer-events: none;
                }
            }
            .token-name {
                margin-right: auto;
            }
            .tick-icon {
                margin-right: 12px;
            }
            .copy-btn {
                color: var(--text-color-reverse);
                pointer-events: all;
            }
            .copy-tick {
                color: var(--text-color-reverse);
                margin-right: 7px;
                margin-left: 5px;
            }
            &::-webkit-scrollbar {
                width: 3px;
            }
            &::-webkit-scrollbar-track-piece {
                background-color: transparent;
            }
            &::-webkit-scrollbar-thumb {
                border-radius: 5px;
                background-color: var(--text-color-reverse-opaque);
            }
        }
        .search {
            border-bottom: 1px solid var(--grey-stroke-sm);
            padding: 12px;
            &__input-wrap {
                justify-content: space-between;
                align-items: center;
                padding-right: 8px;
                input {
                    color: var(--text-color-reverse);
                    width: 100%;
                    height: 100%;
                    background: transparent;
                    border: none;
                    outline: none;
                    text-align: left;
                    font-size: 1rem;
                    padding: 8px;

                    &.error {
                        color: var(--error-color);
                    }

                    &::placeholder {
                        color: var(--text-grey);
                    }
                }
            }
        }
    }
}
</style>
