<template>
    <div class="wrap row">
        <div class="widget base-wdg-box">
            <div class="top-bar row">
                <h3>Add Liquidity</h3>
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
                            ref="settingsAdd"
                            :default-slippage="0.5"
                            :default-deadline="30"
                        ></Settings>
                    </template>
                </Dropdown>
            </div>
            <!-- <div class="tips">
                <p><span class="text-highlight">Tip:</span> when you add liquidity</p>
            </div> -->
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
                            <p v-if="ABTokens[x] !== null">
                                {{ ABTokens[x]?.symbol }}
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
                            :value="ABAmounts[x]"
                            @input="setTokenAmount($event, x)"
                        />
                        <!-- :value="ABAmounts[x]" -->
                    </div>
                    <div class="window__lower">
                        <p class="caption">Balance: {{ Number(ABBalance[x]) }}</p>
                    </div>
                </div>
                <div
                    v-if="x === 0"
                    id="mid-symbol"
                    class="plus"
                >
                    <h2>+</h2>
                </div>
            </div>
            <!-- <div class="prices-share">
            <p class="reminder">please insert both amounts</p>
            <p class="info">
                {{
                    `setting initial pool price: ${state.amountA} ${ABTokens[0].symbol} to ${state.amountB} ${ABTokens[1].symbol}`
                }}
            </p>
            <p class="info">
                {{ `please wait, your ${ABTokens[0].symbol} + ${ABTokens[1].symbol} pool is being created` }}
            </p>
            <p>please insert both amount to set pool starting ratio</p>
        </div> -->
            <div
                v-if="bidAsk || poolShare"
                class="tables"
            >
                <div
                    v-if="bidAsk"
                    class="prices-share"
                >
                    <p>Prices</p>
                    <div class="table row">
                        <div class="left">
                            <p class="grey-text caption">Bid</p>
                            <p class="grey-text caption">Ask</p>
                        </div>
                        <div>
                            <p class="caption">{{ bidAskDisplay[0] }}</p>
                            <p class="caption">{{ bidAskDisplay[1] }}</p>
                            <p class="caption grey-text">{{ ABTokens[0].symbol }} per {{ ABTokens[1].symbol }}</p>
                        </div>
                        <div>
                            <p class="caption">{{ bidAskDisplayReverse[0] }}</p>
                            <p class="caption">{{ bidAskDisplayReverse[1] }}</p>
                            <p class="caption grey-text">{{ ABTokens[1].symbol }} per {{ ABTokens[0].symbol }}</p>
                        </div>
                        <!-- <div>
                        <p>{{ poolShare }}%</p>
                        <p class="caption grey-text">pool share</p>
                    </div> -->
                    </div>
                </div>
                <div
                    v-if="poolShare"
                    class="prices-share"
                >
                    <p>Pool share</p>
                    <div class="table row">
                        <div v-for="(token, x) in ABTokensBaseOrdered">
                            <p v-if="x === 0">{{ (thisReserve * poolShare) / 100 }}</p>
                            <p v-else>{{ (thatReserve * poolShare) / 100 }}</p>
                            <p class="caption grey-text">pooled {{ token.symbol }}</p>
                        </div>
                        <div>
                            <p>{{ poolShare }}%</p>
                            <p class="caption grey-text">pool share</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="buttons">
                <!-- <div
                    v-if=""
                    class="contents"
                > -->
                <div
                    v-for="(token, index) in ABTokens"
                    class="contents"
                >
                    <!-- @click="callApproveSpending(token.address)" -->
                    <Btn
                        v-if="
                            ABAllowance[index] < ABAmountsUint[index] &&
                            stepStore.bothPoolTokensThere &&
                            stepStore.connectedWallet
                        "
                        @click="callApproveSpending(token.address, ABAmountsUint[index])"
                        is="h4"
                        wide
                        secondary
                        bulky
                    >
                        Approve {{ token.symbol }}
                    </Btn>
                    <!-- </div> -->
                </div>
                <Btn
                    v-if="stepStore.connectedWallet && (poolAddress === unhandled || poolAddress === '')"
                    @click="callAddLiquidity()"
                    is="h4"
                    wide
                    bulky
                    :loading="waitingForAdding"
                    :disabled="!canCreatePool || !bothAmountsIn"
                >
                    {{ waitingForAdding ? "Waiting for pool" : "Create Pool" }}
                </Btn>
                <!-- @click="addLiquidity()" -->
                <Btn
                    v-if="stepStore.connectedWallet && !(poolAddress === unhandled || poolAddress === '')"
                    wide
                    is="h4"
                    bulky
                    @click="callAddLiquidity()"
                    :loading="waitingForAdding"
                    :disabled="!canAddLiquidity || !bothAmountsIn"
                >
                    {{ waitingForAdding ? "Waiting for pool" : "Add Liquidity" }}
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
        <div
            class="redeem base-wdg-box"
            v-if="poolShare"
        >
            <div class="top-bar row">
                <h3>Remove Liquidity</h3>
                <!-- {{ poolAddress }} <br /> -->
                <!-- {{ String(bidAsk) }} <br /> -->
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
                            ref="settingsRedeem"
                            :default-slippage="0.5"
                            :default-deadline="30"
                        ></Settings>
                    </template>
                </Dropdown>
            </div>
            <div>
                <p>{{ ABTokens[0].symbol }} / {{ ABTokens[1].symbol }}</p>
            </div>
            <div class="amount">
                <p class="grey-text">Amount</p>
                <div class="percents row">
                    <h1>{{ state.redeemPercent }}%</h1>
                    <div
                        class="options row"
                        ref="options"
                    >
                        <Btn
                            plain
                            opaque
                            outline
                            compact
                            @click="setRedeemProc($event, 25)"
                            >25%</Btn
                        >
                        <Btn
                            plain
                            opaque
                            outline
                            compact
                            @click="setRedeemProc($event, 50)"
                            >50%</Btn
                        >
                        <Btn
                            plain
                            opaque
                            outline
                            compact
                            @click="setRedeemProc($event, 75)"
                            >75%</Btn
                        >
                        <Btn
                            plain
                            opaque
                            outline
                            compact
                            @click="setRedeemProc($event, 100)"
                            >100%</Btn
                        >
                    </div>
                </div>
            </div>
            <div class="slider">
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    v-model="state.redeemPercent"
                    @input="removeSelected()"
                />
            </div>
            <!-- <p>your pool share: {{ poolShare }}%</p> -->
            <!-- <p>procent to redeem: {{ state.redeemPercent }}%</p> -->
            <div class="summary">
                <div class="row">
                    <p class="grey-text">pooled {{ ABTokens[0]?.symbol }}:</p>
                    <p>
                        {{
                            ABTokens[0]?.address === baseTokenAddress
                                ? (((thisReserve * poolShare) / 100) * state.redeemPercent) / 100
                                : (((thatReserve * poolShare) / 100) * state.redeemPercent) / 100
                        }}
                    </p>
                </div>
                <div class="row">
                    <p class="grey-text">pooled {{ ABTokens[1]?.symbol }}:</p>
                    <p>
                        {{
                            ABTokens[1]?.address === baseTokenAddress
                                ? (((thisReserve * poolShare) / 100) * state.redeemPercent) / 100
                                : (((thatReserve * poolShare) / 100) * state.redeemPercent) / 100
                        }}
                    </p>
                </div>
            </div>
            <div class="buttons">
                <Btn
                    is="h4"
                    wide
                    bulky
                    @click="redeemLiquidityCall()"
                >
                    Remove Liquidity
                </Btn>
            </div>
        </div>
    </div>
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

const { poolTokens } = storeToRefs(stepStore)
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
    lpTokenAddress,
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
    approvalA: "",
    approvalB: "",
    balanceA: "",
    balanceB: "",
    selectTokenIndex: 0,
    lastChangedToken: 0,
    redeemPercent: 100,
})

//MODAL STUFF----------
const toggleTokenModal = inject("modal")
function openTokenSelectModal(index) {
    toggleTokenModal(ABTokens.value, setToken)
    state.selectTokenIndex = index
}
async function setToken(token) {
    const sameTokenIndex = ABTokens.value.findIndex((el) => el?.address === token.address)
    if (sameTokenIndex !== -1 && sameTokenIndex !== state.selectTokenIndex) {
        ABTokens.value = ABTokens.value.reverse()
        return
    }
    ABTokens.value = ABTokens.value.map((el, index) => (index === state.selectTokenIndex ? token : el))
}
//MODAL STUFF----------

//SETTINGS--------------
const settingsAdd = ref()
const settingsRedeem = ref()
//SETTINGS--------------

//REDEEM WIDGET----------
const options = ref()
function setRedeemProc(event, proc) {
    removeSelected()
    event.target.classList.add("selected")
    state.redeemPercent = proc
}
const progressPercent = computed(() => {
    return state.redeemPercent + "%"
})
function removeSelected() {
    options.value.childNodes.forEach((el) => el.classList.remove("selected"))
}
function redeemLiquidityCall() {
    redeemLiquidity(
        ...stepStore.bothPoolTokenAddresses,
        state.redeemPercent,
        stepStore.connectedAccount,
        settingsRedeem.value.deadline,
        stepStore.connectedWallet.provider
    )
}
//REDEEM WIDGET----------

// TOKENS ---------------
// TOKENS ---------------

// AMOUNTS --------------
// AMOUNTS --------------

// BALANCES -------------
// BALANCES -------------

// ALLOWANCES -----------
// ALLOWANCES -----------

function callAddLiquidity() {
    addLiquidity(
        ...stepStore.bothPoolTokenAddresses,
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

function setTokenAmount(event, inputIndex) {
    state.lastChangedToken = inputIndex
    ABAmounts.value = ABAmounts.value.map((el, i) => (inputIndex === i ? event.target.value : el))
}

function calcQuote(value) {
    return Number(value) * poolRatio.value + ""
}
function calcBase(value) {
    if (!poolRatio.value) {
        return ""
    }
    return Number(value) * (1 / poolRatio.value) + ""
}
function cleanInput(value, oldValue) {
    value = value.replace(/[^\d.,]/g, "").replace(/,/g, ".")
    let dotCount = value.split(".").length - 1
    if (dotCount === 2) {
        value = oldValue
    }
    return value
}

// function callApproveSpending(address) {
function callApproveSpending(address, amount) {
    if (stepStore.connectedWallet) {
        approveSpending(address, stepStore.connectedWallet.provider, 0, getAllowances)
        // approveSpending(address, stepStore.connectedWallet.provider, amount, getAllowances)
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

async function getBalance(token, both = false) {
    if (stepStore.connectedWallet) {
        if (both) {
            getBalance(poolTokens.value.A)
            getBalance(poolTokens.value.B)
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

const ABTokens = computed({
    get() {
        return [poolTokens.value.A, poolTokens.value.B]
    },
    set(newValue) {
        poolTokens.value.A = newValue[0]
        poolTokens.value.B = newValue[1]
    },
})
const ABBalance = computed({
    get() {
        return [state.balanceA, state.balanceB]
    },
    set() {},
})
const ABTokensBaseOrdered = computed(() => {
    const list = [...ABTokens.value]
    return baseTokenIndex.value === 0 ? list : list.reverse()
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

// this is a computed property that is responsible for calulating the opposing input to display amount to be added when there is poolRatio
const ABAmounts = computed({
    get() {
        // Round function trimms down unncessary digits and adds < mark when unsignificant
        function Round(amt) {
            let amount = Number(amt)
            amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
            return Number(amount) < 0.00001 ? "<0.00001" : String(parseFloat(amount))
        }
        if (poolRatio.value && stepStore.bothPoolTokensThere) {
            // this if() cleans up other input when prior is set to 0
            if (
                (state.lastChangedToken === 0 && String(state.amountA).length === 0) ||
                (state.lastChangedToken === 1 && String(state.amountB).length === 0)
            ) {
                return ["", ""]
            }
            if (state.lastChangedToken === 0) {
                if (state.amountA.length !== 0) {
                    if (baseTokenIndex.value === 0) {
                        state.amountB = Round(calcQuote(state.amountA))
                    } else {
                        state.amountB = Round(calcBase(state.amountA))
                    }
                }
            } else {
                if (state.amountB.length !== 0) {
                    if (baseTokenIndex.value === 0) {
                        state.amountA = Round(calcBase(state.amountB))
                    } else {
                        state.amountA = Round(calcQuote(state.amountB))
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
    return ABAmounts.value.map((el) => {
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

//checks if both amounts are filled in
const bothAmountsIn = computed(() => {
    return ABAmounts.value.every((el) => el !== "")
})

//finds which token is base in the pool
const baseTokenIndex = computed(() => {
    return (
        stepStore.bothPoolTokensThere &&
        bidAsk.value &&
        ABTokens.value.indexOf(ABTokens.value.find((el) => el.address == baseTokenAddress.value))
    )
})

//checks whether pool can be created
const canCreatePool = computed(() => {
    return stepStore.connectedWallet && stepStore.bothPoolTokensThere && isSuffientAllowance.value
})

//checks whether liquidity can be added
const canAddLiquidity = computed(() => {
    return (
        stepStore.connectedWallet &&
        stepStore.bothPoolTokensThere &&
        isSuffientAllowance.value &&
        poolAddress.value !== "" &&
        poolAddress.value !== unhandled
    )
})

//checkes if allowance is bigger than inputed amounts
const isSuffientAllowance = computed(() => {
    return ABAllowance.value.map((el, index) => el >= ABAmountsUint.value[index]).every((el) => el === true)
})

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
                    stepStore.bothPoolTokenAddresses,
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
        const current = stepStore.bothPoolTokenAddresses
        if (current?.every((el) => incoming.includes(el))) {
            console.log("setting new pool")
            poolAddress.value = newPoolAddress
        }
        setupPoolCreated(stepStore.connectedWallet.provider)
        getBalance(null, true)
    })
}

//this wacher is responsible for cleaning up inputs from unwanted  charactera only where the input takes place
watch(
    ABAmounts,
    (newVal, oldVal) => {
        const [newA, newB] = [...newVal]
        const [oldA, oldB] = oldVal ? [...oldVal] : [null, null]
        if (state.lastChangedToken === 0 && newA !== oldA) {
            state.amountA = cleanInput(newA, oldA)
        } else if (state.lastChangedToken === 1 && newB !== oldB) {
            state.amountB = cleanInput(newB, oldB)
        }
    },
    {
        immediate: true,
    }
)
//looks for pool when two tokens are there and when wallet changes
watch(
    () => [stepStore.bothPoolTokenAddresses, stepStore.connectedAccount],
    (newVal, oldVal) => {
        const [bothTokens, wallet] = [...newVal]
        const [prevBothTokens, prevWallet] = oldVal ? [oldVal[0], oldVal[1]] : [null, null]
        if (bothTokens && wallet) {
            if (
                (prevBothTokens !== bothTokens && prevWallet === wallet) ||
                (prevBothTokens === bothTokens && prevWallet !== wallet)
            ) {
                findPool(...stepStore.bothPoolTokenAddresses, stepStore.connectedWallet.provider)
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

// triggered when pool address changes
watch(
    poolAddress,
    (poolAdd, prevPoolAdd) => {
        getAllowances()
        if (!(poolAdd === unhandled || poolAdd === "")) {
            setupPool(
                poolAdd,
                stepStore.bothPoolTokenAddresses,
                stepStore.connectedWallet.provider,
                stepStore.connectedAccount
            )
            setupLiquidityChange(stepStore.connectedWallet.provider)
        } else {
            //resets previous calulated amount to "0" when pool in no longer there
            ABAmounts.value = ABAmounts.value.map((el, index) => (index !== state.lastChangedToken ? "" : el))
            resetPool()
        }
    },
    {
        immediate: true,
    }
)

//triggered when selected tokens are changed
watch(
    () => [ABTokens.value, stepStore.connectedWallet],
    (newValue, oldValue) => {
        const newTokens = newValue.at(0)
        const wallet = newValue.at(1)
        if (wallet) {
            getAllowances()
            getBalance(null, true)
        } else {
            ABAllowance.value = ["", ""]
            ABBalance.value = ["", ""]
        }
    },
    {
        immediate: true,
    }
)

// look if wallet has been changed
watch(
    () => stepStore.connectedAccount,
    (wallet, prevWallet) => {
        if (wallet !== prevWallet && wallet) {
            setupPoolCreated(stepStore.connectedWallet.provider)
            if (!(poolAddress.value === unhandled || poolAddress.value === "")) {
                setupPool(
                    poolAddress.value,
                    stepStore.bothPoolTokenAddresses,
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
    if (stepStore.connectedWallet && stepStore.bothPoolTokensThere) {
        findPool(...stepStore.bothPoolTokenAddresses, stepStore.connectedWallet.provider)
    }
})

onUnmounted(() => {
    setPoolCreationListener(false)
    setLiquidityChangeListener(false)
})
</script>

<style lang="scss">
.wrap {
    gap: 20px;
    align-items: start;
    & > div {
        width: 450px;
    }
}
.widget {
    transition: background-color var(--transition);

    .tips {
        margin-bottom: 20px;
    }
    .window {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        &.transitions {
            &,
            * {
                transition-property: all;
                transition-duration: var(--transition);
            }
        }
        &:last-of-type {
            margin-bottom: 15px;
        }
        &__upper {
            flex-grow: 1;
            display: flex;
            align-items: center;
            position: relative;
            width: 100%;

            label {
                position: relative;
                flex-shrink: 0;
                display: flex;
                margin: 8px;

                background-color: var(--primary-disabled-bg);
                padding: 10px 20px;
                padding-right: 10px;
                border-radius: var(--small-wdg-radius);
                .icon {
                    margin-left: 4px;
                }
                cursor: pointer;
                p {
                    white-space: nowrap;
                    line-height: 1.5rem;
                }
            }
            input {
                color: var(--text-color-reverse);
                width: 100%;
                height: 100%;
                background: transparent;
                border: none;
                outline: none;
                text-align: right;
                font-size: 2rem;
                padding-right: 8px;

                &::placeholder {
                    color: var(--text-grey);
                    /* opacity: 0.8; */
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
        }
        &__lower {
            gap: 5px;
            padding: 5px 8px;
            text-align: end;
            background-color: var(--swap-windows);
            color: var(--text-grey);
        }
    }
    #mid-symbol {
        display: flex;
        justify-content: center;
        &.plus {
            margin-bottom: 5px;
        }
        &.button {
            margin: 5px;
            transform: rotate(0);
            transition: transform 0.2s;
            &.rotate {
                transform: rotate(-180deg);
            }
        }
    }
    .tables {
        margin: 20px 0;
        .prices-share {
            &:nth-child(2) {
                margin-top: 5px;
            }
            .table {
                margin-top: 7px;
                padding-top: 7px;
                border-top: 2px solid var(--primary-disabled-bg);
            }
        }
    }
    .buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
        > .btn:last-of-type {
            margin-bottom: 20px;
        }
    }
}
.table {
    justify-content: space-between;
    & > div {
        &.left {
            p {
                text-align: left;
                margin-left: 10%;
            }
        }
        text-align: center;
        /* text-align: left; */
        flex-basis: 25%;
        p {
            /* margin-bottom: 2px; */
            white-space: nowrap;
        }
        p:last-of-type {
            margin-bottom: 0px;
        }
    }
}
.redeem {
    flex-grow: 0;
    color: var(--text-color-reverse);
    & > div {
        margin-bottom: 20px;
    }
    .amount {
        .percents {
            align-items: center;
            justify-content: space-between;
            .options {
                gap: 5px;
            }
        }
    }
    .slider {
        position: relative;
        ::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 0;
            height: 6px;
            border-radius: 500px;
            width: v-bind(progressPercent);
            background-color: var(--primary-btn-bg);
            z-index: 0;
        }
        input[type="range"] {
            width: 100%;
            appearance: none;
            background: transparent;
            cursor: pointer;

            &::-webkit-slider-runnable-track {
                -webkit-appearance: none;
                appearance: none;
                background: var(--primary-disabled-bg);
                border-radius: 500px;
                height: 6px;
            }
            &::-moz-range-track {
                background: var(--primary-disabled-bg);
                border-radius: 500px;
                height: 6px;
            }
            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                height: 36px;
                width: 36px;
                background-color: var(--primary-btn-bg);
                margin-top: calc(3px - 18px);
                border-radius: 5000px;
            }
            &::-moz-range-thumb {
                -webkit-appearance: none;
                height: 36px;
                width: 36px;
                background-color: var(--primary-btn-bg);
                margin-top: calc(3px - 18px);
                border-radius: 5000px;
            }
            &::-webkit-progress-bar {
                background-color: var(--primary-btn-bg);
            }
        }
    }
    .summary {
        .row {
            justify-content: space-between;
        }
    }
}

.top-bar {
    justify-content: space-between;
    /* margin-bottom: 0.5rem; */
    border-bottom: 2px solid var(--text-color-reverse);
    padding-top: 17px;
    padding-bottom: 12px;
    margin-bottom: 20px;
}
.base-wdg-box {
    background-color: var(--widget-bg);
    border-radius: var(--outer-wdg-radius);
    /* box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px; */
    padding: 0 20px;
    color: var(--text-color-reverse);
}
.layer-wdg-box {
    background-color: var(--swap-windows);
    transition: background-color var(--transition);
    border-radius: var(--inner-wdg-radius);
    &--padded {
        padding: 1rem;
    }
}
</style>
