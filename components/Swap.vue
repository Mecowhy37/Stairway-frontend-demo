<template>
    <Widget>
        <template #widget-title>Swap</template>
        <template #right-icon>
            <Dropdown
                :settings-ref="settings"
                no-padding
                solid
            >
                <template #dropdown-activator="{ on }">
                    <Btn
                        transparent
                        circle
                        icon-contrast
                        class="grey-text"
                    >
                        <template #icon>
                            <Icon
                                name="cog"
                                :size="20"
                            />
                        </template>
                    </Btn>
                </template>
                <template #dropdown="{ toggleDropdown }">
                    <Settings
                        ref="settings"
                        :default-slippage="0.5"
                        :default-deadline="30"
                        :toggle-dropdown="toggleDropdown"
                        no-slippage
                    ></Settings>
                </template>
            </Dropdown>
        </template>
        <template #widget-content>
            <div
                class="tips"
                v-if="connectedChainId === 80001 && connectedAccount"
            >
                <FaucetTrigger :callback="() => getBothBalances(false, false)"></FaucetTrigger>
            </div>
            <div class="windows">
                <div
                    class="contents"
                    v-for="(i, x) in new Array(2)"
                >
                    <div class="window layer-wdg-box">
                        <div class="window__upper">
                            <Btn
                                @click="openTokenSelectModal(x)"
                                :disabled="isWidgetLocked"
                                opaque
                                selectable
                                custom
                            >
                                {{ Tokens[x] !== null ? Tokens[x]?.symbol : "Select token" }}
                                <template #icon>
                                    <Icon
                                        name="chevron"
                                        :size="16"
                                    />
                                </template>
                            </Btn>
                            <input
                                :class="{
                                    error: insufficientBalanceIndexes.includes(tkEnum.QUOTE) && x === tkEnum.QUOTE,
                                }"
                                type="text"
                                placeholder="0"
                                spellcheck="false"
                                autocomplete="off"
                                autocorrect="off"
                                :disabled="isWidgetLocked"
                                @input="amountInputHandler($event, x)"
                                :value="userAmounts[amountsLabelOrder[x]]"
                            />
                        </div>
                        <div
                            class="window__lower row flex-end align-center"
                            @click="!isWidgetLocked && fillInBalance(Balances[x], x)"
                            :class="{ disabled: !Tokens[x] || Balances[x] === 0n }"
                        >
                            <!-- <Balance
                                :key="x"
                                :token="Tokens[x]"
                                :wallet="connectedAccount"
                                :chainId="connectedChainId"
                                :allBalances="allBalances"
                                :index="x"
                            ></Balance> -->
                            <p class="caption">
                                {{ formatedBalances[x] }}
                            </p>
                            <Icon
                                name="wallet"
                                :size="13"
                            />
                        </div>
                    </div>
                    <div
                        v-if="x === 0"
                        class="mid-symbol arrow"
                    >
                        <Btn
                            circle
                            plain
                            active
                            @click="switchOrder()"
                            :disabled="isWidgetLocked"
                        >
                            <template #icon>
                                <Icon
                                    name="arrow"
                                    :size="11"
                                />
                            </template>
                        </Btn>
                    </div>
                </div>
            </div>
            <div
                v-if="
                    (bothTokensThere && pool && BigInt(pool.depth) < fullAmounts.base) ||
                    insufficientBalanceIndexes.includes(tkEnum.QUOTE) ||
                    poolError ||
                    !isSupportedChain(connectedChainId)
                "
                class="infos caption"
            >
                <div
                    v-if="poolError"
                    class="info row"
                >
                    <div>
                        <Icon
                            class="icon"
                            name="warning"
                            :size="25"
                        />
                    </div>
                    <p>
                        Pool not found. You can create it
                        <span
                            @click="redirectToAddLiquidity"
                            class="text-highlight--underlined"
                            >here</span
                        >.
                    </p>
                </div>
                <div
                    v-if="!isSupportedChain(connectedChainId)"
                    class="info info--warn row"
                >
                    <div>
                        <Icon
                            class="icon"
                            name="warning"
                            :size="25"
                        />
                    </div>
                    <p>
                        You're on an unsupported network, please change to
                        <span
                            @click="setTheChain(80001)"
                            class="text-highlight--underlined"
                            >Polygon Mumbai</span
                        >.
                    </p>
                </div>
                <div
                    v-if="insufficientBalanceIndexes.includes(tkEnum.QUOTE)"
                    class="info info--warn row"
                >
                    <div>
                        <Icon
                            class="icon"
                            name="warning"
                            :size="25"
                        />
                    </div>
                    <p>Insufficient {{ Tokens[tkEnum.QUOTE].symbol }} funds</p>
                </div>
                <div
                    v-if="bothTokensThere && pool && BigInt(pool.depth) < fullAmounts.base"
                    class="info row"
                >
                    <div>
                        <Icon
                            class="icon"
                            name="warning"
                            :size="25"
                        />
                    </div>
                    <p>
                        Currently, only
                        {{ roundFloor(formatUnits(pool.depth, Tokens[tkEnum.BASE].decimals)) }}
                        {{ Tokens[tkEnum.BASE].symbol }}
                        is available at this fixed price. You'll pay solely for what you receive. Availability may
                        change in real-time.
                        <!-- <br /> -->
                        <span
                            class="text-highlight--underlined"
                            @click="fillInDepth(pool.depth)"
                            >Adjust my swap</span
                        >
                    </p>
                </div>
            </div>
            <div class="buttons">
                <Btn
                    @click="callSwap"
                    is="h4"
                    wide
                    bulky
                    :disabled="!canSwap || isWidgetLocked || insufficientBalanceIndexes.includes(tkEnum.QUOTE)"
                >
                    Swap
                </Btn>
            </div>
            <div
                v-if="price && bothTokensThere && poolIsRemaining"
                class="sum-up grey-text caption"
            >
                <div class="row space-between">
                    <div class="row">
                        <p>Fixed price per 1 {{ Tokens[tkEnum.BASE].symbol }}</p>
                        <div
                            v-if="poolPending"
                            class="ping-cirle"
                        ></div>
                    </div>
                    <p>
                        {{ roundCeiling(formatUnits(price, Tokens[tkEnum.QUOTE].decimals)) }}
                        {{ Tokens[tkEnum.QUOTE].symbol }}
                    </p>
                </div>
                <div class="row space-between">
                    <p>Volume available at this price</p>
                    <p>
                        {{ roundFloor(formatUnits(depth, Tokens[tkEnum.BASE].decimals)) }}
                        {{ Tokens[tkEnum.BASE].symbol }}
                    </p>
                </div>
            </div>
            <div
                v-else-if="price && bothTokensThere && poolPending && !poolIsRemaining && !poolError"
                class="sum-up grey-text caption"
            >
                <div class="row space-between">
                    <div class="row">
                        <p>Fixed price per 1 {{ Tokens[tkEnum.BASE].symbol }}</p>
                        <div
                            v-if="poolPending"
                            class="ping-cirle"
                        ></div>
                    </div>
                    <p>... {{ Tokens[tkEnum.QUOTE].symbol }}</p>
                </div>
                <div class="row space-between">
                    <p>Volume available at this price</p>
                    <p>... {{ Tokens[tkEnum.BASE].symbol }}</p>
                </div>
            </div>
        </template>
    </Widget>
</template>

<script setup>
import { formatUnits, fromTwos } from "ethers"

import { storeToRefs } from "pinia"
import { useStepStore } from "@/stores/step"

import { usePools } from "~/helpers/usePools"
import { useTokens } from "~/helpers/useTokens"
import { useBalances } from "~/helpers/useBalances"
import { useAmounts } from "~/helpers/useAmounts"

import { widgetTypeObj, tkEnum, roundCeiling, roundFloor, isSupportedChain, getUrl } from "~/helpers/index"

import { useWidget } from "~/helpers/useWidget"

const stepStore = useStepStore()
const { setTheChain } = stepStore

const { connectedAccount, connectedChainId, allBalances } = storeToRefs(stepStore)

const { routerAddress } = inject("AddressesAsyncData")
const { FeaturedTokensData } = inject("FeaturedTokensAsyncData")

// ROUTES ----------------
const router = useRouter()
const route = useRoute()
// ROUTES ----------------

// TOKENS ------------------
const { Tokens, bothTokensThere, selectTokenIndex, setToken, reverseTokens } = useTokens(
    FeaturedTokensData,
    connectedChainId,
    route
)
// TOKENS ------------------

const { isWidgetLocked, widgetLocker } = useWidget(FeaturedTokensData, Tokens, connectedChainId, router, route)

// BALANCES ----------------
const { Balances, formatedBalances, getBothBalances, reverseBalances } = useBalances(
    Tokens,
    connectedAccount,
    connectedChainId
)
// BALANCES ----------------

// POOL -----------------
const { pool, refreshPool, poolPending, poolError, price, depth, swap } = await usePools(
    routerAddress,
    Tokens,
    connectedAccount,
    connectedChainId,
    route
)

// calulates the opposite input to the one that has been set previously
watch(
    () => [price.value, pool.value],
    ([newPrice, newPool]) => {
        if (newPrice && newPool) {
            console.log("newPrice:", newPrice)
            calcAndSetOpposingInput(
                fullAmounts[getInputLabel(lastChangedAmount.value)],
                lastChangedAmount.value,
                BigInt(pool.value.base_reserves),
                BigInt(pool.value.quote_reserves),
                BigInt(pool.value.price)
            )
        }
    }
)
// POOL -----------------

// WIDGET ------------------

// is swap action enabled
const canSwap = computed(() => {
    return pool.value && bothAmountsIn.value
})
function switchOrder() {
    lastChangedAmount.value = oppositeInput(lastChangedAmount.value)
    selectTokenIndex.value = oppositeInput(selectTokenIndex.value)
    reverseTokens()
    switchAmounts()
}

function callSwap() {
    const successData = {
        action: "swapped",
        quote: {
            token: Tokens.value[tkEnum.QUOTE],
            amount: fullAmountsMap.value[tkEnum.QUOTE].toString(),
        },
        base: {
            token: Tokens.value[tkEnum.BASE],
            amount: fullAmountsMap.value[tkEnum.BASE].toString(),
        },
    }
    let notifHolder = { id: null }
    stepStore.notify(notifHolder, "success", false, successData)

    resetInputAmounts(tkEnum.QUOTE)
    resetInputAmounts(tkEnum.BASE)
    return
    widgetLocker(true)

    // TODO: swap() should be moved to this file
    swap(
        pool.value.path,
        fullAmounts.quote,
        fullAmounts.base,
        BigInt(price.value),
        connectedAccount.value,
        settings.value.deadline,
        stepStore.connectedWallet.provider,
        swapFailedHandler,
        eventReceivedHandler,
        stepStore.notify,
        widgetLocker
    )
}

function swapFailedHandler(error) {
    console.log("swapFailedHandler()", error)
    widgetLocker(false)
    getBothBalances(false, false)
    refreshPool()
}

function eventReceivedHandler(liquidityEvent, originalCall, notifHolder) {
    console.log("eventReceivedHandler()")

    // TODO: might have to be removed - useless check?
    if (liquidityEvent === null) {
        stepStore.notify(notifHolder, "success", false)
        refresh()
        return
    }

    const eventDict = {
        QUOTE: "amount_in",
        BASE: "amount_out",
    }

    const quoteAmountIn = BigInt(liquidityEvent[eventDict.QUOTE])
    const baseAmounOut = BigInt(liquidityEvent[eventDict.BASE])

    const successData = {
        action: "swapped",
        quote: {
            token: originalCall.tokenQuote,
            amount: quoteAmountIn.toString(),
        },
        base: {
            token: originalCall.tokenBase,
            amount: baseAmounOut.toString(),
        },
    }
    console.log("successData:", successData)
    stepStore.notify(notifHolder, "success", false, successData)
    refresh()
}

function refresh() {
    console.log("refresh() - swap")
    resetInputAmounts(tkEnum.QUOTE)
    resetInputAmounts(tkEnum.BASE)
    getBothBalances(false, false)
    refreshPool()
}
function fillInBalance(amount, inputIndex) {
    if (Tokens.value[inputIndex] && Number(Balances.value[inputIndex]) !== 0) {
        const formatedAmount = formatUnits(amount, Tokens.value[inputIndex].decimals)
        console.log("fillInBalance(amount, inputIndex)", formatedAmount, inputIndex)
        // updates last chaned amount index
        lastChangedAmount.value = inputIndex
        setUserAmount(formatedAmount, inputIndex)
        setFromUserToFullAmount(formatedAmount, Tokens.value[inputIndex].decimals, inputIndex)
    }
}
function fillInDepth(depth) {
    console.log("fillInDepth()")
    const formatedDepth = formatUnits(depth, Tokens.value[tkEnum.BASE].decimals)
    lastChangedAmount.value = tkEnum.BASE
    setUserAmount(formatedDepth, tkEnum.BASE)
    setFromUserToFullAmount(formatedDepth, Tokens.value[tkEnum.BASE].decimals, tkEnum.BASE)
}

function redirectToAddLiquidity() {
    router.push({
        path: "/add-liquidity",
        query: {
            tk1: Tokens.value[tkEnum.QUOTE].address,
            tk2: Tokens.value[tkEnum.BASE].address,
        },
    })
}

// WIDGET ------------------

// AMOUNTS -----------------
const {
    userAmounts,
    fullAmounts,
    fullAmountsMap,
    lastChangedAmount,
    amountsLabelOrder,
    switchAmounts,
    getInputLabel,
    oppositeInput,
    amountInputHandler,
    setUserAmount,
    setFromUserToFullAmount,
    calcAndSetOpposingInput,
    resetInputAmounts,
    bothAmountsIn,
} = useAmounts(Tokens, pool, widgetTypeObj.swap, poolPending)

// shows at which index the balanace in insufficient
const insufficientBalanceIndexes = computed(() => {
    let tooSmallBalanceIndexes = []
    if (connectedAccount.value) {
        Tokens.value.forEach((token, idx) => {
            if (!token || Balances.value[idx] === "") {
                return
            }
            if (Balances.value[idx] < fullAmountsMap.value[idx]) {
                tooSmallBalanceIndexes.push(idx)
            }
        })
    }
    return tooSmallBalanceIndexes
})
// AMOUNTS -----------------

// MODAL STUFF -------------
const toggleSelectTokenModal = inject("SelectTokenModal")
function openTokenSelectModal(index) {
    toggleSelectTokenModal(Tokens.value, (arg) => setToken(arg), index)
    selectTokenIndex.value = index
}
// MODAL STUFF -------------

//SETTINGS--------------
const settings = ref()
//SETTINGS--------------

// POOL REFRESH LOOP ---------
const poolRefreshInterval = ref(null)
const poolIsRemaining = ref(false)

// TODO: would be nice if this was a promise so that it cannot be called over again
function startPoolRefresh(poolRemaining = false) {
    // poolRemaining is a var that controls whether keep pool data showned or revert to loading state or other
    const randomTimeout = Math.floor(Math.random() * (7000 - 4000 + 1)) + 4000

    if (poolRefreshInterval.value !== null) {
        stopPoolRefresh(poolRefreshInterval.value)
    }

    poolIsRemaining.value = poolRemaining
    poolRefreshInterval.value = setInterval(async () => {
        // console.log("L o O p", poolRefreshInterval.value, randomTimeout / 1000 + "s")
        await refreshPool()

        startPoolRefresh(poolRemaining)
    }, randomTimeout)
}

function stopPoolRefresh(intervalId = null) {
    // console.log("clear loop", poolRefreshInterval)
    poolIsRemaining.value = false

    if (intervalId) {
        clearInterval(intervalId)
    } else {
        clearInterval(poolRefreshInterval.value)
    }

    poolRefreshInterval.value = null
}

const stopNavigationObserver = router.beforeEach((to, from) => {
    if (to.name !== "swap") {
        console.log("EXITING SWAP")
        stopPoolRefresh()
        stopNavigationObserver()
    }
})
// POOL REFRESH LOOP ---------

async function waitForPoolToRefresh() {
    const lastChangedAmountIndex = lastChangedAmount.value

    await refreshPool()
    if (pool.value) {
        startPoolRefresh(true)
        calcAndSetOpposingInput(
            fullAmounts[getInputLabel(lastChangedAmountIndex)],
            lastChangedAmountIndex,
            BigInt(pool.value.base_reserves),
            BigInt(pool.value.quote_reserves),
            BigInt(pool.value.price)
        )
    } else {
        startPoolRefresh()
    }
}

watch(
    () => Tokens.value,
    (tokens, oldTokens) => {
        console.log("- - - - - - - - - - - - - - -\nwatch(Tokens)")

        //getting balance
        const oldTokensAddresses = oldTokens?.map((oldTkn) => oldTkn?.address)
        const areNewTokensOldReversered = tokens?.every((tkn) => oldTokensAddresses?.includes(tkn?.address))
        console.log("areNewTokensOldReversered:", areNewTokensOldReversered)
        const selectIndex = selectTokenIndex.value
        if (!areNewTokensOldReversered) {
            if (tokens[selectIndex]) {
                getBothBalances(selectIndex, false)
            }
            poolError.value = null
            pool.value = null
        }

        // setting full amount
        const lastChangedAmountIndex = lastChangedAmount.value

        // fetching pool
        stopPoolRefresh(poolRefreshInterval.value)
        if (bothTokensThere.value) {
            resetInputAmounts(oppositeInput(lastChangedAmountIndex))
            waitForPoolToRefresh()
        }
    },
    {
        immediate: true,
    }
)
</script>
