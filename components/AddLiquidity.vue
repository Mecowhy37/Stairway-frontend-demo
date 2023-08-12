<template>
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
                class="tips"
                v-if="connectedChainId !== 137"
            >
                <p>
                    <span class="text-highlight">Tip: </span>
                    Get tokens for test
                    <span
                        @click="openNewTokenModal"
                        class="activator-link text-highlight"
                        >here</span
                    >
                </p>
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
                                type="text"
                                placeholder="0"
                                spellcheck="false"
                                autocomplete="off"
                                autocorrect="off"
                                :value="getInputValue(x)"
                                @input="setTokenAmount($event, x)"
                            />
                            <!-- :value="state.lastChangedToken === x ? Amounts[x] : Round(Amounts[x])" -->
                        </div>
                        <div class="window__lower row flex-end align-center">
                            <p class="caption">{{ Number(ABBalance[x]) }}</p>
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
                                        formatUnits(ownedPosition.base_amount, ownedPosition.pool.base_token.decimals)
                                    )
                                }}
                            </p>
                            <p class="caption grey-text">Pooled {{ ownedPosition.pool.base_token.symbol }}</p>
                        </div>
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
                        :src="pool.base_token.logo_uri"
                    />
                    <p class="pooled__item__symbol grey-text">Pooled {{ pool.base_token.symbol }}:</p>
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
                <div class="pooled__item row align-center">
                    <img
                        class="token-icon token-icon--sm"
                        :src="pool.quote_token.logo_uri"
                    />
                    <p class="pooled__item__symbol grey-text">Pooled {{ pool.quote_token.symbol }}:</p>
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
                    :disabled="!bothAmountsIn || !bothTokensThere"
                >
                    Add liquidity
                </Btn>
                <Btn
                    @click="getBothBalances()"
                    is="h4"
                    wide
                    bulky
                    :disabled="!connectedAccount"
                >
                    refresh balances
                </Btn>
            </div>
        </template>
    </Widget>
</template>

<script setup>
import { inject } from "vue"
import { BrowserProvider, Contract, parseUnits, formatEther, formatUnits } from "ethers"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"

import {
    useTokens,
    useBalances,
    usePools,
    useInputs,
    basicRound,
    isSupportedChain,
    tkEnum,
    precision,
} from "~/helpers/index"

const unhandled = "0x0000000000000000000000000000000000000000"
const stepStore = useStepStore()

const { featuredTokens, positions, connectedAccount, connectedChainId, routerAddress } = storeToRefs(stepStore)

const state = reactive({
    amountQuote: "",
    amountBase: "",
    balanceA: "",
    balanceB: "",
    lastChangedToken: 0,
    redeemPercent: 100,
})

// TOKENS ---------------
const { tokenA, tokenB, Tokens, bothTokensThere, setToken, selectTokenIndex } = useTokens()
// TOKENS ---------------

// POOL -----------------
const { pool, poolRatio, addLiquidity } = usePools(routerAddress, Tokens, connectedAccount, connectedChainId)
// POOL -----------------

// INPUTS -----------------
const { cleanInput, isCleanInput, prettyPrint } = useInputs(Tokens)
// INPUTS -----------------

// WIDGET ---------------
const bothAmountsIn = computed(() => {
    return Amounts.value.every((el) => el !== "")
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
function callAddLiquidity() {
    addLiquidity(
        ...Tokens.value,
        ...Amounts.value,
        settingsAdd.value.slippage,
        settingsAdd.value.deadline,
        stepStore.connectedAccount,
        stepStore.connectedWallet.provider,
        stepStore.addresses.PoolManager
    ).then(() => {
        // state.amountQuote = ""
        // state.amountBase = ""
    })
}
// WIDGET ---------------

// AMOUNTS --------------
// Round function trimms down unncessary digits and adds < mark when unsignificant
function Round(amt) {
    let amount = Number(amt)
    if (amount === 0) {
        return ""
    }
    amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
    return Number(amount) < 0.00001 ? "<0.00001" : String(parseFloat(amount))
}
const Amounts = computed({
    get() {
        const tokenAmounts = [state.amountQuote, state.amountBase]
        if (pool.value) {
            if (tokenAmounts[state.lastChangedToken] === "") {
                tokenAmounts[Number(!Boolean(state.lastChangedToken))] = ""
                return tokenAmounts
            }
            console.log("POOL")
            console.log(pool);
            if (state.lastChangedToken === tkEnum.QUOTE && isCleanInput(tokenAmounts[tkEnum.QUOTE])) {
                tokenAmounts[tkEnum.BASE] = calcBase(
                    tokenAmounts[tkEnum.QUOTE],
                    pool.value.base_token.decimals,
                    pool.value.quote_token.decimals,
                    pool.value.base_reserves,
                    pool.value.quote_reserves
                )
            } else if ((state.lastChangedToken === tkEnum.BASE) & isCleanInput(tokenAmounts[tkEnum.BASE])) {
                tokenAmounts[tkEnum.QUOTE] = calcQuote(
                    tokenAmounts[tkEnum.BASE],
                    pool.value.base_token.decimals,
                    pool.value.quote_token.decimals,
                    pool.value.base_reserves,
                    pool.value.quote_reserves
                )
            }
        }
        console.log("HERE'S THE STATE");
        console.log(tokenAmounts);
        return tokenAmounts
    },
    set(newValue) {
        state.amountQuote = newValue[tkEnum.QUOTE]
        state.amountBase = newValue[tkEnum.BASE]
    },
})
function getInputValue(tkIndex) {
    return Amounts.value[tkIndex];
    if (!poolRatio.value) {
        return Amounts.value[tkIndex]
    }
    return state.lastChangedToken === tkIndex ? Amounts.value[tkIndex] : prettyPrint(Amounts.value[tkIndex], tkIndex)
    // return state.lastChangedToken === tkIndex ? Amounts.value[tkIndex] : prettyPrint(Amounts.value[tkIndex], tkIndex)
}
function setTokenAmount(event, tokenIndex) {
    state.lastChangedToken = tokenIndex
    const newVal = event.target.value
    Amounts.value = Amounts.value.map((el, i) => (tokenIndex === i ? newVal : el))
}

function calcBase(_quote, _baseDecimals, _quoteDecimals, _baseBalance, _quoteBalance) {
    console.log("Hello from calcBase");
    console.log(_quote, _baseDecimals, _quoteDecimals, _baseBalance, _quoteBalance);
    var parsed = BigInt(parseUnits(_quote, _quoteDecimals));
    var res = parsed*BigInt(_quoteBalance)/BigInt(_baseBalance);
    console.log("RESULT: "+res)
    //return res;
    return formatEther(res.toString(), 18);
}
function calcQuote(_base, _baseDecimals, _quoteDecimals, _baseBalance, _quoteBalance) {
    console.log("Hello from calcQuote");
    console.log(_base, _baseDecimals, _quoteDecimals, _baseBalance, _quoteBalance);
    var parsed = BigInt(parseUnits(_base, _baseDecimals));
    var res = parsed*BigInt(_baseBalance)/BigInt(_quoteBalance);
    console.log("RESULT: "+res)
    //return res;
    return formatEther(res.toString(), 18);
}
function goo(aInputed, aDecimals, balanceA, balanceB) {
    console.log("Hello from calcB");
    console.log(aInputed, aDecimals, balanceA, balanceB);
    console.log("-------------------------");
    const aParsed = BigInt(parseUnits(aInputed, aDecimals))
    return (aParsed * BigInt(balanceA)) / BigInt(balanceB) * BigInt(aDecimals);
}
// const parsedLastInputed = computed(() => {
//     if (
//         !Tokens.value[state.lastChangedToken] ||
//         !Amounts.value[state.lastChangedToken] ||
//         !isCleanInput(Amounts.value[state.lastChangedToken])
//     ) {
//         return null
//     }
//     return parseUnits(Amounts.value[state.lastChangedToken], Tokens.value[state.lastChangedToken].decimals).toString()
// })
// CLEANS IMPUTED AMOUNT
watch(
    Amounts,
    (newVal, oldVal) => {
        const [newA, newB] = [...newVal]
        const [oldA, oldB] = oldVal ? [...oldVal] : [null, null]
        if (state.lastChangedToken === 0) {
            state.amountQuote = cleanInput(newA, oldA)
        } else if (state.lastChangedToken === 1) {
            state.amountBase = cleanInput(newB, oldB)
        }
    },
    {
        immediate: true,
    }
)
// AMOUNTS --------------

// BALANCES -------------
const { getTokenBalance } = useBalances()

const ABBalance = computed({
    get() {
        return [state.balanceA, state.balanceB]
    },
    set(newVal) {
        state.balanceA = newVal[0]
        state.balanceB = newVal[1]
    },
})
// BALANCES -------------

//MODAL STUFF----------
const toggleSelectTokenModal = inject("selectTokenModal")
function openTokenSelectModal(index) {
    toggleSelectTokenModal(Tokens.value, setToken)
    selectTokenIndex.value = index
}
const { toggleNewTokenModal, isNewTokenModalOpen } = inject("newTokenModal")
function openNewTokenModal() {
    toggleNewTokenModal()
}
watch(isNewTokenModalOpen, (newVal) => {
    if (!newVal) {
        getBothBalances()
    }
})
//MODAL STUFF----------

//SETTINGS--------------
const settingsAdd = ref()
//SETTINGS--------------

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

let intervalId = null
watch(
    Tokens,
    async (tokens) => {
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
        if (connectedAccount.value && isSupportedChain(connectedChainId.value)) {
            if (selectTokenIndex.value === 0) {
                state.balanceA = await getTokenBalance(tokens[0], connectedAccount.value, connectedChainId.value)
            } else {
                state.balanceB = await getTokenBalance(tokens[1], connectedAccount.value, connectedChainId.value)
            }
        }
    },
    {
        immediate: true,
    }
)

async function getBothBalances() {
    if (connectedAccount.value && isSupportedChain(connectedChainId.value)) {
        state.balanceA = await getTokenBalance(Tokens.value[0], connectedAccount.value, connectedChainId.value)
        state.balanceB = await getTokenBalance(Tokens.value[1], connectedAccount.value, connectedChainId.value)
    }
}
//GETS BALANCES BY TOKENS AND WALLET
watch(
    () => [connectedAccount.value, connectedChainId.value],
    async (newVal) => {
        const [wallet, chain] = newVal
        if (wallet && isSupportedChain(chain)) {
            state.balanceA = await getTokenBalance(Tokens.value[0], wallet, chain)
            state.balanceB = await getTokenBalance(Tokens.value[1], wallet, chain)
        } else {
            ABBalance.value = ["", ""]
        }
    },
    {
        immediate: true,
    }
)
</script>
