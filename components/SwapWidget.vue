<template>
    <div class="wrap">
        <div class="widget base-box">
            <div class="top-bar row">
                <h3>Trade</h3>
                <Dropdown :settings-ref="settings">
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
            </div>
            <div
                v-if="true"
                class="tips"
            >
                <p>
                    <span class="text-highlight">Tip: </span>To try out the interface you'll need some tokens, you can
                    get them
                    <span
                        @click="openNewTokenModal"
                        class="activator-link text-highlight"
                        >here</span
                    >.
                </p>
                <p>
                    <span class="text-highlight">Tip:</span> Pool with these tokens doesnt exist yet,
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
                        <p class="caption">{{ Number(switchedBalances[x]) }}</p>
                    </div>
                </div>
                <div
                    v-if="x === 0"
                    id="mid-symbol"
                    class="button"
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
            <div
                v-if="!(poolAddress === '' || poolAddress === unhandled)"
                class="infos"
            >
                <div
                    v-if="Number(poolDepth) < Number(switchedAmounts[1])"
                    class="infos__info row"
                >
                    <mdicon
                        name="alert-circle"
                        size="30"
                    />
                    <p>you will only receive {{ Round(poolDepth) }} {{ switchedTokens[1].symbol }} at this price</p>
                </div>
            </div>
            <div class="buttons">
                <Btn
                    v-if="stepStore.connectedWallet"
                    @click="callSwap"
                    is="h4"
                    wide
                    bulky
                    :disabled="!canSwap"
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
            <div
                v-if="bidAsk"
                class="sum-up grey-text caption"
            >
                <p>1 {{ switchedTokens[1].symbol }} = {{ rate }} {{ switchedTokens[0].symbol }}</p>
                <div class="row space-between">
                    <p>Volume available at this price ({{ rate }} {{ switchedTokens[0].symbol }})</p>
                    <p>{{ displayDepth }} {{ switchedTokens[1].symbol }}</p>
                </div>
                <!-- <div class="row space-between">
                    <p>Gas price</p>
                    <p>$0.00021</p>
                </div> -->
            </div>
        </div>
    </div>
</template>

<script setup>
import { storeToRefs } from "pinia"
import { useStepStore } from "@/stores/step"
import { BrowserProvider, Contract, formatUnits, parseEther, formatEther } from "ethers"

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
    poolDepth,
    thisTokenAddress,
    poolAddress,
    findPool,
    getBidAsk,
    setupPool,
    bidAskFormat,
    bidAskDisplay,
    bidAskDisplayReverse,
    swap,
    waitingForAdding,
    resetPool,
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
// WIDGET ------------------
const canSwap = computed(() => {
    return !(poolAddress.value === unhandled || poolAddress.value === "") && bothAmountsIn.value
})
const bothAmountsIn = computed(() => {
    return switchedAmounts.value.every((el) => el !== "")
})
const displayDepth = computed(() => {
    return poolDepth.value ? Round(poolDepth.value) : null
})
function callSwap() {
    swap(
        baseQuoteAddresses.value,
        switchedAmountsUint.value,
        bidAsk.value[1],
        stepStore.connectedAccount,
        settings.value.deadline,
        stepStore.connectedWallet.provider
    )
}
// WIDGET ------------------

// TOKENS ------------------
const ABTokens = computed(() => {
    return [swapTokens.value.A, swapTokens.value.B]
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
const baseQuoteAddresses = computed(() => {
    if (stepStore.bothSwapTokenAddresses) {
        const list = [...stepStore.bothSwapTokenAddresses]
        return state.order === 0 ? list.reverse() : list
    } else {
        return null
    }
})
function setToken(token) {
    if (token) {
        const sameTokenIndex = switchedTokens.value.findIndex((el) => el?.address === token.address)
        if (sameTokenIndex !== -1 && sameTokenIndex !== state.selectTokenIndex) {
            switchOrder()
            return
        }
    }
    switchedTokens.value = switchedTokens.value.map((el, index) => (index === state.selectTokenIndex ? token : el))
}
function switchOrder() {
    state.order = state.order === 0 ? 1 : 0
    if (!(poolAddress.value === "" || poolAddress.value === unhandled)) {
        getBidAsk(baseQuoteAddresses.value, stepStore.connectedWallet.provider)
    }
}

// TOKENS ------------------

// AMOUNTS -----------------
const switchedAmounts = computed({
    get() {
        let list = [state.amountA, state.amountB]
        if (bidAsk.value) {
            if (list[state.lastChangedToken] === "") {
                list[Number(!Boolean(state.lastChangedToken))] = ""
                return list
            }
            if (state.lastChangedToken === 0) {
                list[1] = Round(calcThat(list[0]))
            } else if (state.lastChangedToken === 1) {
                list[0] = Round(calcThis(list[1]))
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
const rate = computed(() => {
    return bidAskFormat.value ? Round(String(1 * bidAskFormat.value[1])) : null
})
function setTokenAmount(event, inputIndex) {
    state.lastChangedToken = state.order === 0 ? inputIndex : Number(!Boolean(inputIndex))
    switchedAmounts.value = switchedAmounts.value.map((el, i) => (inputIndex === i ? event.target.value : el))
}

function calcThis(value) {
    if (state.order === 0) {
        return String(Number(value) * bidAskFormat.value[1])
    } else {
        return String(Number(value) / bidAskFormat.value[1])
    }
}
function calcThat(value) {
    if (state.order === 0) {
        return String(Number(value) / bidAskFormat.value[1])
    } else {
        return String(Number(value) * bidAskFormat.value[1])
    }
}
function Round(amt) {
    let amount = Number(amt)
    amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
    if (amount == 0) {
        return ""
    }
    return Number(amount) < 0.00001 ? "<0.00001" : String(parseFloat(amount))
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
    () => [state.amountA, state.amountB],
    (newVal, oldVal) => {
        if (bidAsk.value) {
            const [newA, newB] = [...newVal]
            const [oldA, oldB] = oldVal ? [...oldVal] : [null, null]
            if (state.lastChangedToken === 0 && newA !== oldA) {
                state.amountA = cleanInput(newA, oldA)
            } else if (state.lastChangedToken === 1 && newB !== oldB) {
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
const switchedBalances = computed({
    get() {
        const list = [state.balanceA, state.balanceB]
        return state.order === 0 ? list : list.reverse()
    },
    set(newVal) {
        state.balanceA = newVal[0]
        state.balanceB = newVal[1]
    },
})
// BALANCES ----------------

// MODAL STUFF -------------
const toggleSelectTokenModal = inject("selectTokenModal")
function openTokenSelectModal(index) {
    if (stepStore.connectedWallet) {
        toggleSelectTokenModal(ABTokens.value, setToken)
        state.selectTokenIndex = index
    }
}
const toggleNewTokenModal = inject("newTokenModal")
function openNewTokenModal() {
    toggleNewTokenModal()
}
// MODAL STUFF -------------

//SETTINGS--------------
const settings = ref()
//SETTINGS--------------

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
                    baseQuoteAddresses.value,
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

// FINDS POOL OR GETS BID ASK BY TOKEN ADDRESSES
watch(
    () => [stepStore.bothSwapTokenAddresses, stepStore.connectedWallet],
    (newVal, oldVal) => {
        const [bothTokens, wallet] = [...newVal]
        const [prevBothTokens, prevWallet] = oldVal ? [...oldVal] : [[null, null], null]
        if (bothTokens && wallet) {
            if (
                (prevBothTokens !== bothTokens && prevWallet === wallet) ||
                (prevBothTokens === bothTokens && prevWallet !== wallet)
            ) {
                findPool(...baseQuoteAddresses.value, stepStore.connectedWallet.provider)
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

//SETS UP POOL OR RESETS BY POOL ADDRESS
watch(
    poolAddress,
    (poolAdd, prevPoolAdd) => {
        if (!(poolAdd === unhandled || poolAdd === "")) {
            setupPool(poolAdd, baseQuoteAddresses.value, stepStore.connectedWallet.provider, stepStore.connectedAccount)
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

//GETS BALANCES BY TOKENS AND WALLET
watch(
    // () => [switchedTokens.value, stepStore.connectedWallet],
    () => [ABTokens.value, stepStore.connectedWallet],
    (newValue) => {
        const wallet = newValue[1]
        if (wallet) {
            getBalance(null, true)
        } else {
            switchedBalances.value = ["", ""]
        }
    },
    {
        immediate: true,
    }
)

// SETS UP LISTENERS OR SETS POOL BASED ON CONNECTED WALLET
watch(
    () => stepStore.connectedAccount,
    (wallet, prevWallet) => {
        if (wallet !== prevWallet && wallet) {
            setupPoolCreated(stepStore.connectedWallet.provider)
            if (!(poolAddress.value === unhandled || poolAddress.value === "")) {
                setupPool(
                    poolAddress.value,
                    baseQuoteAddresses.value,
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

//maybe only needed in development to find pool on code reload
onMounted(() => {
    state.alreadyMounted = true
    if (stepStore.connectedWallet && stepStore.bothSwapTokensThere) {
        findPool(...stepStore.bothSwapTokenAddresses, stepStore.connectedWallet.provider)
    }
})

//TURNS OFF LISTENERS
onUnmounted(() => {
    setPoolCreationListener(false)
    setLiquidityChangeListener(false)
})
</script>
