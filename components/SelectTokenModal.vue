<template>
    <div
        v-if="showTokenModal"
        class="modal modal__overlay"
        @click.self="toggleTokenModal"
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
                    v-for="token in filteredTokenList"
                    @click="setToken(token)"
                >
                    {{ token.name }}
                </p>
                <p @click="setToken(null)">deselect</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import allTokens from "../constants/tokenList.json"
const tokenList = ref(allTokens)

// const { data, error, refresh } = await useFetch("https://gateway.ipfs.io/ipns/tokens.uniswap.org")
// tokenList.value = data.value?.tokens

const showTokenModal = ref(false)
const callbackRef = ref()
const ABTokens = ref([])
function toggleTokenModal(tokens = false, callback = false) {
    showTokenModal.value = !showTokenModal.value
    if (typeof callback === "function") {
        callbackRef.value = callback
    }

    if (Array.isArray(tokens)) {
        ABTokens.value = tokens
    }
}
const filteredTokenList = computed(
    () =>
        tokenList.value.filter(
            (el) => el.chainId === 31337 && !ABTokens.value?.find((tkn) => tkn?.address === el.address)
            // (el) => el.chainId === 31337 && !ABTokens.value.includes(el)
        )
    // () => tokenList.value.filter((el) => el.chainId === 31337)
)

function setToken(token) {
    toggleTokenModal()
    callbackRef.value.call(this, token)
}

const tokenListRef = ref()
watch(showTokenModal, (isOpen, newIsOpen) => {
    if (newIsOpen === true) {
        tokenListRef.value.scrollTop = 0
    }
})

defineExpose({
    toggleTokenModal,
})
</script>

<style lang="scss" scoped>
.modal {
    position: absolute;
    width: 100%;
    height: 100%;
    display: grid;
    &__overlay {
        grid-row: 1/1;
        grid-column: 1/1;
        background-color: rgba(0, 0, 0, 0.15);
        z-index: 3;
    }

    &__window {
        place-self: center;
        width: 200px;
        max-height: 50%;
        margin-top: 30%;
        background-color: white;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        place-self: center;
        box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px;

        .topbar {
            display: flex;
            justify-content: space-between;
            width: 100%;
            padding: 1rem;
            border-bottom: 1px solid var(--text-color);
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
