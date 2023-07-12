<template>
    <div
        v-if="showModal"
        class="modal modal--focus"
        @click.self.prevent="toggleModal"
    >
        <div class="modal__window base-box">
            <TopBar
                no-return
                compact
                thin-line
                is="h4"
            >
                <template #widget-title>Select token</template>
                <template #right-icon>
                    <Btn
                        @click="toggleModal"
                        tiny
                        transparent
                    >
                        <Icon
                            name="cross"
                            :size="13"
                        />
                    </Btn>
                </template>
            </TopBar>
            <div
                class="token-list"
                ref="tokenListRef"
            >
                <p
                    v-for="token in featuredTokens"
                    @click="setToken(token)"
                    class="list-item"
                >
                    {{ token.name }}
                </p>
                <!-- <p
                            v-for="token in filteredTokenList"
                            @click="setToken(token)"
                        >
                            {{ token.name }}
                        </p> -->
                <!-- <p @click="setToken(null)">deselect</p> -->
            </div>
        </div>
    </div>
</template>

<script setup>
import { BrowserProvider, Contract, parseEther } from "ethers"
import allTokens from "../constants/tokenList.json"

import * as Token from "../ABIs/ERC20.json"
const TokenABI = Token.default

import * as Foundry from "../ABIs/TokenFoundry.json"
const FoundryABI = Foundry.default

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"

const stepStore = useStepStore()
const { featuredTokens } = storeToRefs(stepStore)

const showModal = ref(false)
const callbackRef = ref()
const ABTokens = ref([])
function toggleModal(tokens = false, callback = false) {
    showModal.value = !showModal.value
    if (typeof callback === "function") {
        callbackRef.value = callback
    }

    if (Array.isArray(tokens)) {
        ABTokens.value = tokens
    }
}
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

const tokenListRef = ref()
watch(showModal, (isOpen) => {
    if (!isOpen) {
        tokenListRef.value.scrollTop = 0
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
        height: 50%;
        place-self: center;
        border-radius: var(--semi-wdg-radius);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 0px 0px !important;

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

            p {
                padding: 1rem;
            }
        }
    }
}
</style>
