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
                    <template v-else>Claim 100 tokens</template>
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
                class="token-list"
                ref="tokenListRef"
            >
                <div
                    v-for="(token, index) in featuredTokens"
                    @click="!isFaucet ? setToken(token) : getTokens(token.address)"
                    class="list-item list-item--padded list-item--bottom-border row align-center"
                    :class="{
                        'list-item--opaque': ABTokensAddresses.includes(token.address),
                    }"
                >
                    <img
                        class="token-icon token-icon--sm"
                        :src="token.logo_uri"
                    />
                    <p>
                        {{ token.name }}
                    </p>
                    <Icon
                        v-if="ABTokensAddresses.indexOf(token.address) === selectedTokenIndex"
                        class="tick-icon"
                        name="tick"
                        :size="9"
                    ></Icon>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { BrowserProvider, Contract, parseEther, id } from "ethers"
import { listenForTransactionMine } from "~/helpers/index"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"

const stepStore = useStepStore()
const { featuredTokens } = storeToRefs(stepStore)

const showModal = ref(false)
const tokenSetCallback = ref()
const ABTokens = ref([])
const selectedTokenIndex = ref()
const isFaucet = ref(false)
const faucetIndexMining = ref(1)

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

function oppositeTokenIndex(tokenIndex) {
    return 1 - tokenIndex
}

const tokenListRef = ref()
watch(showModal, (isOpen) => {
    if (!isOpen) {
        tokenListRef.value.scrollTop = 0
        ABTokens.value = []
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
// FAUCET FUNCTIONALITY --------------

// const filteredTokenList = computed(
//     () =>
//         tokenList.value.filter(
//             (el) =>
//                 // el.chainId === 31337 &&
//                 el.chainId === parseInt(stepStore.connectedChain.id, 16)
//             // !ABTokens.value?.find((tkn) => tkn?.address === el.address)
//             // (el) => el.chainId === 31337 && !ABTokens.value.includes(el)
//         )
//     // () => tokenList.value.filter((el) => el.chainId === 31337)
// )
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
            overflow-y: scroll;
            -ms-overflow-style: none;
            scrollbar-width: none;
            &::-webkit-scrollbar {
                display: none;
            }
            .list-item {
                padding: 16px 8px;
            }
            .tick-icon {
                margin-left: auto;
                margin-right: 8px;
            }
        }
    }
}
</style>
