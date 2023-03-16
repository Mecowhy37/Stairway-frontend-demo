<template>
    <div
        v-if="showTokenModal"
        @click="toggleTokenModal"
        class="modal__overlay"
    >
        <div class="modal__window">
            <div class="topbar">
                <h3>Select a token</h3>
                <h3
                    @click="toggleTokenModal"
                    class="topbar__close"
                >
                    <mdicon name="close" />
                </h3>
            </div>
            <div
                class="token-list"
                ref="tokenListRef"
            >
                <p
                    v-for="(token, index) in filteredTokenList"
                    @click="setToken(token)"
                >
                    {{ token.name }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { toRaw } from "vue"
import tokenList from "../constants/tokenList.json"

import { useStepStore } from "@/stores/step"
const stepStore = useStepStore()

const emit = defineEmits(["tokenSelected"])
const props = defineProps({
    switchedTokens: Array,
})

// const tokenList = ref([])
// const { data, error, refresh } = await useFetch("https://gateway.ipfs.io/ipns/tokens.uniswap.org")
// tokenList.value = data.value?.tokens

const switchedTokensRaw = computed(() => props.switchedTokens.map((el) => toRaw(el)))
const filteredTokenList = computed(() => tokenList.filter((el) => !switchedTokensRaw.value.includes(el)))

const showTokenModal = ref(false)
function toggleTokenModal(event) {
    showTokenModal.value = !showTokenModal.value
    event.stopPropagation()
}

const tokenListRef = ref()
onUpdated(() => {
    tokenListRef.scrollTop = 0
})

function setToken(token) {
    emit("tokenSelected", token)
}

defineExpose({
    toggleTokenModal,
})
</script>

<style lang="scss" scoped>
.modal {
    &__overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        display: grid;
        background-color: rgba(0, 0, 0, 0.15);
        z-index: 3;
    }

    &__window {
        width: 400px;
        margin-right: 5%;
        max-height: 50%;
        background-color: white;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        place-self: center;
        transform: translateX(-110%);
        box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px;

        .topbar {
            display: flex;
            justify-content: space-between;
            width: 100%;
            padding: 1rem;
            border-bottom: 1px solid var(--main-color);
            &__close {
                cursor: pointer;
            }
        }
        .token-list {
            display: flex;
            flex-direction: column;
            margin-bottom: auto;
            flex-grow: 0;
            overflow-y: scroll;
            -ms-overflow-style: none;
            scrollbar-width: none;
            &::-webkit-scrollbar {
                display: none;
            }

            p {
                padding: 1rem 1rem;
                &:hover {
                    background-color: var(--swap-windows);
                }
            }
        }
    }
}

.caption {
    padding: 2rem;
    pointer-events: all;
    cursor: pointer;
    border-radius: 6px;
    text-align: center;
    justify-self: end;
    align-self: end;
    border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
