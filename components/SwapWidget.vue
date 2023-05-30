<template>
    <div class="wrap">
        <div class="widget base-wdg-box">
            <div class="top-bar row">
                <h3>Trade</h3>
                <Dropdown>
                    <template #dropdown-activator="{ on }">
                        <Btn
                            transparent
                            tiny
                            icon-contrast
                        >
                            <template #icon>
                                <mdicon
                                    name="cog"
                                    size="30"
                                />
                            </template>
                        </Btn>
                    </template>
                    <template #dropdown>
                        <Settings
                            ref="settings"
                            :default-slippage="0.5"
                            :default-deadline="30"
                        ></Settings>
                    </template>
                </Dropdown>
            </div>
            <div class="tips">
                <p>
                    <span class="text-highlight">Tip:</span> pool with these tokens doesnt exist yet,
                    <span class="text-highlight">create it.</span>
                </p>
            </div>
            <div
                class="contents"
                v-for="(i, x) in new Array(2)"
            >
                <div class="window layer-wdg-box">
                    <div class="window__upper">
                        <label
                            for="amount_1"
                            @click="!waitingForAdding && openTokenSelectModal(x)"
                        >
                            <p v-if="switchedTokens[x] !== null">
                                {{ switchedTokens[x]?.symbol }}
                            </p>
                            <p v-else>select token</p>
                            <mdicon
                                class="icon"
                                name="chevron-down"
                            />
                            <!-- <p v-if="balances[x] !== null">balance: {{ balances[x] }}</p> -->
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
                            :value="switchedAmounts[x]"
                            @input="setTokenAmount($event, x)"
                        />
                    </div>
                    <div class="window__lower">
                        <p class="caption">Balance: {{ Number(switchedBalances[x]) }}</p>
                    </div>
                </div>
                <div
                    v-if="x === 0"
                    id="mid-symbol"
                    class="button"
                    :class="{ rotate: Boolean(state.order) }"
                >
                    <Btn
                        circle
                        plain
                        @click="switchOrder()"
                    >
                        <template #icon>
                            <mdicon
                                class="icon"
                                name="arrow-down"
                            />
                        </template>
                    </Btn>
                </div>
            </div>
            <div class="buttons">
                <Btn
                    v-if="
                        switchedAllowances[0] < switchedAmountsUint[0] &&
                        stepStore.bothSwapTokensThere &&
                        stepStore.connectedWallet &&
                        !(poolAddress === unhandled || poolAddress === '')
                    "
                    @click="callApproveSpending(switchedTokens[0].address, switchedAmountsUint[0])"
                    is="h4"
                    wide
                    secondary
                    bulky
                >
                    Approve {{ switchedTokens[0].symbol }}
                </Btn>
                <Btn
                    v-if="stepStore.connectedWallet"
                    :disabled="poolAddress === unhandled || poolAddress === ''"
                    is="h4"
                    wide
                    bulky
                >
                    Swap
                </Btn>

                <Btn
                    v-if="!stepStore.connectedWallet"
                    is="h4"
                    wide
                    bulky
                    @click="stepStore.connectWallet()"
                >
                    Connect wallet
                </Btn>
            </div>
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from "pinia"
import { useStepStore } from "@/stores/step"
import { BrowserProvider, Contract, formatUnits, parseEther } from "ethers"

import { useBalances, usePools } from "~/helpers/index"

import * as Token from "../ABIs/ERC20.json"
const TokenABI = Token.default

import * as Router from "../ABIs/DEX.json"
const RouterABI = Router.default

import * as Pool from "../ABIs/Pool.json"
const PoolABI = Pool.default

import * as Factory from "../ABIs/Factory.json"
const FactoryABI = Factory.default

const unhandled = "0x0000000000000000000000000000000000000000"

const stepStore = useStepStore()

const { swapTokens } = storeToRefs(stepStore)
const {
    approveSpending,
    bidAsk,
    baseTokenAddress,
    poolRatio,
    thisReserve,
    thatReserve,
    poolAddress,
    poolShare,
    findPool,
    getBidAsk,
    setupPool,
    checkAllowance,
    lpTotalSupply,
    liquidityTokenBalance,
    waitingBidAsk,
    bidAskFormat,
    bidAskDisplay,
    bidAskDisplayReverse,
    addLiquidity,
    waitingForAdding,
    resetPool,
    redeemLiquidity,
    setPoolCreationListener,
    setLiquidityChangeListener,
} = usePools(stepStore.routerAddress)

const { getTokenBalance } = useBalances()

const state = reactive({
    amountA: "",
    amountB: "",
    order: 0,
    lastChangedToken: 0,
    approvalA: "",
    approvalB: "",
    balanceA: "",
    balanceB: "",
    selectTokenIndex: 0,
    showRate: false,
    noSlippage: false,
    alreadyMounted: false,
})

// TOKENS ------------------
function setToken(token) {
    const sameTokenIndex = switchedTokens.value.findIndex((el) => el?.address === token.address)
    if (sameTokenIndex !== -1 && sameTokenIndex !== state.selectTokenIndex) {
        switchedTokens.value = switchedTokens.value.reverse()
        return
    }
    switchedTokens.value = switchedTokens.value.map((el, index) => (index === state.selectTokenIndex ? token : el))
}
const ABTokens = computed(() => {
    // return [swapTokens.value[0], swapTokens.value[1]]
    return [swapTokens.value.A, swapTokens.value.B]
    // return [state.TokenA, state.TokenB]
})
const switchedTokens = computed({
    get() {
        const list = [swapTokens.value.A, swapTokens.value.B]
        return !Boolean(state.order) ? list : list.reverse()
    },
    set(newValue) {
        if (state.order === 0) {
            swapTokens.value.A = newValue[0]
            swapTokens.value.B = newValue[1]
        } else {
            // state.order = 0
            swapTokens.value.A = newValue[1]
            swapTokens.value.B = newValue[0]
        }
    },
})
const baseTokenIndex = computed(() => {
    return switchedTokens.value.indexOf(
        switchedTokens.value.find((el) => (el?.address === baseTokenAddress.value ? el : null))
    )
})
function switchOrder() {
    state.order = state.order === 0 ? 1 : 0
}
// TOKENS ------------------

// AMOUNTS -----------------
function setTokenAmount(event, inputIndex) {
    state.lastChangedToken = state.order === 0 ? inputIndex : Number(!Boolean(inputIndex))
    switchedAmounts.value = switchedAmounts.value.map((el, i) => (inputIndex === i ? event.target.value : el))
}

const switchedAmounts = computed({
    get() {
        let list = [state.amountA, state.amountB]
        function Round(amt) {
            let amount = Number(amt)
            amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
            if (amount == 0) {
                return ""
            }
            return Number(amount) < 0.00001 ? "<0.00001" : String(parseFloat(amount))
        }
        if (bidAsk.value) {
            if (list[state.lastChangedToken] === "") {
                list[Number(!Boolean(state.lastChangedToken))] = ""
                return list
            }
            if (state.lastChangedToken === 0) {
                list[1] = Round(calcQuote(list[0]))
            } else if (state.lastChangedToken === 1) {
                list[0] = Round(calcBase(list[1]))
            }
        }
        return state.order === 0 ? list : list.reverse()
    },
    set(newVal) {
        if (state.order === 0) {
            state.amountA = newVal[0]
            state.amountB = newVal[1]
        } else {
            state.amountA = newVal[1]
            state.amountB = newVal[0]
        }
    },
})
const switchedAmountsUint = computed(() => {
    return switchedAmounts.value.map((el) => {
        if (!el) {
            return 0
        }
        const regex = /[<>]/
        if (regex.test(el)) {
            return parseEther("0.00001")
        }
        return parseEther(el)
    })
})
function calcQuote(value) {
    if (state.order === 0) {
        return String(Number(value) * bidAskFormat.value[0])
    } else {
        return String(Number(value) * bidAskFormat.value[1])
    }
}
function calcBase(value) {
    if (state.order === 0) {
        return String(Number(value) / bidAskFormat.value[0])
    } else {
        return String(Number(value) / bidAskFormat.value[1])
    }
}
function cleanInput(value, oldValue) {
    value = value.replace(/[^\d.,]/g, "").replace(/,/g, ".")
    let dotCount = value.split(".").length - 1
    if (dotCount === 2) {
        value = oldValue
    }
    return value
}
//this wacher is responsible for cleaning up inputs from unwanted  charactera only where the input takes place
watch(
    () => [state.amountA, state.amountB],
    (newVal, oldVal) => {
        if (bidAsk.value) {
            const [newA, newB] = [...newVal]
            const [oldA, oldB] = oldVal ? [...oldVal] : [null, null]
            if (newA !== oldA) {
                state.amountA = cleanInput(newA, oldA)
            } else if (newB !== oldB) {
                state.amountB = cleanInput(newB, oldB)
            }
        }
    },
    {
        immediate: true,
    }
)

// AMOUNTS -----------------

// BALANCES ----------------
async function getBalance(token, both = false) {
    if (stepStore.connectedWallet) {
        if (both) {
            getBalance(swapTokens.value.A)
            getBalance(swapTokens.value.B)
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
const switchedBalances = computed(() => {
    const list = [state.balanceA, state.balanceB]
    return state.order === 0 ? list : list.reverse()
})
// BALANCES ----------------

// ALLOWANCES --------------
function callApproveSpending(address, amount) {
    if (stepStore.connectedWallet) {
        approveSpending(address, stepStore.connectedWallet.provider, amount, getAllowances)
    }
}
async function getAllowances() {
    if (stepStore.connectedWallet) {
        switchedTokens.value.forEach(async (el1, index1) => {
            const allowance = el1 !== null ? await getApprovedAmount(el1.address) : 0
            switchedAllowances.value = switchedAllowances.value.map((el2, index2) =>
                index2 === index1 ? allowance : el2
            )
        })
    }
}
async function getApprovedAmount(address) {
    try {
        return await checkAllowance(
            address,
            stepStore.connectedAccount,
            stepStore.routerAddress,
            stepStore.connectedWallet.provider
        )
    } catch (err) {
        console.log("failed to get appoved amounts", err)
    }
}
const switchedAllowances = computed({
    get() {
        const list = [state.approvalA, state.approvalB]
        return state.order === 0 ? list : list.reverse()
    },
    set(newVal) {
        if (state.order === 0) {
            state.approvalA = newVal[0]
            state.approvalB = newVal[1]
        } else {
            state.approvalA = newVal[1]
            state.approvalB = newVal[0]
        }
    },
})
// ALLOWANCES --------------

// sets up liquidity chage listners with callback and turn offs
function setupLiquidityChange(providerArg, poolAdd = false) {
    if (providerArg === false) {
        setLiquidityChangeListener(false)
        return
    }
    setLiquidityChangeListener(providerArg, poolAdd).then(
        ([beneficiary, thisIn, thatIn, thisOut, thatOut, poolContractAddress]) => {
            if (poolContractAddress === poolAddress.value) {
                setupPool(
                    poolContractAddress,
                    stepStore.bothSwapTokenAddresses,
                    stepStore.connectedWallet.provider,
                    stepStore.connectedAccount
                )
            }
            setupLiquidityChange(stepStore.connectedWallet.provider, poolContractAddress)
            getBalance(null, true)
        }
    )
}

//sets up pool created listener with callback and turn offs
function setupPoolCreated(providerArg) {
    if (providerArg === false) {
        setPoolCreationListener(false)
        return
    }
    setPoolCreationListener(providerArg).then(([thisToken, thatToken, newPoolAddress]) => {
        const incoming = [thisToken, thatToken]
        const current = stepStore.bothSwapTokenAddresses
        if (current?.every((el) => incoming.includes(el))) {
            console.log("setting new pool")
            poolAddress.value = newPoolAddress
        }
        setupPoolCreated(stepStore.connectedWallet.provider)
        getBalance(null, true)
    })
}

watch(
    () => [ABTokens.value, stepStore.connectedWallet],
    (newValue) => {
        const wallet = newValue[1]
        if (wallet) {
            getAllowances()
            getBalance(null, true)
        } else {
            switchedAllowances.value = ["", ""]
            switchedBalances.value = ["", ""]
        }
    },
    {
        immediate: true,
    }
)

watch(
    () => [stepStore.bothSwapTokenAddresses, stepStore.connectedWallet],
    (newVal, oldVal) => {
        const [bothTokens, wallet] = [...newVal]
        const [prevBothTokens, prevWallet] = oldVal ? [oldVal[0], oldVal[1]] : [null, null]
        if (bothTokens && wallet) {
            if (
                (prevBothTokens !== bothTokens && prevWallet === wallet) ||
                (prevBothTokens === bothTokens && prevWallet !== wallet)
            ) {
                const areSame = bothTokens.map((el, index) => el === prevBothTokens[Number(!Boolean(index))])
                const differentOrder = areSame.every((el) => el === true)
                if (differentOrder && !(poolAddress.value === "" || poolAddress.value === unhandled)) {
                    getBidAsk(stepStore.bothSwapTokenAddresses, stepStore.connectedWallet.provider)
                } else {
                    findPool(...stepStore.bothSwapTokenAddresses, stepStore.connectedWallet.provider)
                }
            }
            return
        }
        if ((!bothTokens && prevBothTokens && wallet) || (!wallet && prevWallet && bothTokens)) {
            poolAddress.value = ""
        }
    },
    {
        immediate: true,
    }
)
watch(
    poolAddress,
    (poolAdd, prevPoolAdd) => {
        getAllowances()

        if (!(poolAdd === unhandled || poolAdd === "")) {
            setupPool(
                poolAdd,
                stepStore.bothSwapTokenAddresses,
                stepStore.connectedWallet.provider,
                stepStore.connectedAccount
            )
            setupLiquidityChange(stepStore.connectedWallet.provider)
        } else {
            //resets previous calulated amount to "0" when pool in no longer there
            switchedAmounts.value = switchedAmounts.value.map((el, index) =>
                index !== state.lastChangedToken ? "" : el
            )
            resetPool()
        }
    },
    {
        immediate: true,
    }
)

watch(
    () => stepStore.connectedAccount,
    (wallet, prevWallet) => {
        if (wallet !== prevWallet && wallet) {
            setupPoolCreated(stepStore.connectedWallet.provider)
            if (!(poolAddress.value === unhandled || poolAddress.value === "")) {
                setupPool(
                    poolAddress.value,
                    stepStore.bothSwapTokenAddresses,
                    stepStore.connectedWallet.provider,
                    stepStore.connectedAccount
                )
            }
            return
        }
        if (!wallet) {
            setPoolCreationListener(false)
            setLiquidityChangeListener(false)
        }
    },
    {
        immediate: true,
    }
)

// MODAL -------------
const toggleTokenModal = inject("modal")
function openTokenSelectModal(index) {
    toggleTokenModal(ABTokens.value, setToken)
    state.selectTokenIndex = index
}
// MODAL -------------

// const rate = computed(() => {
//     if (state.showRate) {
//         let rate = tokenToSell.value === token0.value ? bidAsk.value[0] : 1 / Number(bidAsk.value[1])
//         rate = Number(rate) > 1 ? Number(rate).toFixed(2) : Number(rate).toPrecision(2)
//         return `1 ${switchedTokens.value[0].symbol} = ${rate} ${switchedTokens.value[1].symbol}`
//     } else {
//         return ""
//     }
// })

//maybe only needed in development to find pool on code reload
onMounted(() => {
    state.alreadyMounted = true
    if (stepStore.connectedWallet && stepStore.bothSwapTokensThere) {
        findPool(...stepStore.bothSwapTokenAddresses, stepStore.connectedWallet.provider)
    }
})

onUnmounted(() => {
    setPoolCreationListener(false)
    setLiquidityChangeListener(false)
})
</script>
