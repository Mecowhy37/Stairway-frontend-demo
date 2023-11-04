<template>
    <!-- <div class="row"> -->
    <Widget>
        <template #widget-title>Add liquidity</template>
        <template #right-icon>
            <Dropdown
                :settings-ref="settingsAdd"
                no-padding
                solid
            >
                <template #dropdown-activator="{ on }">
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
            <div
                v-if="connectedChainId === 80001"
                class="tips"
            >
                <!-- <FaucetTrigger
                    :closing-callback="() => getBothBalances(false, false)"
                    :connected-chain-id="connectedChainId"
                ></FaucetTrigger> -->
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
                                :disabled="addingDisabled"
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
                                    error: insufficientBalanceIndexes.includes(x) && connectedAccount,
                                }"
                                type="text"
                                placeholder="0"
                                spellcheck="false"
                                autocomplete="off"
                                autocorrect="off"
                                :disabled="addingDisabled"
                                @input="amountInputHandler($event, x)"
                                :value="userAmounts[amountsLabelOrder[x]]"
                            />
                        </div>
                        <div
                            class="window__lower row flex-end align-center"
                            @click="!addingDisabled && fillInBalance(Balances[x], x)"
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
                v-if="(insufficientBalanceIndexes.length > 0 && connectedAccount) || poolError || hasDaoToken"
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
                    <p>Pool not found. Be aware you are setting a initial ratio of the pool.</p>
                </div>
                <div
                    v-if="hasDaoToken"
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
                    v-if="insufficientBalanceIndexes.length > 0 && connectedAccount"
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
                v-if="ownedPosition"
                class="pooled"
            >
                <div
                    v-for="(x, index) in new Array(2)"
                    class="pooled__item row align-center"
                >
                    <img
                        class="token-icon token-icon--sm"
                        :src="Tokens[index].logo_uri"
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
                    @click="callAddLiquidity()"
                    is="h4"
                    wide
                    bulky
                    :disabled="
                        !bothAmountsIn || !bothTokensThere || addingDisabled || insufficientBalanceIndexes.length > 0
                    "
                >
                    Add liquidity
                </Btn>
                <!-- <Btn
                        @click="refresh()"
                        wide
                        bulky
                        :disabled="!connectedAccount"
                    >
                        refresh data
                    </Btn> -->
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
                        <p>
                            <span class="grey-text">quote_reserves (its off - reversed): </span>
                            {{ pool && formatUnits(pool.quote_reserves, pool.quote_token.decimals) }}
                        </p>
                    </div>
                    <div>
                        <h4>token B</h4>
                        <p><span class="grey-text">symbol: </span> {{ tokenB?.symbol }}</p>
                        <p><span class="grey-text">user amount: </span> {{ userAmounts.base }}</p>
                        <p><span class="grey-text">full amount: </span> {{ fullAmounts.base }}</p>
                        <p>
                            <span class="grey-text">base_reserves (its off - reversed): </span>
                            {{ pool && formatUnits(pool.base_reserves, pool.base_token.decimals) }}
                        </p>
                    </div>
                </div>
            </template>
        </Widget> -->
    <!-- </div> -->
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
import { basicRound, widgetTypeObj } from "~/helpers/index"

import { useWidget } from "~/helpers/useWidget"

const stepStore = useStepStore()

const { featuredTokens, positions, connectedAccount, connectedChainId, routerAddress } = storeToRefs(stepStore)
const { getSinglePostion, updatePositionsWithNewSingle } = stepStore

// ROUTES ----------------
const router = useRouter()
const route = useRoute()
// ROUTES ----------------s

// TOKENS ---------------
const { Tokens, bothTokensThere, setToken, selectTokenIndex } = useTokens()
// TOKENS ---------------

useWidget(featuredTokens, Tokens, connectedChainId, router, route)

// BALANCES -------------
const { Balances, getBothBalances, reverseBalances, formatedBalances } = useBalances(
    Tokens,
    connectedAccount,
    connectedChainId
)
// BALANCES -------------

// POOL -----------------
const { pool, refreshPool, addLiquidity, poolError, poolRatio } = await usePools(
    routerAddress,
    Tokens,
    connectedAccount,
    connectedChainId,
    route
)

watch(poolRatio, (newPoolRatio) => {
    if (newPoolRatio) {
        console.log("newPoolRatio:", newPoolRatio)
        calcAndSetOpposingInput(
            fullAmounts[getInputLabel(lastChangedAmount.value)],
            lastChangedAmount.value,
            BigInt(pool.value.base_reserves),
            BigInt(pool.value.quote_reserves),
            BigInt(pool.value.price)
        )
    }
})
// POOL -----------------

// WIDGET ---------------
const {
    pending: SinglePositionPending,
    refresh: RefreshSinglePosition,
    error: SinglePositionError,
} = await useAsyncData(
    "SinglePosition",
    () => {
        if (pool.value) {
            // return getSinglePostion(pool.value.pool_index)
        }
    },
    {
        lazy: true,
        server: false,
        transform: (newSinglePosition) => {
            if (newSinglePosition) {
                updatePositionsWithNewSingle(newSinglePosition)
            }
            return newSinglePosition
        },
    }
)

const ownedPosition = computed(() => {
    if (!pool.value || !positions.value) {
        return null
    }
    const matchedPosition = positions.value.find((el) => el.pool.pool_index === pool.value.pool_index)
    if (!matchedPosition) {
        return false
    }
    return matchedPosition
})

const hasDaoToken = computed(() => {
    return Tokens.value.some((el) => el?.is_governance)
})

// not neccessarily block the interface, just indicate - block until signed
function callAddLiquidity() {
    // addingDisabled.value = true
    widgetLocker(true)

    addLiquidity(
        ...Tokens.value,
        fullAmounts.quote,
        fullAmounts.base,
        settingsAdd.value.slippage,
        settingsAdd.value.deadline,
        stepStore.connectedAccount,
        stepStore.connectedWallet.provider,
        addLiquidityFailedHandler,
        eventReceivedHandler,
        stepStore.notify,
        widgetLocker,
        //isUserCall
        true
    )
}
const addingDisabled = ref(false)
function widgetLocker(lock) {
    addingDisabled.value = lock
}

function addLiquidityFailedHandler(error) {
    console.log("addLiquidityFailedHandler()", error)
    widgetLocker(false)
    getBothBalances(false, false)
    refreshPool()
}

function eventReceivedHandler(lqEvent, originalCall, notifHolder) {
    console.log("eventReceivedHandler()")

    const {
        tokenQuote,
        tokenBase,
        amountQuote: originQuoteAmount,
        amountBase: originBaseAmount,
        slippage,
        isUserCall,
    } = originalCall

    let eventQuoteToken
    let eventBaseToken
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
            amount: quoteAmountAdded,
        },
        base: {
            token: tokenBase,
            amount: baseAmountAdded,
        },
    }
    const keepNotification = !tranasactionWithinSlippage || !isUserCall
    stepStore.notify(notifHolder, "success", false, successData, keepNotification)

    if (tranasactionWithinSlippage) {
        // change this name to be more specific
        // resetInputAmounts(tkEnum.QUOTE)
        // resetInputAmounts(tkEnum.BASE)
        setTimeout(() => {
            navigateTo({ path: "/liquidity" })
        }, 1000)
    } else {
        // loop every x seconds
        refreshPool()
        RefreshSinglePosition()
        getBothBalances(false, false)
        originalCall.amountQuote = quoteAmountDelta
        originalCall.amountBase = baseAmountDelta
        originalCall.isUserCall = false
        addLiquidity(...Object.values(originalCall))
    }
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
const insufficientBalanceIndexes = computed(() => {
    let balanceIndexes = []
    Tokens.value.forEach((token, idx) => {
        if (!token || Balances.value[idx] === "") {
            return
        }
        if (Balances.value[idx] < fullAmountsMap.value[idx]) {
            balanceIndexes.push(idx)
        }
    })
    return balanceIndexes
})
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
} = useAmounts(Tokens, pool, widgetTypeObj.add)

function Round(amt) {
    // Round function trimms down unncessary digits and adds < mark when unsignificant
    let amount = Number(amt)
    if (amount === 0) {
        return ""
    }
    amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
    return Number(amount) < 0.00001 ? "<0.00001" : String(parseFloat(amount))
}
// AMOUNTS --------------

//MODAL STUFF----------
const toggleSelectTokenModal = inject("selectTokenModal")
function openTokenSelectModal(index) {
    toggleSelectTokenModal(Tokens.value, (arg) => setToken(arg, reverseBalances), index)
    selectTokenIndex.value = index
}
//MODAL STUFF----------

//SETTINGS--------------
const settingsAdd = ref()
//SETTINGS--------------

let intervalId = null
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

        // fetching pool
        if (bothTokensThere.value) {
            resetInputAmounts(oppositeInput(newAmountIndex))
            await refreshPool()

            if (pool.value) {
                calcAndSetOpposingInput(
                    fullAmounts[getInputLabel(newAmountIndex)],
                    newAmountIndex,
                    BigInt(pool.value.base_reserves),
                    BigInt(pool.value.quote_reserves),
                    BigInt(pool.value.price)
                )
            }
        }
    },
    {
        immediate: true,
    }
)
</script>
