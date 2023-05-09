<template>
    <div class="widget">
        <!-- {{ bidAskFormat[0] }} -->
        <!-- {{ bidAskFormat[1] }} -->
        <!-- {{ state.tokenToSellIndex }} -->
        <div class="top-bar row">
            <!-- {{ id }} -->
            <Dropdown>
                <template #dropdown-activator="{ on }">
                    <Btn
                        transparent
                        icon-contrast
                        compact
                    >
                        <template #icon>
                            <h3>
                                <mdicon
                                    name="cog"
                                    size="30"
                                />
                            </h3>
                        </template>
                    </Btn>
                </template>
                <template #dropdown>
                    <Settings
                        :default-slippage="0.1"
                        :default-deadline="30"
                    ></Settings>
                </template>
            </Dropdown>
        </div>
        <div
            v-for="(i, x) in new Array(2)"
            class="window"
            :class="[token0Style[x], isMountedStyle]"
        >
            <label
                :for="'amount_' + x + 1"
                @click="openTokenSelectModal($event, x)"
            >
                <h3
                    v-if="switchedTokens[x] !== null"
                    class="bolder"
                >
                    {{ switchedTokens[x].symbol }}
                </h3>
                <h3
                    v-else
                    class="bolder"
                >
                    select token
                </h3>
                <p v-if="switchedBalances[x] !== null">balance: {{ switchedBalances[x] }}</p>
            </label>
            <input
                type="number"
                :id="'amount_' + x + 1"
                :name="'amount_' + x + 1"
                placeholder="0"
                inputmode="decimal"
                pattern="^[0-9]*[.,]?[0-9]*$"
                spellcheck="false"
                autocomplete="off"
                autocorrect="off"
                minlength="1"
                @input="setTokenAmount($event, x)"
                :value="amountInputs[x]"
            />
            <div
                v-if="x === 0"
                class="floater floater__switch"
                @click="switchOrder"
            >
                <h4>switch</h4>
            </div>
            <div
                v-if="x === 0"
                class="floater floater__rate"
                :class="{ 'show-rate': state.showRate }"
            >
                {{ rate }}
            </div>
        </div>
        <Btn
            v-if="!stepStore.connectedWallet"
            @click="stepStore.connectWalletAction"
            wide
            bulky
        >
            connect
        </Btn>
        <Btn
            v-else
            @click="swap()"
            wide
            bulky
        >
            <!-- :disabled="!stepStore.bothSwapTokensThere" -->
            swap
        </Btn>
        <Btn
            wide
            bulky
            @click="mystery()"
        >
            mistery pool
        </Btn>
        <!-- <div class="slippage">
            <div
            class="checkbox inset"
            @click="toggleSlippage"
            >
            <div v-show="noSlippage">✓</div>
        </div>
        <label for="slippage">No slippage - set price</label> 3226855 17.15 strzegomska 36 centrum medyczne
    </div> -->
    </div>
</template>

<script setup>
import { storeToRefs } from "pinia"
import { useStepStore } from "@/stores/step"
import { useTempStore } from "@/stores/temp"
import { ethers } from "ethers"

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
const { bidAsk, getBidAsk, bidAskFormat, baseTokenAddress, poolAddress, resetPool, setupPool, findPool } = usePools(
    stepStore.routerAddress
)
async function mystery() {
    const provider = new ethers.BrowserProvider(stepStore.connectedWallet.provider)
    const pool = new ethers.Contract("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", PoolABI, provider)
    const thisToken = await pool.thisToken()
    console.log("broadcast pool address", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0")
    console.log("pool.thisToken:", thisToken)
    const thatToken = await pool.thatToken()
    console.log("pool.thatToken:", thatToken)
    console.log("_____________________________")

    const router = new ethers.Contract(stepStore.routerAddress, RouterABI, provider)
    const factoryAdd = await router.factory()
    console.log("factoryAdd:", factoryAdd)
    const factory = new ethers.Contract(factoryAdd, FactoryABI, provider)

    const poolFromF = await factory.getPool(thisToken, thatToken)
    console.log("factory.getPool(this, that) = ", poolFromF)
}
const state = reactive({
    balanceA: null,
    balanceB: null,
    token0Index: null,
    buyAmount: "",
    sellAmount: "",
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
            setupPool(poolAdd, stepStore.bothPoolTokenAddresses, stepStore.connectedWallet.provider)
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
        const provider = new ethers.BrowserProvider(stepStore.connectedWallet.provider)
        const tokenContract = new ethers.Contract(token.address, TokenABI, provider)
        const balance = await tokenContract.balanceOf(stepStore.connectedAccount)
        const formatedBalance = ethers.formatUnits(balance, token.decimals)
        if (ABTokens.value.indexOf(token) === 0) {
            state.balanceA = formatedBalance
        } else {
            state.balanceB = formatedBalance
        }
    }
}
function switchOrder() {
    const shuffle = [state.sellAmount, state.buyAmount].reverse()
    state.sellAmount = shuffle[0]
    state.buyAmount = shuffle[1]
    state.lastChangedToken = state.lastChangedToken === 0 ? 1 : 0
    state.tokenToSellIndex = state.tokenToSellIndex === 0 ? 1 : 0
}
function setTokenAmount(event, inputIndex) {
    state.lastChangedToken = inputIndex
    amountInputs.value = amountInputs.value.map((el, i) => (inputIndex === i ? event.target.value : el))
}

const toggleTokenModal = inject("modal")
function openTokenSelectModal(event, index) {
    toggleTokenModal(ABTokens.value, setToken)
    state.selectTokenIndex = index
}

function setToken(token) {
    switchedTokens.value = switchedTokens.value.map((el, index) => (index === state.selectTokenIndex ? token : el))
}
async function swap() {
    try {
        const provider = new ethers.BrowserProvider(stepStore.connectedWallet.provider)
        const router = new ethers.Contract(stepStore.routerAddress, RouterABI, provider)

        const baseTokenIndex = switchedTokens.value.indexOf(
            switchedTokens.value.find((el) => el.address === baseTokenAddress.value)
        )
        const qouteTokenAddress = ABTokens.value.find((el) => el.address !== baseTokenAddress.value).address
        const poolAction = baseTokenIndex === 0 ? "sell" : "buy"

        const price = switchedTokens.value[0] === ABTokens.value[0] ? bidAsk.value[0] : bidAsk.value[1]
        // console.log("price:", price)
        console.log("baseTokenIndex:", baseTokenIndex)
        console.log("tokenToSellIndex", state.tokenToSellIndex)
        // const sellToken = new ethers.Contract(switchedTokens.value[0], TokenABI, provider.getSigner())
        // await sellToken.approve(stepStore.routerAddress, state.sellAmount)

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

const amountInputs = computed({
    get() {
        function Round(amt) {
            let amount = Number(amt)
            amount = amount >= 1 ? amount.toFixed(3) : amount.toPrecision(3)
            return amount === "NaN" || Number(amount) === 0 ? "" : String(parseFloat(amount))
        }
        if (
            (state.lastChangedToken === 0 && String(state.sellAmount).length === 0) ||
            (state.lastChangedToken === 1 && String(state.buyAmount).length === 0)
        ) {
            return ["", ""]
        }
        if (state.lastChangedToken === 0) {
            if (switchedTokens.value[0] === ABTokens.value[0]) {
                state.buyAmount = Round(state.sellAmount * bidAskFormat.value[0])
            } else {
                state.buyAmount = Round(state.sellAmount / bidAskFormat.value[1])
            }
        } else {
            if (switchedTokens.value[0] === ABTokens.value[0]) {
                state.sellAmount = Round(state.buyAmount / bidAskFormat.value[0])
            } else {
                state.sellAmount = Round(state.buyAmount * bidAskFormat.value[1])
            }
        }
        return [state.sellAmount || "", state.buyAmount || ""]
    },
    //unneccessary, can be moved where amountInputs are st
    set(newValue) {
        state.sellAmount = newValue[0]
        state.buyAmount = newValue[1]
    },
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

<style lang="scss" scoped>
/* $primary: #efe8d6;
$secodary: #0a44c9; */

$primary: #b1d6f6;
$secodary: #ffd5c9;

.widget {
    background-color: var(--widget-bg);
    transition: background-color var(--transition);
    width: 500px;
    border-radius: var(--outer-wdg-radius);
    box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px;
    padding: 0.5rem;
    /* padding-top: 3rem; */
    /* box-shadow: rgba(0, 0, 0, 0.05) 0px 13px 35px -5px, rgba(0, 0, 0, 0.15) 0px 8px 22px -8px; */
    /* box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px; */
    /* padding: 0.6rem; */
    /* padding-top: 6rem; */

    .top-bar {
        flex-direction: row-reverse;
        margin-bottom: 0.5rem;
    }
    .window {
        background-color: var(--swap-windows);
        transition: background-color var(--transition);
        display: flex;
        align-items: center;
        position: relative;
        width: 100%;
        height: 6.5rem;
        &.token0 {
            height: 8rem;
        }
        border-radius: var(--inner-wdg-radius);
        &.transitions {
            &,
            * {
                transition-property: all;
                transition-duration: var(--transition);
            }
        }

        label {
            position: relative;
            flex-shrink: 0;
            margin: 0 1.2rem;
            /* margin-bottom: 1.5rem; */
            cursor: pointer;
            p {
                white-space: nowrap;
            }
        }
        input {
            width: 100%;
            height: 100%;
            background: transparent;
            border: none;
            outline: none;
            text-align: right;
            padding-right: 1rem;
            font-weight: 400;
            font-size: 2.5rem;

            &::placeholder {
                opacity: 0.8;
            }
            // hiding browser default arrows
            &::-webkit-outer-spin-button,
            &::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            &[type="number"] {
                -moz-appearance: textfield;
            }
        }

        &:nth-of-type(3) {
            margin-top: 0.5rem;
        }
        & + button {
            margin-top: 0.5rem;
        }
        .floater {
            position: absolute;
            top: calc(100% + 0.3rem);
            padding: 0.35rem 0.65rem;
            cursor: pointer;
            background-color: var(--swap-windows);
            border: var(--widget-bg) 0.4rem solid;
            z-index: 2;

            &__switch {
                /* transform: translateY(-50%); */
                /* border-radius: 1.3rem 0 0 1.3rem; */
                /* right: calc(0% - 0.4rem); */
                transform: translate(50%, -50%);
                right: 50%;
                border-radius: calc(var(--inner-wdg-radius) * 0.8);
            }
            &__rate {
                border-radius: 0 1.3rem 1.3rem 0;
                left: calc(0% - 0.4rem);
                transform: translateY(-50%) scale(0);
                transform-origin: left center;
                &.show-rate {
                    transform: translateY(-50%) scale(1);
                }
            }
        }
        .slippage {
            margin: 1.6rem 0;
            display: flex;
            align-items: center;

            label {
                margin-left: 1.2rem;
            }

            .checkbox {
                background: #18302b;
                width: 4rem;
                aspect-ratio: 1/1;
                flex-grow: 0;
                border-radius: 10px;
                cursor: pointer;
                display: table;
                text-align: center;

                div {
                    font-size: 2.2rem;
                    display: table-cell;
                    vertical-align: middle;
                }
            }
        }
    }
}
</style>
