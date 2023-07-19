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
                <p>
                    <!-- <span class="text-highlight">Tip: </span> -->
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
                                {{ ABTokens[x] !== null ? ABTokens[x]?.symbol : "Select token" }}
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
                                :value="ABAmounts[x]"
                                @input="setTokenAmount($event, x)"
                            />
                            <!-- :value="ABAmounts[x]" -->
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
                v-if="ownedPosition"
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
            </div>
        </template>
    </Widget>
</template>

<script setup>
import { inject } from "vue"
import { BrowserProvider, Contract, parseEther, formatUnits } from "ethers"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"

import { getToken, useBalances, usePools, basicRound } from "~/helpers/index"
import { textSpanIntersection } from "typescript"

const unhandled = "0x0000000000000000000000000000000000000000"
const stepStore = useStepStore()

const { featuredTokens, positions, connectedAccount, chainId } = storeToRefs(stepStore)
const { isSupportedChain } = stepStore
const {
    pool,
    findPool,
    poolRatio,
    approveSpending,
    bidAsk,
    thisTokenAddress,
    poolAddress,
    poolShare,
    lpTotalSupply,
    liquidityTokenBalance,
    bidAskFormat,
    lpTokenAddress,
    bidAskDisplay,
    addLiquidity,
} = usePools(stepStore.routerAddress)

const { getTokenBalance } = useBalances()

const state = reactive({
    tokens: {
        A: null,
        B: null,
    },
    amountA: "",
    amountB: "",
    balanceA: "",
    balanceB: "",
    selectTokenIndex: 0,
    lastChangedToken: 0,
    redeemPercent: 100,
})

// WIDGET ---------------
const bothAmountsIn = computed(() => {
    return ABAmounts.value.every((el) => el !== "")
})
const ownedPosition = computed(() => {
    if (!pool.value || !positions.value) {
        return null
    }
    const matchedPosition = positions.value.find((el) => el.pool.pool_index === pool.value.pool_index)
    if (!matchedPosition) {
        return null
    }
    return matchedPosition
})
function callAddLiquidity() {
    addLiquidity(
        ...bothTokenAddresses.value,
        ...ABAmounts.value,
        settingsAdd.value.slippage,
        settingsAdd.value.deadline,
        stepStore.connectedAccount,
        stepStore.connectedWallet.provider
    ).then(() => {
        state.amountA = ""
        state.amountB = ""
    })
}
// WIDGET ---------------

// TOKENS ---------------
const ABTokens = computed({
    get() {
        return [state.tokens.A, state.tokens.B]
        // return [poolTokens.value.A, poolTokens.value.B]
    },
    set(newValue) {
        // poolTokens.value.A = newValue[0]
        // poolTokens.value.B = newValue[1]

        state.tokens.A = newValue[0]
        state.tokens.B = newValue[1]
    },
})
const bothTokensThere = computed(() => !ABTokens.value.some((el) => el === null))
const bothTokenAddresses = computed(() => (bothTokensThere.value ? ABTokens.value.map((el) => el.address) : null))

const thisTokenIndex = computed(() => {
    if (bothTokensThere.value && !(poolAddress.value === "" || poolAddress.value === unhandled)) {
        return ABTokens.value.indexOf(ABTokens.value.find((el) => el.address == thisTokenAddress.value))
    } else {
        return null
    }
})
async function setToken(token) {
    if (token) {
        const sameTokenIndex = ABTokens.value.findIndex((el) => el?.address === token.address)
        if (sameTokenIndex !== -1 && sameTokenIndex !== state.selectTokenIndex) {
            ABTokens.value = ABTokens.value.reverse()
            return
        }
    }
    ABTokens.value = ABTokens.value.map((el, index) => (index === state.selectTokenIndex ? token : el))
}
// TOKENS ---------------

// AMOUNTS --------------
const ABAmounts = computed({
    get() {
        // Round function trimms down unncessary digits and adds < mark when unsignificant
        function Round(amt) {
            let amount = Number(amt)
            if (amount === 0) {
                return ""
            }
            amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
            return Number(amount) < 0.00001 ? "<0.00001" : String(parseFloat(amount))
        }
        if (poolRatio.value && bothTokensThere.value) {
            // this if() cleans up other input when prior is set to 0
            if (
                (state.lastChangedToken === 0 && String(state.amountA).length === 0) ||
                (state.lastChangedToken === 1 && String(state.amountB).length === 0)
            ) {
                return ["", ""]
            }
            if (state.lastChangedToken === 0) {
                if (state.amountA.length !== 0) {
                    if (thisTokenIndex.value === 0) {
                        state.amountB = Round(calcThat(state.amountA))
                    } else {
                        state.amountB = Round(calcThis(state.amountA))
                    }
                }
            } else {
                if (state.amountB.length !== 0) {
                    if (thisTokenIndex.value === 0) {
                        state.amountA = Round(calcThis(state.amountB))
                    } else {
                        state.amountA = Round(calcThat(state.amountB))
                    }
                }
            }
        }

        return [state.amountA, state.amountB]
    },
    set(newValue) {
        state.amountA = newValue[0]
        state.amountB = newValue[1]
    },
})
function setTokenAmount(event, inputIndex) {
    state.lastChangedToken = inputIndex
    ABAmounts.value = ABAmounts.value.map((el, i) => (inputIndex === i ? event.target.value : el))
}

function calcThat(value) {
    value = Number(value)
    if (Number.isNaN(value)) {
        return ""
    }
    return value * poolRatio.value + ""
}
function calcThis(value) {
    value = Number(value)
    if (Number.isNaN(value)) {
        return ""
    }
    return value * (1 / poolRatio.value) + ""
}
function cleanInput(value, oldValue) {
    value = value.replace(/[^\d.,]/g, "").replace(/,/g, ".")

    let dotCount = value.split(".").length - 1
    if (dotCount === 2) {
        value = oldValue
    }
    return value
}
// CLEANS IMPUTED AMOUNT
watch(
    ABAmounts,
    (newVal, oldVal) => {
        const [newA, newB] = [...newVal]
        const [oldA, oldB] = oldVal ? [...oldVal] : [null, null]
        if (state.lastChangedToken === 0) {
            state.amountA = cleanInput(newA, oldA)
        } else if (state.lastChangedToken === 1) {
            state.amountB = cleanInput(newB, oldB)
        }
    },
    {
        immediate: true,
    }
)
// AMOUNTS --------------

// BALANCES -------------
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
    toggleSelectTokenModal(ABTokens.value, setToken)
    state.selectTokenIndex = index
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
if (route.query.tk1) {
    state.tokens.A = findTokenByAddress(route.query.tk1)
}
if (route.query.tk2) {
    state.tokens.B = findTokenByAddress(route.query.tk2)
}
// ROUTES ----------------
let intervalId = null
watch(
    ABTokens,
    async (tokens) => {
        // adding query params to url
        const obj = {}
        tokens.map((el, index) => (el ? (obj["tk" + (index + 1)] = el.address) : false))
        router.replace({
            query: {
                ...obj,
            },
        })

        // finding a pool
        const bothThere = tokens.every((el) => el !== null)
        if (bothThere && isSupportedChain(chainId.value)) {
            // Stop the existing interval if it's running
            clearInterval(intervalId)
            pool.value = null
            // Call findPool immediately
            await findPool(tokens, chainId.value)

            // Start the loop to call findPool every second
            // intervalId = setInterval(async () => {
            //     console.log("looping...", tokens[0].symbol, " / ", tokens[1].symbol)
            //     await findPool(tokens, chainId.value)
            // }, 5000)
        } else {
            // Stop the loop if any of the values is missing
            clearInterval(intervalId)
            intervalId = null
            pool.value = null
        }

        //getting balance
        if (stepStore.connectedAccount) {
            if (state.selectTokenIndex === 0) {
                state.balanceA = await getTokenBalance(tokens[0], stepStore.connectedAccount, 80001)
            } else {
                state.balanceB = await getTokenBalance(tokens[1], stepStore.connectedAccount, 80001)
            }
        }
    },
    {
        immediate: true,
    }
)

async function getBothBalances() {
    if (isSupportedChain(chainId.value)) {
        state.balanceB = await getTokenBalance(ABTokens.value[1], stepStore.connectedAccount, chainId.value)
        state.balanceA = await getTokenBalance(ABTokens.value[0], stepStore.connectedAccount, chainId.value)
    }
}
//GETS BALANCES BY TOKENS AND WALLET
watch(
    () => [connectedAccount.value, chainId.value],
    async (newVal) => {
        const [wallet, chain] = newVal
        if (wallet && isSupportedChain(chain)) {
            state.balanceB = await getTokenBalance(ABTokens.value[1], stepStore.connectedAccount, chain)
            state.balanceA = await getTokenBalance(ABTokens.value[0], stepStore.connectedAccount, chain)
        } else {
            ABBalance.value = ["", ""]
        }
    },
    {
        immediate: true,
    }
)
</script>
