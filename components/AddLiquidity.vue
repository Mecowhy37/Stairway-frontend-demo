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
            <div class="tips">
                <FaucetTrigger
                    :closing-callback="() => getBothBalances(false, false)"
                    :connected-chain-id="connectedChainId"
                ></FaucetTrigger>
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
                                    error: insufficientBalanceIndexes.includes(x),
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
                                {{ Balances[x] && roundFloor(formatUnits(Balances[x], Tokens[x].decimals)) }}
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
                v-if="insufficientBalanceIndexes.length > 0 || poolError"
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
                    <p>Pool not found. Be aware you are setting a initial ratio of the pool</p>
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
                        <div>
                            <p>
                                {{
                                    basicRound(
                                        formatUnits(ownedPosition.quote_amount, ownedPosition.pool.quote_token.decimals)
                                    )
                                }}
                            </p>
                            <p class="caption grey-text">Pooled {{ ownedPosition.pool.quote_token.symbol }}</p>
                        </div>
                        <div>
                            <p>
                                {{
                                    basicRound(
                                        formatUnits(ownedPosition.base_amount, ownedPosition.pool.base_token.decimals)
                                    )
                                }}
                            </p>
                            <p class="caption grey-text">Pooled {{ ownedPosition.pool.base_token.symbol }}</p>
                        </div>

                        <!-- <div>
                                <p>78%</p>
                                <p class="caption grey-text">Pool share</p>
                            </div> -->
                    </div>
                </div>
            </div>
            <div
                v-if="ownedPosition"
                class="pooled"
            >
                <div class="pooled__item row align-center">
                    <img
                        class="token-icon token-icon--sm"
                        :src="pool.quote_token.logo_uri"
                    />
                    <p class="pooled__item__symbol grey-text">Pooled {{ ownedPosition.pool.quote_token.symbol }}:</p>
                    <p class="pooled__item__amount">
                        {{
                            ownedPosition
                                ? basicRound(
                                      (Number(
                                          formatUnits(
                                              ownedPosition.quote_amount,
                                              ownedPosition.pool.quote_token.decimals
                                          )
                                      ) *
                                          state.redeemPercent) /
                                          100
                                  )
                                : 0
                        }}
                    </p>
                </div>
                <div class="pooled__item row align-center">
                    <img
                        class="token-icon token-icon--sm"
                        :src="pool.base_token.logo_uri"
                    />
                    <p class="pooled__item__symbol grey-text">Pooled {{ ownedPosition.pool.base_token.symbol }}:</p>
                    <p class="pooled__item__amount">
                        {{
                            ownedPosition
                                ? basicRound(
                                      (Number(
                                          formatUnits(ownedPosition.base_amount, ownedPosition.pool.base_token.decimals)
                                      ) *
                                          state.redeemPercent) /
                                          100
                                  )
                                : 0
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
import { BrowserProvider, Contract, parseUnits, formatEther, formatUnits, parseEther } from "ethers"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"

import {
    useTokens,
    useBalances,
    usePools,
    useAmounts,
    basicRound,
    isSupportedChain,
    widgetTypeObj,
    tkEnum,
    precision,
    roundFloor,
} from "~/helpers/index"

const unhandled = "0x0000000000000000000000000000000000000000"
const stepStore = useStepStore()

const { featuredTokens, positions, connectedAccount, connectedChainId, routerAddress } = storeToRefs(stepStore)
const { refreshPositions } = stepStore

// TOKENS ---------------
const { tokenA, tokenB, Tokens, bothTokensThere, setToken, selectTokenIndex } = useTokens()
// TOKENS ---------------

// BALANCES -------------
const { Balances, getBothBalances, reverseBalances } = useBalances(Tokens, connectedAccount, connectedChainId)
// BALANCES -------------

// ROUTES ----------------
const router = useRouter()
const route = useRoute()
function findTokenByAddress(address) {
    const token = featuredTokens.value.find((el) => el.address === address)
    if (!token) {
        return null
    }
    return token
}
watch(
    featuredTokens,
    (newTokens) => {
        if (newTokens && newTokens.length > 0) {
            // Fetch tokenA and tokenB from route.query and update the values
            if (route.query.tk1) {
                tokenA.value = findTokenByAddress(route.query.tk1)
            }
            if (route.query.tk2) {
                tokenB.value = findTokenByAddress(route.query.tk2)
            }
        }
    },
    {
        immediate: true,
    }
)
// ROUTES ----------------

// POOL -----------------
const { pool, refreshPool, addLiquidity, poolError } = usePools(
    routerAddress,
    Tokens,
    connectedAccount,
    connectedChainId,
    route
)
// POOL -----------------

// WIDGET ---------------
const state = reactive({
    amountQuote: "",
    amountBase: "",
    balanceA: "",
    balanceB: "",
    redeemPercent: 100,
})

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

const addingDisabled = ref(false)
function callAddLiquidity() {
    addingDisabled.value = true
    addLiquidity(
        ...Tokens.value,
        fullAmounts.quote,
        fullAmounts.base,
        settingsAdd.value.slippage,
        settingsAdd.value.deadline,
        stepStore.connectedAccount,
        stepStore.connectedWallet.provider,
        refresh,
        stepStore.notify
    ).then(() => {
        //this bit and listenForTransationMine need some imporvement not to pass callbacks - listenForTranasaction mine should be more error safe
        addingDisabled.value = false
        // state.amountQuote = ""
        // state.amountBase = ""
    })
}

function refresh() {
    console.log("refresh() - add")
    resetAmounts(tkEnum.QUOTE)
    resetAmounts(tkEnum.BASE)
    // refreshPositions()
    getBothBalances(false, false)
    refreshPool()
    setTimeout(() => {
        navigateTo({ path: "/liquidity" })
    }, 1000)
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
        if (!token) {
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
    resetAmounts,
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

        // adding query params to url
        if (featuredTokens.value && featuredTokens.value.length > 0) {
            const obj = {}
            tokens.map((el, index) => (el ? (obj["tk" + (index + 1)] = el.address) : false))
            router.replace({
                query: {
                    ...obj,
                },
            })
        }

        //getting balance
        const oldTokensAddresses = oldTokens?.map((oldTkn) => oldTkn?.address)
        const areNewOldReversered = tokens?.every((tkn) => oldTokensAddresses?.includes(tkn?.address))
        console.log("areNewTokensOldReversered:", areNewOldReversered)

        if (!areNewOldReversered && tokens[selectTokenIndex.value]) {
            getBothBalances(selectTokenIndex.value)
        }

        // setting full amount
        const newTokenIndex = selectTokenIndex.value
        const newAmountIndex = lastChangedAmount.value
        console.log("watch(Tokens) - new token:", getInputLabel(newTokenIndex))
        console.log("watch(Tokens) - new amount:", getInputLabel(newAmountIndex))
        if (newTokenIndex === newAmountIndex && Tokens.value[newTokenIndex]) {
            setFromUserToFullAmount(
                userAmounts[amountsLabelOrder.value[newAmountIndex]],
                Tokens.value[newTokenIndex].decimals,
                newAmountIndex
            )
        }

        // fetching pool
        if (bothTokensThere.value) {
            resetAmounts(oppositeInput(newAmountIndex))
            await refreshPool()
            console.log("watch(Tokens) - pool: ", pool.value?.name)
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
