<template>
    <div
        v-if="showModal"
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
                <template #widget-title>Select token {{ selectedTokenIndex }}</template>
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
                    v-for="token in featuredTokens"
                    @click="setToken(token)"
                    class="list-item list-item--padded row align-center"
                    :class="{
                        'list-item--opaque':
                            ABTokensAddresses.indexOf(token.address) === oppositeTokenIndex(selectedTokenIndex),
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
import { BrowserProvider, Contract, parseEther } from "ethers"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"

const stepStore = useStepStore()
const { featuredTokens } = storeToRefs(stepStore)

const showModal = ref(false)
const callbackRef = ref()
const ABTokens = ref([])
const selectedTokenIndex = ref()
function toggleModal(tokens, callback, index) {
    showModal.value = !showModal.value
    if (typeof callback === "function") {
        callbackRef.value = callback
    }

    if (Array.isArray(tokens)) {
        ABTokens.value = tokens
    }

    selectedTokenIndex.value = index
}

const ABTokensAddresses = computed(() => {
    return ABTokens.value.map((el) => el?.address)
})
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

function setToken(token) {
    toggleModal()
    callbackRef.value.call(this, token)
}

function oppositeTokenIndex(tokenIndex) {
    return 1 - tokenIndex
}

const tokenListRef = ref()
watch(showModal, (isOpen) => {
    if (!isOpen) {
        tokenListRef.value.scrollTop = 0
        ABTokens.value = []
    }
})

defineExpose({
    toggleModal,
})
</script>

<style lang="scss">
.modal {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100vh;
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
