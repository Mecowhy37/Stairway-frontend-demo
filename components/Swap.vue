<template>
    <!-- <div class="row"> -->
    <Widget no-return>
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
                v-if="connectedChainId === 80001"
            >
                <FaucetTriggerII :callback="() => getBothBalances(false, false)"></FaucetTriggerII>
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
                class="infos"
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
                            @click="addRedirect"
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
                        You're on unsupported network, please change to
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
                        <br />
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
                    v-if="!stepStore.connectedWallet"
                    is="h4"
                    wide
                    bulky
                    @click="stepStore.connectWallet()"
                >
                    Connect wallet
                </Btn>
                <Btn
                    v-else
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
                <div class="row">
                    <p>
                        1 {{ Tokens[tkEnum.BASE].symbol }} =
                        {{ roundCeiling(formatUnits(price, Tokens[tkEnum.QUOTE].decimals)) }}
                        {{ Tokens[tkEnum.QUOTE].symbol }}
                    </p>
                    <div
                        v-if="poolPending"
                        class="ping-cirle"
                    ></div>
                </div>
                <div class="row space-between">
                    <p>
                        Volume available at this price ({{
                            roundCeiling(formatUnits(price, Tokens[tkEnum.QUOTE].decimals))
                        }}
                        {{ Tokens[tkEnum.QUOTE].symbol }})
                    </p>
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
                <p>
                    1 {{ Tokens[tkEnum.BASE].symbol }} = ...
                    {{ Tokens[tkEnum.QUOTE].symbol }}
                </p>
                <div class="row space-between">
                    <p>
                        Volume available at this price ( ...
                        {{ Tokens[tkEnum.QUOTE].symbol }})
                    </p>
                    <p>
                        ...
                        {{ Tokens[tkEnum.BASE].symbol }}
                    </p>
                </div>
            </div>
        </template>
    </Widget>
    <!-- <Widget no-return>
            <template #widget-title>temporary display</template>
            <template #widget-content>
                <div class="contents temp-display">
                    <div>
                        <h4>token A</h4>
                        <p><span class="grey-text">symbol: </span> {{ tokenA?.symbol }}</p>
                        <p><span class="grey-text">user amount: </span> {{ userAmounts.quote }}</p>
                        <p><span class="grey-text">full amount: </span> {{ fullAmounts.quote }}</p>
                    </div>
                    <div>
                        <h4>token B</h4>
                        <p><span class="grey-text">symbol: </span> {{ tokenB?.symbol }}</p>
                        <p><span class="grey-text">user amount: </span> {{ userAmounts.base }}</p>
                        <p><span class="grey-text">full amount: </span> {{ fullAmounts.base }}</p>
                    </div>
                    <div>
                        <p><span class="grey-text">price: </span> {{ pool?.price }}</p>
                    </div>
                </div>
            </template>
        </Widget> -->
    <!-- </div> -->
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

const { featuredTokens, connectedAccount, connectedChainId, routerAddress } = storeToRefs(stepStore)

// ROUTES ----------------
const router = useRouter()
const route = useRoute()
// ROUTES ----------------

// TOKENS ------------------
const { Tokens, bothTokensThere, selectTokenIndex, setToken, reverseTokens } = useTokens()
// TOKENS ------------------

const { isWidgetLocked, widgetLocker } = useWidget(featuredTokens, Tokens, connectedChainId, router, route)

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
    widgetLocker(true)

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

function eventReceivedHandler(lqEvent, originalCall, notifHolder) {
    console.log("eventReceivedHandler()")

    const eventDict = {
        QUOTE: "amount_in",
        BASE: "amount_out",
    }

    const quoteAmountIn = BigInt(lqEvent[eventDict.QUOTE])
    const baseAmounOut = BigInt(lqEvent[eventDict.BASE])

    const successData = {
        action: "swapped",
        quote: {
            token: originalCall.tokenQuote,
            amount: quoteAmountIn,
        },
        base: {
            token: originalCall.tokenBase,
            amount: baseAmounOut,
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

const insufficientBalanceIndexes = computed(() => {
    let balanceIndexes = []
    if (connectedAccount.value) {
        Tokens.value.forEach((token, idx) => {
            if (!token || Balances.value[idx] === "") {
                return
            }
            if (Balances.value[idx] < fullAmountsMap.value[idx]) {
                balanceIndexes.push(idx)
            }
        })
    }
    return balanceIndexes
})
function addRedirect() {
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
    setFromFullToUserAmount,
    calcAndSetOpposingInput,
    calcQuote,
    resetInputAmounts,
    bothAmountsIn,
} = useAmounts(Tokens, pool, widgetTypeObj.swap, poolPending)

function Round(amt) {
    let amount = Number(amt)
    amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
    if (amount == 0) {
        return ""
    }
    return Number(amount) < 0.00001 ? "<0.00001" : String(parseFloat(amount))
}

// MODAL STUFF -------------
const toggleSelectTokenModal = inject("selectTokenModal")
function openTokenSelectModal(index) {
    toggleSelectTokenModal(Tokens.value, (arg) => setToken(arg), index)
    selectTokenIndex.value = index
}
// MODAL STUFF -------------

//SETTINGS--------------
const settings = ref()
//SETTINGS--------------

let poolRefreshInterval = null
const poolIsRemaining = ref(false)

//would be nice if this was a promise so that it cannot be called over again
function startPoolRefresh(poolRemaining = false) {
    const randomTimeout = Math.floor(Math.random() * (7000 - 4000 + 1)) + 4000

    if (poolRefreshInterval !== null) {
        stopPoolRefresh(poolRefreshInterval)
    }

    poolIsRemaining.value = poolRemaining
    poolRefreshInterval = setInterval(async () => {
        console.log("L o O p", poolRefreshInterval, randomTimeout / 1000 + "s")
        await refreshPool()

        startPoolRefresh(poolRemaining)
    }, randomTimeout)
}

function stopPoolRefresh(intervalId = null) {
    console.log("clear loop", poolRefreshInterval)
    poolIsRemaining.value = false

    if (intervalId) {
        clearInterval(intervalId)
    } else {
        clearInterval(poolRefreshInterval)
    }

    poolRefreshInterval = null
}

const remover = router.beforeEach((to, from) => {
    if (to.name !== "swap") {
        console.log("EXITING SWAP")
        stopPoolRefresh()
        remover()
    }
})

watch(
    Tokens,
    async (tokens, oldTokens) => {
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
        } else {
            reverseBalances()
        }

        // setting full amount
        const newTokenIndex = selectTokenIndex.value
        const lastChangedAmountIndex = lastChangedAmount.value
        // console.log("watch(Tokens) - new token:", getInputLabel(newTokenIndex))
        // console.log("watch(Tokens) - last changed amount:", getInputLabel(lastChangedAmountIndex))
        // if (newTokenIndex === lastChangedAmountIndex && Tokens.value[newTokenIndex]) {
        //     setFromUserToFullAmount(
        //         userAmounts[amountsLabelOrder.value[lastChangedAmountIndex]],
        //         Tokens.value[newTokenIndex].decimals,
        //         lastChangedAmountIndex
        //     )
        // }

        // fetching pool
        stopPoolRefresh(poolRefreshInterval)
        if (bothTokensThere.value) {
            resetInputAmounts(oppositeInput(lastChangedAmountIndex))
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
    },
    {
        immediate: true,
    }
)
</script>
