<template>
    <div :class="[stepStore.isDark ? themes.dark : themes.light]">
        <div class="wrapper">
            <Nav />
            <div class="page-slot">
                <slot />
            </div>
        </div>
        <div class="bg-gradient"></div>

        <div class="page-slot--modals">
            <SelectTokenModal ref="selectTokenModal"></SelectTokenModal>
            <Faucet ref="newTokenModal"></Faucet>
            <Notifications></Notifications>
        </div>
    </div>
</template>

<script setup>
import { BrowserProvider, Contract, parseUnits, formatUnits, formatEther, parseEther } from "ethers"

import { useWindowSize } from "@vueuse/core"
import { provide } from "vue"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"

const stepStore = useStepStore()
const {
    featuredTokens,
    addresses,
    connectedWallet,
    connectedAccount,
    chains,
    noWalletChain,
    connectedChainId,
    onboard,
} = storeToRefs(stepStore)

import { isSupportedChain, getUrl } from "~/helpers/index"
useHead({
    title: "Stairway",
})

const router = useRouter()
const route = useRoute()
const {
    data: TokensData,
    pending: TokensPending,
    refresh: refreshTokens,
    error: TokensError,
    status: TokensStatus,
} = await useAsyncData(
    "tokens",
    () => {
        if (isSupportedChain(connectedChainId.value)) {
            console.log("fetching tokens on chain:", connectedChainId.value)
            return $fetch(getUrl(`/chain/${connectedChainId.value}/tokens/featured`))
        }
    },
    {
        watch: [connectedChainId],
    }
)
watch(
    TokensData,
    (newVal) => {
        if (newVal) {
            featuredTokens.value = newVal
        }
    },
    {
        immediate: true,
    }
)

const {
    data: AddressesData,
    pending: AddressesPending,
    refresh: refreshAddresses,
    error: AddressesError,
    status: AddressesStatus,
} = await useAsyncData(
    "addresses",
    () => {
        if (isSupportedChain(connectedChainId.value)) {
            console.log("Fetching addresses on chain:", connectedChainId.value)
            return $fetch(getUrl(`/chain/${connectedChainId.value}/addresses/local`))
        }
    },
    {
        watch: [connectedChainId],
    }
)
watch(
    AddressesData,
    (newVal) => {
        if (newVal) {
            addresses.value = newVal
        }
    },
    {
        immediate: true,
    }
)
const {
    data: PositionsData,
    pending: PositionsPending,
    refresh: RefreshPositions,
    error: PositionsError,
    status: PositionsStatus,
} = await useAsyncData(
    "positions",
    () => {
        if (connectedAccount.value && isSupportedChain(connectedChainId.value)) {
            if (router.currentRoute.value.name === "liquidity") {
                console.log("fetching positions on chain:", connectedChainId.value)
                return $fetch(getUrl(`/chain/${connectedChainId.value}/user/${connectedAccount.value}/positions`))
            }
        } else {
            return []
        }
    },
    {
        watch: [connectedChainId, connectedAccount],
    }
)
stepStore.refreshPositions = RefreshPositions

// function refreshOnePosition(poolIdx) {

// }
watch(
    () => [PositionsData.value, PositionsStatus.value],
    ([newPositions, newStatus]) => {
        stepStore.positions = newPositions
        stepStore.positionsStatus = newStatus
    },
    {
        immediate: true,
    }
)

const {
    data: ChainsData,
    pending: ChainsPending,
    refresh: refreshChains,
    error: ChainsError,
    status: ChainsStatus,
} = await useAsyncData("chains", () => {
    return $fetch(getUrl(`/chain`))
})
watch(
    ChainsData,
    (newVal) => {
        if (newVal) {
            chains.value = newVal
        }
    },
    {
        immediate: true,
    }
)

// const {
//     data: EventsData,
//     pending: EventsPending,
//     refresh: refreshEvents,
//     error: EventsError,
//     status: EventsStatus,
// } = await useAsyncData(
//     "events",
//     () => {
//         console.log("fetching Events for user:", connectedAccount.value)
//         return $fetch(getUrl(`/chain/${connectedChainId.value}/events/${connectedAccount.value}/swap`))
//     },
//     {
//         watch: [connectedChainId, connectedAccount],
//     }
// )
// provide("refreshEvents", refreshEvents)

// SCREEN SIZE ------------------
const { width } = useWindowSize()
watch(
    width,
    (newVal) => {
        if (newVal <= 600) {
            stepStore.isMobile = true
        } else {
            stepStore.isMobile = false
        }
    },
    {
        immediate: true,
    }
)
// SCREEN SIZE ------------------

// MODAL STUFF ------------------
const selectTokenModal = ref(null)
function toggleSelectTokenModal(...args) {
    selectTokenModal.value.toggleModal(...args)
}
provide("selectTokenModal", toggleSelectTokenModal)

const newTokenModal = ref(null)
function toggleNewTokenModal() {
    newTokenModal.value.toggleModal()
}
const isNewTokenModalOpen = computed(() => {
    if (newTokenModal.value === null) {
        return null
    }
    return newTokenModal.value?.showModal
})
provide("newTokenModal", { toggleNewTokenModal, isNewTokenModalOpen })

// MODAL STUFF ------------------
</script>

<style lang="scss" module="themes" src="assets/main.scss"></style>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,500&display=swap");
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: "DM Sans";
    line-height: 100%;
    font-weight: 500;
}
html {
    /* font-size: calc([minimum size] + ([maximum size] - [minimum size]) * ((100vw - [minimum viewport width]) / ([maximum viewport width] - [minimum viewport width]))); */
    color: var(--text-color);
    $size: 16px;
    /* font-size: calc($size * ((100vw - 300px) / (1600 - 300))); */
    font-size: $size;
}
.wrapper {
    position: relative;
    margin: 0 auto;
    /* overflow-y: hidden; */
    @media (min-width: 1536px) {
        max-width: 1536px;
    }
    &--wide-list {
        width: 100%;
        max-width: calc(var(--list-width) + 2 * var(--widget-sides));
        padding: 0 var(--widget-sides);
        padding-top: calc(var(--nav-height) / 2);
    }
    &--widget {
        $padding-multiplyer: 1;
        display: flex;
        flex-direction: column;
        height: calc(100dvh - var(--nav-height));
        padding-bottom: calc(var(--nav-height) * $padding-multiplyer);
        @media (max-width: 750px) {
            height: calc(100dvh - var(--nav-md-height));
            padding-bottom: calc(var(--nav-md-height) * $padding-multiplyer);
        }
        @media (max-width: 600px) {
            height: calc(100dvh - var(--nav-sm-height));
            padding-bottom: calc(var(--nav-sm-height) * $padding-multiplyer);
        }
    }
}
.page-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    &--modals {
        display: contents;
    }
    & > div {
        margin: auto 0;
    }
}

h1 {
    font-size: 3.25rem;
    &.scale {
        @media (max-width: 400px) {
            font-size: 2.75rem;
        }
    }
}
h2 {
    font-size: 2.25rem;
}
h3 {
    font-size: 1.5rem;
    /* line-height: 1.5rem; */
}
h4 {
    font-size: 1.25rem;
    line-height: 1.5rem;
}

p {
    font-size: 1rem;
    line-height: 1.2rem;
}
a {
    text-decoration: none;
    color: inherit;
    &:visited {
        color: inherit;
    }

    &:hover {
        color: inherit;
    }

    &:active {
        color: inherit;
    }
}

.placeholder {
    border-radius: var(--small-wdg-radius);
    padding: 3px;
    color: rgba(0, 0, 0, 0) !important;
    background-color: var(--placeholder) !important;
    &--solid {
        background-color: var(--placeholder-solid) !important;
    }
    * {
        visibility: hidden;
    }
}
img,
svg {
    display: block;
}
.token-icon {
    border-radius: 50%;
    height: 36px;
    width: 36px;
    &--sm {
        height: 21px;
        width: 21px;
    }
}
.list-item {
    border: 1px solid transparent;
    cursor: pointer;
    &:not(.list-item--separate) {
        border-bottom: 1px solid var(--grey-opaque);
    }
    &:first-of-type {
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
    }
    &:last-of-type {
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
    }
    &:hover {
        background-color: var(--list-hover-bg);
        border: 1px solid var(--list-hover-stroke);
        &--bottom-border {
            border: none;
            border-bottom: 1px solid var(--list-hover-stroke);
        }
    }
    &:active {
        background-color: var(--list-click-bg);
        border: 1px solid var(--list-click-stroke);
    }
    &--bottom-border {
        &:hover {
            border: 1px solid transparent;
            border-bottom: 1px solid var(--list-hover-stroke);
        }
        &:active {
            border: 1px solid transparent;
            border-bottom: 1px solid var(--list-click-stroke);
        }
    }
    &--padded {
        padding: 1rem;
    }
    &--padded-sm {
        padding: 0.7rem;
    }
    &--padded-xs {
        padding: 0.7rem 5px;
    }
    &--centered {
        text-align: center;
    }
    &--all-rounded {
        border-radius: inherit;
    }
    &--opaque {
        color: var(--text-color-reverse-opaque);
        .token-icon {
            opacity: 0.4;
        }
    }
    .tick-icon {
        margin-left: auto;
        color: var(--list-click-stroke);
        margin-right: 5px;
    }
    p {
        margin-left: 6px;
    }
}
.caption {
    &,
    & * {
        font-size: 13px !important;
        line-height: 15px;
    }
}
.text-highlight {
    color: var(--primary-btn-bg);
    &--border {
        border: 1px solid var(--primary-btn-bg);
        padding: 0 7px;
        border-radius: 9999px;
    }
}
.activator-link {
    cursor: pointer;
    &:hover {
        border-bottom: 1px solid var(--primary-btn-bg);
    }
}
.grey-text {
    color: var(--text-grey);
}
.base-box {
    background-color: var(--widget-bg);
    backdrop-filter: var(--backdrop-blur);
    color: var(--text-color-reverse);

    &--solid {
        background-color: var(--widget-bg-solid);
    }
}
.layer-wdg-box {
    background-color: var(--swap-windows);
    transition: background-color var(--transition);
    border-radius: var(--inner-wdg-radius);
    &--padded {
        padding: 1rem;
    }
}

.row {
    display: flex;
    &.space-between {
        justify-content: space-between;
    }
    &.flex-end {
        justify-content: flex-end;
    }
    &.align-center {
        align-items: center;
    }
    &.center {
        justify-content: center;
    }
}

.inset {
    box-shadow: var(--inset-shadow);
    transition: box-shadow var(--transition);
}

.contents {
    display: contents;
}

.bg-gradient {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100vh;
    z-index: -2;
    background-color: var(--background-color);
    background-image: url("~/assets/img/stairway-background.jpeg");
    background-size: cover;
    background-repeat: no-repeat;
}
input {
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
</style>
