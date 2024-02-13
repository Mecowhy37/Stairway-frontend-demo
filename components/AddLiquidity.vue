<template>
    <Widget router-direction="/liquidity">
        <template #widget-title>Add Liquidity</template>
        <template #right-icon>
            <Dropdown
                :settings-ref="settingsAdd"
                no-padding
                solid
            >
                <template #dropdown-activator>
                    <Btn
                        circle
                        transparent
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
                        ref="settingsAdd"
                        :default-slippage="0.5"
                        :default-deadline="30"
                        :toggle-dropdown="toggleDropdown"
                    ></Settings>
                </template>
            </Dropdown>
        </template>
        <template #widget-content>
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
                                    error: insufficientBalanceIndexes.includes(x),
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
                            :class="{ disabled: !Tokens[x] || Number(Balances[x]) === 0 }"
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
                        class="mid-symbol plus grey-text"
                    >
                        <Icon
                            name="plus"
                            :size="16"
                        />
                    </div>
                </div>
            </div>
            <div
                v-if="
                    insufficientBalanceIndexes.length > 0 ||
                    poolError ||
                    hasDaoTokenPicked ||
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
                        Pool not found. Be aware you are setting a initial price of the pool{{
                            settingPoolPrice
                                ? ` to 1 ${Tokens[tkEnum.QUOTE].symbol} = ${settingPoolPrice} ${
                                      Tokens[tkEnum.BASE].symbol
                                  }.`
                                : "."
                        }}
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
                    v-if="hasDaoTokenPicked"
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
                        You are trying to add liquidity including a governance token, be aware that it may take multiple
                        transactions in order to add desired amount and maintain governance ability.
                    </p>
                </div>
                <div
                    v-if="insufficientBalanceIndexes.length > 0"
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
                        Insufficient
                        {{ insufficientBalanceIndexes.map((el) => Tokens[el].symbol).join(" and ") }} funds
                    </p>
                </div>
            </div>
            <div
                v-if="false"
                class="tables"
            >
                <div>
                    <p>Pool share</p>
                    <div class="columns row">
                        <div v-for="(x, index) in new Array(2)">
                            <p v-if="Tokens[index].address === ownedPosition.pool.quote_token.address">
                                {{
                                    basicRound(
                                        formatUnits(ownedPosition.quote_amount, ownedPosition.pool.quote_token.decimals)
                                    )
                                }}
                            </p>
                            <p v-else>
                                {{
                                    basicRound(
                                        formatUnits(ownedPosition.base_amount, ownedPosition.pool.base_token.decimals)
                                    )
                                }}
                            </p>
                            <p class="caption grey-text">Pooled {{ Tokens[index].symbol }}</p>
                        </div>

                        <div>
                            <p>{{ basicRound(ownedPosition.pool_share_pct) }}%</p>
                            <p class="caption grey-text">Pool share</p>
                        </div>
                    </div>
                </div>
            </div>
            <div
                v-if="ownedPosition && isSupportedChain(connectedChainId)"
                class="pooled"
            >
                <div
                    v-for="(x, index) in new Array(2)"
                    class="pooled__item row align-center"
                >
                    <AccountIcon
                        :account="Tokens[index].address"
                        size="21"
                    />
                    <p class="pooled__item__symbol grey-text">Pooled {{ Tokens[index].symbol }}:</p>
                    <p
                        v-if="Tokens[index].address === ownedPosition.pool.quote_token.address"
                        class="pooled__item__amount"
                    >
                        {{
                            basicRound(
                                Number(formatUnits(ownedPosition.quote_amount, ownedPosition.pool.quote_token.decimals))
                            )
                        }}
                    </p>
                    <p
                        v-else
                        class="pooled__item__amount"
                    >
                        {{
                            basicRound(
                                Number(formatUnits(ownedPosition.base_amount, ownedPosition.pool.base_token.decimals))
                            )
                        }}
                    </p>
                </div>
            </div>
            <div
                v-else-if="ownedPosition === false && SinglePositionPending && !SinglePositionError && pool"
                class="placeholder placeholder--in-widget"
            >
                <p>placeholder</p>
                <p>text</p>
            </div>
            <div class="buttons">
                <Btn
                    @click="callAddLiquidity()"
                    is="h4"
                    wide
                    bulky
                    :disabled="
                        !bothAmountsIn || !bothTokensThere || isWidgetLocked || insufficientBalanceIndexes.length > 0
                    "
                >
                    Add Liquidity
                </Btn>
            </div>
        </template>
    </Widget>
</template>

<script setup>
import { inject } from "vue"
import { formatUnits, getAddress } from "ethers"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"

import { useBalances } from "~/helpers/useBalances"
import { useAmounts } from "~/helpers/useAmounts"
import { useTokens } from "~/helpers/useTokens"
import { usePools } from "~/helpers/usePools"
import { basicRound, roundFloor, tkEnum, widgetTypeObj, isSupportedChain, isTestNet } from "~/helpers/index"

import { useWidget } from "~/helpers/useWidget"

const stepStore = useStepStore()

const { connectedAccount, connectedChainId } = storeToRefs(stepStore)
const { setTheChain } = stepStore

const { routerAddress } = inject("AddressesAsyncData")
const { PositionsData, getSinglePostion, updatePositionInPositions } = inject("PositionsAsyncData")
const { FeaturedTokensData } = inject("FeaturedTokensAsyncData")

// ROUTES ----------------
const router = useRouter()
const route = useRoute()
// ROUTES ----------------

// TOKENS ---------------
const { Tokens, bothTokensThere, setToken, selectTokenIndex, hasDaoTokenPicked } = useTokens(
    FeaturedTokensData,
    connectedChainId,
    route
)
// TOKENS ---------------

// BALANCES -------------
const { Balances, getBothBalances, reverseBalances, formatedBalances } = useBalances(
    Tokens,
    connectedAccount,
    connectedChainId
)
// BALANCES -------------

// POOL -----------------
const { pool, refreshPool, addLiquidity, poolError, poolRatio, poolPending } = await usePools(
    routerAddress,
    Tokens,
    connectedAccount,
    connectedChainId,
    route
)

// calulates the opposite input to the one that has been set previously
watch(
    () => [poolRatio.value, pool.value],
    ([newPoolRatio, newPool]) => {
        if (newPoolRatio && newPool) {
            console.log("newPoolRatio:", newPoolRatio)
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

// WIDGET ---------------
const { isWidgetLocked, widgetLocker } = useWidget(FeaturedTokensData, Tokens, connectedChainId, router, route)

// this async data is binded to global positions state and is resposible for signle active position
const {
    pending: SinglePositionPending,
    refresh: RefreshSinglePosition,
    error: SinglePositionError,
} = await useAsyncData(
    "SinglePosition",
    () => {
        if (pool.value) {
            return getSinglePostion(pool.value.pool_index)
        }
    },
    {
        lazy: true,
        server: false,
        transform: (newSinglePosition) => {
            if (newSinglePosition) {
                updatePositionInPositions(newSinglePosition)
            }
            return newSinglePosition
        },
        watch: [() => pool.value?.pool_index, connectedChainId],
    }
)

// returns a position if user has liquidity in it
const ownedPosition = computed(() => {
    return findPositionByTokenAddresses(Tokens.value[tkEnum.QUOTE]?.address, Tokens.value[tkEnum.BASE]?.address)
})

// shows user a aproximate price that a pool will be set to with user specified ratio
const settingPoolPrice = computed(() => {
    if (!bothTokensThere.value || !bothAmountsIn.value) {
        return null
    }
    return roundFloor((parseInt(fullAmounts.base) / parseInt(fullAmounts.quote)).toString())
})

function callAddLiquidity() {
    const successData = {
        action: "added",
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

    // TODO: addLiquidity should be moved to this file instead of usePools.js
    addLiquidity(
        ...Tokens.value,
        fullAmounts.quote,
        fullAmounts.base,
        settingsAdd.value.slippage,
        settingsAdd.value.deadline,
        stepStore.connectedAccount,
        stepStore.connectedWallet.provider,
        addLiquidityFailedHandler,
        liquidityAddedEventHandler,
        stepStore.notify,
        widgetLocker
    )
}

function addLiquidityFailedHandler(error) {
    console.log("addLiquidityFailedHandler()", error)
    widgetLocker(false)
    getBothBalances(false, false)
    refreshPool()
}

function liquidityAddedEventHandler(lqEvent, originalCall, notifHolder) {
    console.log("liquidityAddedEventHandler()")

    const {
        tokenQuote,
        tokenBase,
        amountQuote: originQuoteAmount,
        amountBase: originBaseAmount,
        slippage,
    } = originalCall

    let eventQuoteToken
    let eventBaseToken

    // checks for the order of tokens in the event to match the correct amounts
    if (getAddress(tokenQuote.address) === getAddress(lqEvent.this_token)) {
        eventQuoteToken = "this_amount"
        eventBaseToken = "that_amount"
    } else {
        eventQuoteToken = "that_amount"
        eventBaseToken = "this_amount"
    }

    const quoteAmountAdded = BigInt(lqEvent[eventQuoteToken])
    console.log("originQuoteAmount:", originQuoteAmount)
    console.log("quoteAmountAdded:", quoteAmountAdded)
    const quoteAmountDelta = originQuoteAmount - quoteAmountAdded
    const quoteSlippagePercent = (Number(quoteAmountDelta) / Number(originQuoteAmount)) * 100
    const quoteWithinSlippage = quoteSlippagePercent <= slippage

    const baseAmountAdded = BigInt(lqEvent[eventBaseToken])
    console.log("originBaseAmount:", originBaseAmount)
    console.log("baseAmountAdded:", baseAmountAdded)
    const baseAmountDelta = originBaseAmount - baseAmountAdded
    const baseSlippagePercent = (Number(baseAmountDelta) / Number(originBaseAmount)) * 100
    const baseWithinSlippage = baseSlippagePercent <= slippage

    const tranasactionWithinSlippage = baseWithinSlippage && quoteWithinSlippage

    const successData = {
        action: "added",
        quote: {
            token: tokenQuote,
            amount: quoteAmountAdded.toString(),
        },
        base: {
            token: tokenBase,
            amount: baseAmountAdded.toString(),
        },
    }

    // when a successData comes in from previous trasaction it sums them up
    function sumTwoSuccessObejects(current, previous) {
        if (previous === null) {
            return current
        }
        const quoteSumAmount = BigInt(current.quote.amount) + BigInt(previous.quote.amount)
        const baseSumAmount = BigInt(current.base.amount) + BigInt(previous.base.amount)
        return {
            action: current.action,
            quote: {
                token: current.quote.token,
                amount: quoteSumAmount.toString(),
            },
            base: {
                token: current.base.token,
                amount: baseSumAmount.toString(),
            },
        }
    }

    const fullSuccessData = sumTwoSuccessObejects(successData, originalCall.successData)
    console.log("fullSuccessData:", fullSuccessData)

    const keepNotification = !tranasactionWithinSlippage
    stepStore.notify(notifHolder, "success", false, fullSuccessData, keepNotification)

    if (tranasactionWithinSlippage) {
        // this executes when transation finishes
        setTimeout(() => {
            navigateTo({ path: "/liquidity" })
        }, 1000)
    } else {
        // this is executed when transaction is not fully complete
        refreshPool()
        RefreshSinglePosition()
        getBothBalances(false, false)

        // this modifies original properties to left over amount to be passed over again
        originalCall.amountQuote = quoteAmountDelta
        originalCall.amountBase = baseAmountDelta
        originalCall.successData = fullSuccessData
        originalCall.notifId = notifHolder.id

        // timeout is here for sake of a gap between multiple trasactions
        setTimeout(() => {
            addLiquidity(...Object.values(originalCall))
        }, 1000)
    }
}

//finds position based on currently picked tokens
function findPositionByTokenAddresses(thisTokenAddress, thatTokenAddress) {
    if (!PositionsData.value || [thisTokenAddress, thatTokenAddress].some((el) => el === null)) {
        return null
    }
    const matchedPosition = PositionsData.value.find((position) => {
        const positionTokens = [position.pool.quote_token.address, position.pool.base_token.address]
        const widgetTokens = [thisTokenAddress, thatTokenAddress]
        // if tokens picked in the widget are matching position tokens
        if (positionTokens.every((el) => widgetTokens.includes(el))) {
            return position
        }
    })
    if (!matchedPosition) {
        return false
    }
    return matchedPosition
}

// user click action to set the amount to current max balance
function fillInBalance(amount, inputIndex) {
    if (Tokens.value[inputIndex] && Number(Balances.value[inputIndex]) !== 0) {
        const formatedAmount = formatUnits(amount, Tokens.value[inputIndex].decimals)
        console.log("fillInBalance(amount, inputIndex)", formatedAmount, inputIndex)
        lastChangedAmount.value = inputIndex
        setUserAmount(formatedAmount, inputIndex)
        setFromUserToFullAmount(formatedAmount, Tokens.value[inputIndex].decimals, inputIndex)
    }
}
// WIDGET ---------------

// AMOUNTS --------------
const {
    userAmounts,
    fullAmounts,
    fullAmountsMap,
    lastChangedAmount,
    amountsLabelOrder,
    getInputLabel,
    oppositeInput,
    amountInputHandler,
    setUserAmount,
    setFromUserToFullAmount,
    calcAndSetOpposingInput,
    resetInputAmounts,
    bothAmountsIn,
} = useAmounts(Tokens, pool, widgetTypeObj.add, poolPending)

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

// AMOUNTS --------------

//MODAL STUFF----------
const toggleSelectTokenModal = inject("SelectTokenModal")
function openTokenSelectModal(index) {
    toggleSelectTokenModal(Tokens.value, (arg) => setToken(arg), index)
    selectTokenIndex.value = index
}
//MODAL STUFF----------

//SETTINGS--------------

// reference to setting component
const settingsAdd = ref()
//SETTINGS--------------

// POOL REFRESH LOOP ---------
const poolRefreshInterval = ref(null)
const poolIsRemaining = ref(false)

// TODO: would be nice if this was a promise so that it cannot be called over again
function startPoolRefresh(poolRemaining = false) {
    const randomTimeout = Math.floor(Math.random() * (7000 - 4000 + 1)) + 4000

    if (poolRefreshInterval.value !== null) {
        stopPoolRefresh(poolRefreshInterval.value)
    }

    poolIsRemaining.value = poolRemaining
    poolRefreshInterval.value = setInterval(async () => {
        console.log("L o O p", poolRefreshInterval.value, randomTimeout / 1000 + "s")
        await refreshPool()
        await RefreshSinglePosition()

        startPoolRefresh(poolRemaining)
    }, randomTimeout)
}

function stopPoolRefresh(intervalId = null) {
    console.log("clear loop", poolRefreshInterval.value)
    poolIsRemaining.value = false

    if (intervalId) {
        clearInterval(intervalId)
    } else {
        clearInterval(poolRefreshInterval.value)
    }

    poolRefreshInterval.value = null
}

const stopNavigationObserver = router.beforeEach((to, from) => {
    if (to.name !== "add-liquidity") {
        console.log("EXITING ADD")
        stopPoolRefresh()
        stopNavigationObserver()
    }
})
// POOL REFRESH LOOP ---------

watch(
    Tokens,
    async (tokens, oldTokens) => {
        console.log("- - - - - - - - - - - - - - -\nwatch(Tokens)")

        //getting balance
        const oldTokensAddresses = oldTokens?.map((oldTkn) => oldTkn?.address)
        const areNewOldReversered = tokens?.every((tkn) => oldTokensAddresses?.includes(tkn?.address))
        console.log("areNewOldReversered:", areNewOldReversered)
        if (!areNewOldReversered) {
            if (tokens[selectTokenIndex.value]) {
                getBothBalances(selectTokenIndex.value, false)
            }
            poolError.value = null
            pool.value = null
        } else {
            reverseBalances()
        }

        // setting full amount
        const newTokenIndex = selectTokenIndex.value
        const newAmountIndex = lastChangedAmount.value
        // console.log("watch(Tokens) - new token:", getInputLabel(newTokenIndex))
        // if (newTokenIndex === newAmountIndex && Tokens.value[newTokenIndex]) {
        //     setFromUserToFullAmount(
        //         userAmounts[amountsLabelOrder.value[newAmountIndex]],
        //         Tokens.value[newTokenIndex].decimals,
        //         newAmountIndex
        //     )
        // }

        stopPoolRefresh(poolRefreshInterval)
        if (bothTokensThere.value) {
            resetInputAmounts(oppositeInput(newAmountIndex))
            await refreshPool()
            RefreshSinglePosition()

            if (pool.value) {
                startPoolRefresh(true)
                calcAndSetOpposingInput(
                    fullAmounts[getInputLabel(newAmountIndex)],
                    newAmountIndex,
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
