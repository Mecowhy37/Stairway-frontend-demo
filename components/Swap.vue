<template>
    <Widget no-return>
        <template #widget-title>Trade</template>
        <template #right-icon>
            <Dropdown
                :settings-ref="settings"
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
                        ref="settings"
                        :default-slippage="0.5"
                        :default-deadline="30"
                        :toggle-dropdown="toggleDropdown"
                        no-slippage
                    ></Settings>
                </template>
            </Dropdown>
        </template>
        <template #widget-content>
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
            <div class="windows">
                <div
                    class="contents"
                    v-for="(i, x) in new Array(2)"
                >
                    <div class="window layer-wdg-box">
                        <div class="window__upper">
                            <label @click="openTokenSelectModal(x)">
                                <p v-if="switchedTokens[x] !== null">
                                    {{ switchedTokens[x]?.symbol }}
                                </p>
                                <p v-else>select token</p>
                                <Icon
                                    name="chevron"
                                    :size="16"
                                />
                            </label>
                            <input
                                type="text"
                                placeholder="0"
                                spellcheck="false"
                                autocomplete="off"
                                autocorrect="off"
                                :disabled="waitingForAdding"
                                :value="switchedAmounts[x]"
                                @input="setTokenAmount($event, x)"
                            />
                        </div>
                        <div class="window__lower row flex-end align-center">
                            <!-- <p class="caption">{{ Number(switchedBalances[x]) }}</p> -->
                            <p class="caption">5591</p>
                            <Icon
                                name="wallet"
                                :size="13"
                            />
                        </div>
                    </div>
                    <div
                        v-if="x === 0"
                        id="mid-symbol"
                        class="button plus"
                    >
                        <Btn
                            circle
                            plain
                            @click="switchOrder()"
                        >
                            <template #icon>
                                <Icon
                                    name="arrow"
                                    :size="11"
                                />
                            </template>
                        </Btn>
                    </div>
                </div>
            </div>
            <!-- v-if="!(poolAddress === '' || poolAddress === unhandled)" -->
            <div class="infos">
                <!-- v-if="Number(poolDepth) < Number(switchedAmounts[1])" -->
                <div class="info row">
                    <div>
                        <Icon
                            class="icon"
                            name="warrning"
                            :size="25"
                        />
                    </div>
                    <!-- <p>you will only receive {{ Round(poolDepth) }} {{ switchedTokens[1].symbol }} at this price</p> -->
                    <p>you will only receive 20 fETH at this price</p>
                </div>
            </div>
            <div class="buttons">
                <!-- v-if="stepStore.connectedWallet" -->
                <Btn
                    @click="callSwap"
                    is="h4"
                    wide
                    bulky
                    :disabled="!canSwap"
                >
                    Swap
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
            <!-- v-if="bidAsk" -->
            <div class="sum-up grey-text caption">
                <!-- <p>1 {{ switchedTokens[1].symbol }} = {{ rate }} {{ switchedTokens[0].symbol }}</p> -->
                <p>1 fETH = 20 000 fUSD</p>
                <div class="row space-between">
                    <!-- <p>Volume available at this price ({{ rate }} {{ switchedTokens[0].symbol }})</p> -->
                    <p>Volume available at this price (20 000 fUSD)</p>
                    <!-- <p>{{ displayDepth }} {{ switchedTokens[1].symbol }}</p> -->
                    <p>20 fETH</p>
                </div>
                <!-- <div class="row space-between">
                    <p>Gas price</p>
                    <p>$0.00021</p>
                </div> -->
            </div>
        </template>
    </Widget>
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
    poolAddress,
    findPool,
    getBidAsk,
    setupPool,
    bidAskFormat,
    bidAskDisplay,
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
        getBidAsk()
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
    toggleSelectTokenModal(ABTokens.value, setToken)
    state.selectTokenIndex = index
}
const toggleNewTokenModal = inject("newTokenModal")
function openNewTokenModal() {
    toggleNewTokenModal()
}
// MODAL STUFF -------------

//SETTINGS--------------
const settings = ref()
//SETTINGS--------------

// FINDS POOL OR GETS BID ASK BY TOKEN ADDRESSES
watch(
    () => stepStore.bothSwapTokenAddresses,
    (bothTokens) => {
        if (bothTokens) {
            findPool(...baseQuoteAddresses.value)
            return
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
            // getBalance(null, true)
        } else {
            switchedBalances.value = ["", ""]
        }
    },
    {
        immediate: true,
    }
)

//maybe only needed in development to find pool on code reload
// onMounted(() => {
//     state.alreadyMounted = true
//     if (stepStore.connectedWallet && stepStore.bothSwapTokensThere) {
//         findPool(...stepStore.bothSwapTokenAddresses, stepStore.connectedWallet.provider)
//     }
// })
</script>
