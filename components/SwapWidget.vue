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
                            <h4 v-if="switchedTokens[x] !== null">
                                {{ switchedTokens[x]?.symbol }}
                            </h4>
                            <h4 v-else>select token</h4>
                            <mdicon
                                class="icon"
                                name="chevron-down"
                            />
                            <!-- <p v-if="balances[x] !== null">balance: {{ balances[x] }}</p> -->
                        </label>
                        <input
                            id="amount_1"
                            type="number"
                            name="amount_1"
                            placeholder="0"
                            inputmode="decimal"
                            pattern="^[0-9]*[.,]?[0-9]*$"
                            spellcheck="false"
                            autocomplete="off"
                            autocorrect="off"
                            minlength="1"
                            :disabled="waitingForAdding"
                            :value="ABAmounts[x]"
                            @input="setTokenAmount($event, x)"
                        />
                    </div>
                    <div class="window__lower">
                        <p class="caption">Balance: fsd</p>
                    </div>
                </div>
                <div
                    v-if="x === 0"
                    id="add-symbol"
                >
                    <h2 @click="switchOrder()">+</h2>
                </div>
            </div>
            <div class="buttons">
                <Btn
                    v-if="
                        ABAllowance[0] < ABAmountsUint[0] && stepStore.bothSwapTokensThere && stepStore.connectedWallet
                    "
                    @click="callApproveSpending(switchedTokens[0].address, ABAmountsUint[0])"
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
                    <!-- :disabled="!canCreatePool || !bothAmountsIn" -->
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
import { useTempStore } from "@/stores/temp"
import { BrowserProvider, Contract, formatUnits, parseEther } from "ethers"

import { getToken, useBalances, usePools } from "~/helpers/index"

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
const tempStore = useTempStore()

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

async function mystery() {
    const provider = new BrowserProvider(stepStore.connectedWallet.provider)
    const pool = new Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", PoolABI, provider)
    const thisToken = await pool.thisToken()
    console.log("broadcast pool address", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
    console.log("pool.thisToken:", thisToken)
    const thatToken = await pool.thatToken()
    console.log("pool.thatToken:", thatToken)
    console.log("_____________________________")

    // const router = new Contract(stepStore.routerAddress, RouterABI, provider)
    // const factoryAdd = await router.factory()
    // console.log("factoryAdd:", factoryAdd)
    // const factory = new Contract(factoryAdd, FactoryABI, provider)

    // const poolFromF = await factory.getPool(thisToken, thatToken)
    // console.log("factory.getPool(this, that) = ", poolFromF)
}
const state = reactive({
    amountA: "",
    amountB: "",
    approvalA: "",
    approvalB: "",
    balanceA: null,
    balanceB: null,
    token0Index: null,
    tokenToSellIndex: 0,
    lastChangedToken: 0,
    selectTokenIndex: 0,
    showRate: false,
    noSlippage: false,
    alreadyMounted: false,
})

const ABTokens = computed(() => {
    // return [swapTokens.value[0], swapTokens.value[1]]
    return [swapTokens.value.A, swapTokens.value.B]
    // return [state.TokenA, state.TokenB]
})
const ABAllowance = computed({
    get() {
        return [state.approvalA, state.approvalB]
    },
    set(newValue) {
        state.approvalA = newValue[0]
        state.approvalB = newValue[1]
    },
})
const ABAmountsUint = computed(() => {
    return ABAmounts.value.map((el) => (el !== "" ? parseEther(el) : 0))
})
const ABAmounts = computed({
    get() {
        function Round(amt) {
            let amount = Number(amt)
            amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
            return amount === "NaN" || Number(amount) === 0 ? "" : String(parseFloat(amount))
            // const middle = amount === "NaN" || Number(amount) === 0 ? "" : String(parseFloat(amount))
            // return Number(middle) < 0.00001 ? "<0.00001" : middle
        }
        if (bidAsk.value) {
            if (
                (state.lastChangedToken === 0 && String(state.amountA).length === 0) ||
                (state.lastChangedToken === 1 && String(state.amountB).length === 0)
            ) {
                return ["", ""]
            }
            if (state.lastChangedToken === 0) {
                state.amountB = Round(
                    Boolean(baseTokenIndex.value)
                        ? state.amountA * (1 / poolRatio.value)
                        : state.amountA * poolRatio.value
                )
            } else {
                state.amountA = Round(
                    Boolean(baseTokenIndex.value)
                        ? state.amountB * poolRatio.value
                        : state.amountB * (1 / poolRatio.value)
                )
            }
        }
        return [state.amountA || "", state.amountB || ""]
    },
    set(newValue) {
        state.amountA = newValue[0]
        state.amountB = newValue[1]
    },
})
watch(
    ABTokens,
    (newValue, oldValue) => {
        // const newToken = newValue.filter((el) => oldValue ? oldValue.includes(el) : newVal)
        getBalance(null, true)
        // getBalance(newValue[0])

        // for each null token - the balance
        newValue.forEach((el, index) => {
            if (!el) {
                if (index === 0) {
                    state.balanceA = null
                } else {
                    state.balanceB = null
                }
            }
        })
        // if one token is null
        if (newValue.every((el) => el !== null) && state.tokenToSellIndex === 1) {
            // switchedTokens.value = switchedTokens.value.reverse()
        }
        // if (!ABTokens.value.every((el) => el !== null)) {

        // }
    },
    {
        immediate: true,
    }
)
// watch(
//     () => [stepStore.bothSwapTokensThere, stepStore.connectedWallet],
//     async (newValue) => {
//         if (newValue[0] && newValue[1]) {
//             // await getBidAsk(...stepStore.bothSwapTokenAddresses, stepStore.connectedWallet.provider)
//         } else {
//             resetPool()
//         }
//     },
//     {
//         immediate: true,
//     }
// )
watch(
    () => [stepStore.bothSwapTokensThere, stepStore.connectedWallet],
    async ([bothTokens, wallet], [prevBothTokens, prevWallet]) => {
        if (bothTokens && wallet) {
            if (prevWallet !== null) {
                console.log("looking for pool...")
                const pool = await findPool(...stepStore.bothSwapTokenAddresses, stepStore.connectedWallet.provider)
            }
            // } else if (wallet) {
            //     setPoolCreationListener(stepStore.connectedWallet.provider, false)
            // }
            return
        }
        if (wallet && !bothTokens) {
            console.log("reset pool")
            resetPool()
        }
    }
)
watch(
    () => [poolAddress.value, stepStore.connectedWallet],
    ([poolAdd, wallet], [prevPoolAdd, prevWallet]) => {
        if (poolAdd !== prevPoolAdd && poolAdd !== "" && poolAdd !== unhandled && wallet) {
            console.log("setup")
            setupPool(poolAdd, stepStore.bothSwapTokenAddresses, stepStore.connectedWallet.provider)
            //set ears too
            return
        }
        if (poolAdd === unhandled) {
            //set ears to off
            return
        }
    }
)

watch(
    () => stepStore.connectedWallet,
    (newVal) => {
        if (!newVal) {
            reset()
            return
        }
        getBalance(null, true)
    }
)

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

        // console.log("getting it")
        const provider = new BrowserProvider(stepStore.connectedWallet.provider)
        const tokenContract = new Contract(token.address, TokenABI, provider)
        const balance = await tokenContract.balanceOf(stepStore.connectedAccount)
        const formatedBalance = formatUnits(balance, token.decimals)
        if (ABTokens.value.indexOf(token) === 0) {
            state.balanceA = formatedBalance
        } else {
            state.balanceB = formatedBalance
        }
    }
}
function switchOrder() {
    const shuffle = [state.amountB, state.amountA].reverse()
    state.amountA = shuffle[1]
    state.amountB = shuffle[0]
    const shuffle2 = [state.approvalA, state.approvalB].reverse()
    state.approvalA = shuffle2[1]
    state.approvalB = shuffle2[0]
    state.lastChangedToken = state.lastChangedToken === 0 ? 1 : 0
    state.tokenToSellIndex = state.tokenToSellIndex === 0 ? 1 : 0
}
function setTokenAmount(event, inputIndex) {
    state.lastChangedToken = inputIndex
    ABAmounts.value = ABAmounts.value.map((el, i) => (inputIndex === i ? event.target.value : el))
}

const toggleTokenModal = inject("modal")
function openTokenSelectModal(index) {
    toggleTokenModal(ABTokens.value, setToken)
    state.selectTokenIndex = index
}

function setToken(token) {
    switchedTokens.value = switchedTokens.value.map((el, index) => (index === state.selectTokenIndex ? token : el))
}
async function swap() {
    try {
        const provider = new BrowserProvider(stepStore.connectedWallet.provider)
        const router = new Contract(stepStore.routerAddress, RouterABI, provider)

        const baseTokenIndex = switchedTokens.value.indexOf(
            switchedTokens.value.find((el) => el.address === baseTokenAddress.value)
        )
        const qouteTokenAddress = ABTokens.value.find((el) => el.address !== baseTokenAddress.value).address
        const poolAction = baseTokenIndex === 0 ? "sell" : "buy"

        const price = switchedTokens.value[0] === ABTokens.value[0] ? bidAsk.value[0] : bidAsk.value[1]
        // console.log("price:", price)
        console.log("baseTokenIndex:", baseTokenIndex)
        console.log("tokenToSellIndex", state.tokenToSellIndex)
        // const sellToken = new Contract(switchedTokens.value[0], TokenABI, provider.getSigner())
        // await sellToken.approve(stepStore.routerAddress, state.amountB)

        // buy(baseToken, qouteToken, desiredAmount, maxPrice, deadline)
        // sell(baseToken, qouteToken, desiredAmount, minPrice, deadline)

        //for 1x token0 how much token0 do you get

        // const price = tokenToSell.value === token0.value ? bidAsk.value[0] : bidAsk.value[1]

        // await poolContract[poolAction](formatedToken0Amount, formatedPrice).then((res) => {
        //     console.log(" - swap -  SUCCESSFUL SWAP -")
        //     console.log(res)
        // })
    } catch (err) {
        console.log(" - swap - could swap")
        console.log(err)
    }
}

function reset() {
    state.balanceA = null
    state.balanceB = null
    bidAsk.value = []
    state.showRate = false
    tempStore.poolAddress = null
}

const tokensNotNull = computed(() => {
    return ABTokens.value.every((el) => el !== null)
})

const rate = computed(() => {
    if (state.showRate) {
        let rate = tokenToSell.value === token0.value ? bidAsk.value[0] : 1 / Number(bidAsk.value[1])
        rate = Number(rate) > 1 ? Number(rate).toFixed(2) : Number(rate).toPrecision(2)
        return `1 ${switchedTokens.value[0].symbol} = ${rate} ${switchedTokens.value[1].symbol}`
    } else {
        return ""
    }
})
const switchedTokens = computed({
    get() {
        const list = [swapTokens.value.A, swapTokens.value.B]
        return !Boolean(state.tokenToSellIndex) ? list : list.reverse()
    },
    set(newValue) {
        if (state.tokenToSellIndex === 0) {
            swapTokens.value.A = newValue[0]
            swapTokens.value.B = newValue[1]
        } else {
            // state.tokenToSellIndex = 0
            swapTokens.value.A = newValue[1]
            swapTokens.value.B = newValue[0]
        }
    },
})
function callApproveSpending(address, amount) {
    if (stepStore.connectedWallet) {
        approveSpending(address, stepStore.connectedWallet.provider, amount, getAllowances)
    }
}
async function getAllowances() {
    if (stepStore.connectedWallet) {
        ABTokens.value.forEach(async (el1, index1) => {
            const allowance = el1 !== null ? await getApprovedAmount(el1.address) : 0
            ABAllowance.value = ABAllowance.value.map((el2, index2) => (index2 === index1 ? allowance : el2))
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
const switchedBalances = computed(() => {
    const list = [state.balanceA, state.balanceB]
    return state.tokenToSellIndex === 0 ? list : list.reverse()
})
const token0Style = computed(() => {
    // const list = ["token0", null]
    // if (stepStore.bothSwapTokensThere) {
    //     return state.tokenToSellIndex === 0 ? list : list.reverse()
    // } else {
    return [null, null]
    // }
})
const isMountedStyle = computed(() => {
    return !state.alreadyMounted ? "" : "transitions"
})

onMounted(() => {
    state.alreadyMounted = true
})
</script>
