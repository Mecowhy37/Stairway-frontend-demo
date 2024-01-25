<template>
    <div>
        <!-- :class="[stepStore.isDark ? themes.dark : themes.light]" -->
        <div class="wrapper">
            <Nav />
            <div class="page-slot">
                <slot />
            </div>
        </div>

        <div class="page-slot--modals">
            <SelectTokenModal ref="selectTokenModal"></SelectTokenModal>
            <Notifications></Notifications>
            <Feedback></Feedback>
        </div>
    </div>
</template>

<script setup>
import { useWindowSize } from "@vueuse/core"
import { provide } from "vue"
import { isSupportedChain, getUrl } from "~/helpers/index"
// import { useWeb3Onboard } from "~/helpers/useWeb3Onboard"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"

const stepStore = useStepStore()
const { connectedChainId, connectedAccount } = storeToRefs(stepStore)

const route = useRoute()

// CHAINS -------------------

// init Options will be used for asyncronous web3Onbaord initialization
const initOptions = ref([])

const {
    data: ChainsData,
    pending: ChainsPending,
    refresh: refreshChains,
    error: ChainsError,
    status: ChainsStatus,
} = await useAsyncData(
    "chains",
    () => {
        return $fetch(getUrl(`/chain`))
    },
    {
        default: () => [],
        transform: (chainsdata) => {
            // temporary filter to only include mumbai as only network
            if (chainsdata) {
                chainsdata = chainsdata.filter((chain) => chain.chain_id === 80001)
                // chainsdata.forEach((chain) => initOptions.value.push(transformChainToInitOptions(chain)))
            }
            return chainsdata
        },
    }
)

// will be used at some point, this only serves it's purpose for polygon networks
function transformChainToInitOptions(chainObject) {
    const result = {
        id: chainObject.chain_id,
        token: "MATIC",
        label: chainObject.chain_name,
        rpcUrl: chainObject.rpc_url,
        icon: "~/assets/img/polygon_mainnet.webp",
    }

    return result
}

// shares variables to child components tree
provide("ChainsAsyncData", {
    ChainsData,
})

// CHAINS -------------------

// ADDRESSES ----------------
const {
    data: AddressesData,
    pending: AddressesPending,
    refresh: RefreshAddresses,
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
        lazy: true,
        server: false,
        watch: [connectedChainId],
    }
)

// computed serving as quick access to DEX's address
const routerAddress = computed(() => {
    if (AddressesData.value === null) {
        return null
    }
    return AddressesData.value.DEX
})

// shares variables to child components tree
provide("AddressesAsyncData", {
    AddressesData,
    routerAddress,
})
// ADDRESSES ----------------

// TOKENS -------------------
const {
    data: FeaturedTokensData,
    pending: FeaturedTokensPending,
    refresh: RefreshFeaturedTokens,
    error: FeaturedTokensError,
    status: FeaturedTokensStatus,
} = await useAsyncData(
    "tokens",
    () => {
        if (isSupportedChain(connectedChainId.value)) {
            console.log("fetching tokens on chain:", connectedChainId.value)
            return $fetch(getUrl(`/chain/${connectedChainId.value}/tokens/featured`))
        } else {
            return []
        }
    },
    {
        server: false,
        lazy: true,
        default: () => [],
        watch: [connectedChainId],
    }
)

// shares variables to child components tree
provide("FeaturedTokensAsyncData", {
    FeaturedTokensData,
    FeaturedTokensPending,
})
// TOKENS -------------------

// POSITIONS ----------------

// this async data wrapper gets All user's positions and its only exectured on /liqiuidity page
// and gets exposed to other components like add and remove liquidity
const {
    data: PositionsData,
    pending: PositionsPending,
    refresh: RefreshPositions,
    error: PositionsError,
    status: PositionsStatus,
} = useAsyncData(
    "positions",
    () => {
        if (route.name === "liquidity") {
            if (connectedAccount.value && isSupportedChain(connectedChainId.value)) {
                console.log("fetching positions on chain:", connectedChainId.value)
                return $fetch(getUrl(`/chain/${connectedChainId.value}/user/${connectedAccount.value}/positions`))
            } else {
                return []
            }
        } else {
            return [...PositionsData.value]
        }
    },
    {
        default: () => [],
        lazy: true,
        server: true,
        watch: [connectedChainId, connectedAccount, () => route.name],
    }
)

// get just one users position and is used in add and remove liquidity
async function getSinglePostion(poolIndex) {
    if (isSupportedChain(connectedChainId.value) && connectedAccount.value && poolIndex) {
        console.log("getting position with id", poolIndex)
        return $fetch(getUrl(`/chain/${connectedChainId.value}/user/${connectedAccount.value}/positions/${poolIndex}`))
    } else {
        return null
    }
}

// updatePositionInPositions updates specific position or adds it to the list
function updatePositionInPositions(newPosition) {
    let positionToUpdate = PositionsData.value.find((pos) => pos.pool.pool_index === newPosition.pool.pool_index)
    if (!positionToUpdate) {
        // adds to the list
        PositionsData.value.push(newPosition)
        return
    }

    // updates already existing
    const indexToUpate = PositionsData.value.indexOf(positionToUpdate)
    PositionsData.value[indexToUpate] = newPosition
}

provide("PositionsAsyncData", {
    PositionsData,
    PositionsPending,
    RefreshPositions,
    PositionsError,
    PositionsStatus,
    getSinglePostion,
    updatePositionInPositions,
})
// POSITIONS ----------------

// checking whether wallet is sanctioned and redirecting it to google
const { data: isSanctioned } = useAsyncData(
    "sanction",
    () => {
        if (connectedChainId.value && connectedAccount.value) {
            return $fetch(getUrl(`/chain/${connectedChainId.value}/user/${connectedAccount.value}/sanctioned`))
        } else {
            return []
        }
    },
    {
        default: null,
        server: false,
        lazy: true,
        immediate: true,
        watch: [connectedAccount, connectedChainId],
        transform: (newSactioned) => {
            if (newSactioned === true) {
                navigateTo("https://google.com", {
                    external: true,
                })
            }
        },
    }
)

// MODAL STUFF ------------------

// this ref links to a component
const selectTokenModal = ref(null)
function toggleSelectTokenModal(...args) {
    selectTokenModal.value.toggleModal(...args)
}
provide("SelectTokenModal", toggleSelectTokenModal)
// MODAL STUFF ------------------

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
</script>

<style lang="scss">
.wrapper {
    position: relative;
    margin: 0 auto;
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
    * {
        visibility: hidden;
    }
    animation-duration: 2.5s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: shimmer;
    animation-timing-function: linear;
    $mainbg: rgba(108, 108, 108, 0.3);
    /* background: $mainbg; */
    $mid: rgba(255, 255, 255, 0.3);
    background: linear-gradient(to right, $mainbg 10%, $mid 22%, $mainbg 36%);
    /* background: linear-gradient(to right, $mainbg 0%, $mainbg 24.05%, $mid 43.78%, $mainbg 63.51%, $mainbg 100%); */
    $width: 1200px;
    background-size: $width 100%;

    &--on-widget {
    }

    @-webkit-keyframes shimmer {
        0% {
            background-position: -100% 0;
        }
        100% {
            background-position: 100% 0;
        }
    }

    @keyframes shimmer {
        0% {
            background-position: calc($width * -1) 0;
        }
        100% {
            background-position: $width 0;
        }
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
        border-bottom: 1px solid var(--grey-stroke-sm);
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
        background-color: var(--list-item-hover-bg);
        border: 1px solid var(--list-item-hover-stroke);
        &--bottom-border {
            border: none;
            border-bottom: 1px solid var(--list-item-hover-stroke);
        }
    }
    &:active {
        background-color: var(--list-item-click-bg);
        border: 1px solid var(--primary);
    }
    &--bottom-border {
        &:hover {
            border: 1px solid transparent;
            border-bottom: 1px solid var(--list-item-hover-stroke);
        }
        &:active {
            border: 1px solid transparent;
            border-bottom: 1px solid var(--primary);
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
    &--separate {
        margin-bottom: 5px;
    }
    &--opaque {
        color: var(--text-color-reverse-opaque);
        .token-icon {
            opacity: 0.4;
        }
    }
    .tick-icon {
        color: var(--primary);
        margin-left: auto;
        margin-right: 6px;
    }
    p {
        margin-left: 6px;
    }
}

.info {
    padding: 10px;
    border-radius: var(--inner-wdg-radius);
    align-items: center;
    background-color: var(--info-bg-opaque);
    .icon {
        color: var(--info-bg);
    }
    p {
        margin-left: 10px;
    }
    &--warn {
        background-color: var(--error-color-opaque);
        .icon {
            color: var(--error-color);
        }
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
    color: var(--primary);
    &--border {
        padding: 0 7px;
        border-radius: 9999px;
        border: 1px solid var(--primary);
        &:hover {
            background-color: var(--list-item-hover-bg);
        }
        &:active {
            background-color: var(--list-item-click-bg);
        }
    }
    &--underlined {
        cursor: pointer;
        text-decoration: underline;
    }
}
.activator-link {
    cursor: pointer;
    &:hover {
        border-bottom: 1px solid var(--primary);
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
    &.space-around {
        justify-content: space-around;
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
.hide {
    visibility: hidden;
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
