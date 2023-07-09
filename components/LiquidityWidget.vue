<template>
    <Widget>
        <template #widget-title>Add Liquidity</template>
        <template #right-icon>
            <Dropdown
                :settings-ref="settingsAdd"
                no-padding
            >
                <template #dropdown-activator="{ on }">
                    <Btn
                        transparent
                        tiny
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
                <span class="text-highlight">Tip: </span>
                <p>To try out the interface you'll need some tokens, you can get them</p>
                <span
                    @click="openNewTokenModal"
                    class="activator-link text-highlight"
                    >here</span
                >
            </div>
            <div class="windows">
                <div
                    class="contents"
                    v-for="(i, x) in new Array(2)"
                >
                    <div class="window layer-wdg-box">
                        <div class="window__upper">
                            <label
                                for="amount_1"
                                @click="openTokenSelectModal(x)"
                            >
                                <p v-if="ABTokens[x] !== null">
                                    {{ ABTokens[x]?.symbol }}
                                </p>
                                <p v-else>select token</p>
                                <Icon
                                    name="chevron"
                                    :size="16"
                                />
                            </label>
                            <input
                                id="amount_1"
                                type="text"
                                name="amount_1"
                                placeholder="0"
                                spellcheck="false"
                                autocomplete="off"
                                autocorrect="off"
                                :disabled="waitingForAdding"
                                :value="ABAmounts[x]"
                                @input="setTokenAmount($event, x)"
                            />
                            <!-- :value="ABAmounts[x]" -->
                        </div>
                        <div class="window__lower row flex-end align-center">
                            <!-- <p class="caption">{{ Number(ABBalance[x]) }}</p> -->
                            <p class="caption">1478</p>
                            <Icon
                                name="wallet"
                                :size="13"
                            />
                        </div>
                    </div>
                    <div
                        v-if="x === 0"
                        id="mid-symbol"
                        class="plus grey-text"
                    >
                        <Icon
                            name="plus"
                            :size="16"
                        />
                    </div>
                </div>
            </div>
            <!-- v-if="poolShare" -->
            <div class="tables">
                <div class="table">
                    <p>Pool share</p>
                    <div class="columns row">
                        <div v-for="(token, x) in ABTokens">
                            <!-- <p v-if="x === thisTokenIndex">{{ (thisReserve * poolShare) / 100 }}</p>
                            <p v-else>{{ (thatReserve * poolShare) / 100 }}</p> -->
                            <!-- <p class="caption grey-text">Pooled {{ token.symbol }}</p> -->
                            <p>8845</p>
                            <p class="caption grey-text">Pooled fETH</p>
                        </div>
                        <div>
                            <!-- <p>{{ poolShare }}%</p> -->
                            <p>78%</p>
                            <p class="caption grey-text">Pool share</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="buttons">
                <!-- v-if="stepStore.connectedWallet && (poolAddress === unhandled || poolAddress === '')" -->
                <Btn
                    @click="callAddLiquidity()"
                    is="h4"
                    wide
                    bulky
                    :loading="waitingForAdding"
                    :disabled="!canCreatePool || !bothAmountsIn"
                >
                    Create Pool
                </Btn>
                <!-- @click="addLiquidity()" -->
                <!-- v-if="stepStore.connectedWallet && !(poolAddress === unhandled || poolAddress === '')" -->
                <Btn
                    wide
                    is="h4"
                    bulky
                    @click="callAddLiquidity()"
                    :loading="waitingForAdding"
                    :disabled="!canAddLiquidity || !bothAmountsIn"
                >
                    Add Liquidity
                </Btn>
                <!-- v-if="!stepStore.connectedWallet" -->
                <Btn
                    is="h4"
                    wide
                    bulky
                    @click="stepStore.connectWallet()"
                >
                    Connect wallet
                </Btn>
            </div>
        </template>
    </Widget>
</template>

<script setup>
import { inject } from "vue"

import { BrowserProvider, Contract, parseEther } from "ethers"

import { storeToRefs } from "pinia"
import { useStepStore } from "@/stores/step"

import { getToken, useBalances, usePools } from "~/helpers/index"

import * as Router from "../ABIs/DEX.json"
const RouterABI = Router.default

import * as Factory from "../ABIs/Factory.json"
const FactoryABI = Factory.default

import * as Token from "../ABIs/ERC20.json"
const TokenABI = Token.default

import * as Pool from "../ABIs/Pool.json"
const PoolABI = Pool.default

const unhandled = "0x0000000000000000000000000000000000000000"
const stepStore = useStepStore()

const { pools } = storeToRefs(stepStore)
const {
    approveSpending,
    bidAsk,
    thisTokenAddress,
    poolRatio,
    thisReserve,
    thatReserve,
    poolAddress,
    poolShare,
    findPool,
    setupPool,
    lpTotalSupply,
    liquidityTokenBalance,
    waitingBidAsk,
    bidAskFormat,
    lpTokenAddress,
    bidAskDisplay,
    addLiquidity,
    waitingForAdding,
    resetPool,
    redeemLiquidity,
    setPoolCreationListener,
    setLiquidityChangeListener,
} = usePools(stepStore.routerAddress)

const { getTokenBalance } = useBalances()

const state = reactive({
    tokens: {
        A: null,
        B: null,
    },
    amountA: "",
    amountB: "",
    approvalA: "",
    approvalB: "",
    balanceA: "",
    balanceB: "",
    selectTokenIndex: 0,
    lastChangedToken: 0,
    redeemPercent: 100,
})

// WIDGET ---------------
const canCreatePool = computed(() => {
    return stepStore.connectedWallet && bothTokensThere.value
})
const canAddLiquidity = computed(() => {
    return (
        stepStore.connectedWallet &&
        bothTokensThere.value &&
        !(poolAddress.value === "" || poolAddress.value === unhandled)
    )
})
const bothAmountsIn = computed(() => {
    return ABAmounts.value.every((el) => el !== "")
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
// amounts formated to uint256
const ABAmountsUint = computed(() => {
    return ABAmounts.value.map((el, index) => {
        if (!el || el === ".") {
            return 0
        }
        const regex = /[<>]/
        if (regex.test(el)) {
            return parseEther("0.00001")
        }
        return parseEther(el)
    })
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
async function getBalance(token, both = false) {
    if (stepStore.connectedWallet) {
        if (both) {
            getBalance(state.tokens.A)
            getBalance(state.tokens.B)
            return
        }
        if (!token) {
            return
        }

        const formatedBalance = await getTokenBalance(
            token,
            stepStore.connectedAccount,
            stepStore.connectedWallet.provider
        )
        if (ABTokens.value.indexOf(token) === 0) {
            state.balanceA = formatedBalance
        } else {
            state.balanceB = formatedBalance
        }
    }
}
// BALANCES -------------

//MODAL STUFF----------
const toggleSelectTokenModal = inject("selectTokenModal")
function openTokenSelectModal(index) {
    toggleSelectTokenModal(ABTokens.value, setToken)
    state.selectTokenIndex = index
}

const toggleNewTokenModal = inject("newTokenModal")
function openNewTokenModal() {
    toggleNewTokenModal()
}
//MODAL STUFF----------

//SETTINGS--------------
const settingsAdd = ref()
//SETTINGS--------------

// sets up liquidity chage listners with callback and turn offs
// function setupLiquidityChange(providerArg, poolAdd = false) {
//     if (providerArg === false) {
//         setLiquidityChangeListener(false)
//         return
//     }
//     setLiquidityChangeListener(providerArg, poolAdd).then(
//         ([beneficiary, thisIn, thatIn, thisOut, thatOut, poolContractAddress]) => {
//             if (poolContractAddress === poolAddress.value) {
//                 setupPool(
//                     poolContractAddress,
//                     bothTokenAddresses.value,
//                     stepStore.connectedWallet.provider,
//                     stepStore.connectedAccount
//                 )
//             }
//             setupLiquidityChange(stepStore.connectedWallet.provider, poolContractAddress)
//             getBalance(null, true)
//         }
//     )
// }

//sets up pool created listener with callback and turn offs
// function setupPoolCreated(providerArg) {
//     if (providerArg === false) {
//         setPoolCreationListener(false)
//         return
//     }
//     setPoolCreationListener(providerArg).then(([thisToken, thatToken, newPoolAddress]) => {
//         const incoming = [thisToken, thatToken]
//         const current = bothTokenAddresses.value
//         if (current?.every((el) => incoming.includes(el))) {
//             console.log("setting new pool")
//             poolAddress.value = newPoolAddress
//         }
//         setupPoolCreated(stepStore.connectedWallet.provider)
//         getBalance(null, true)
//     })
// }

//SETS UP POOL OR RESETS BY POOL ADDRESS
watch(
    poolAddress,
    (poolAdd, prevPoolAdd) => {
        if (!(poolAdd === unhandled || poolAdd === "")) {
            setupPool(poolAdd, bothTokenAddresses.value, stepStore.connectedWallet.provider, stepStore.connectedAccount)
        } else {
            //resets previous calulated amount to "0" when pool in no longer there
            if (!(prevPoolAdd === unhandled || prevPoolAdd === "")) {
                ABAmounts.value = ABAmounts.value.map((el, index) => (index !== state.lastChangedToken ? "" : el))
            }
            resetPool()
        }
    },
    {
        immediate: true,
    }
)

const poolAdd = computed(() => {
    if (bothTokensThere.value) {
        return pools.value.find((obj) => {
            const tokens = [obj.this_token.address, obj.that_token.address]
            if (ABTokens.value.every((el) => tokens.includes(el?.address))) {
                return true
            } else {
                return false
            }
        })
    } else {
        return null
    }
})

//GETS BALANCES BY TOKENS AND WALLET
watch(
    () => [ABTokens.value, stepStore.connectedWallet],
    (newValue, oldValue) => {
        const newTokens = newValue.at(0)
        const wallet = newValue.at(1)
        if (wallet) {
            getBalance(null, true)
        } else {
            ABBalance.value = ["", ""]
        }
    },
    {
        immediate: true,
    }
)
// FINDS POOL BY TOKEN ADDRESSES
watch(
    () => bothTokenAddresses.value,
    (bothTokens) => {
        if (bothTokens) {
            // findPool(...bothTokens, stepStore.connectedWallet.provider)
            return
        }
    },
    {
        immediate: true,
    }
)

//maybe only needed in development to find pool on code reload
// onMounted(() => {
//     if (stepStore.connectedWallet && bothTokensThere.value) {
//         findPool(...bothTokenAddresses.value, stepStore.connectedWallet.provider)
//     }
// })
</script>
