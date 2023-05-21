<template>
    <div class="wrap row">
        <div class="widget base-wdg-box">
            <div class="top-bar row">
                <h3>Add Liquidity</h3>
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
                            ref="settings"
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
                            <h4 v-if="ABTokens[x] !== null">
                                {{ ABTokens[x]?.symbol }}
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
                            @input="setTokenAmount($event, x)"
                            :value="ABAmounts[x]"
                            :disabled="waitingForAdding"
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
                    <h2>+</h2>
                </div>
            </div>
            <!-- <div class="info-zone">
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
                v-if="bidAsk"
                class="info-zone"
            >
                <h4>Prices (bid / ask) and pool share</h4>
                <div class="table row">
                    <div>
                        <p>{{ bidAskDisplay[0] }} / {{ bidAskDisplay[1] }}</p>
                        <p class="caption grey-text">{{ ABTokens[0].symbol }} per {{ ABTokens[1].symbol }}</p>
                    </div>
                    <div>
                        <p>{{ bidAskDisplayReverse[0] }} / {{ bidAskDisplayReverse[1] }}</p>
                        <p class="caption grey-text">{{ ABTokens[1].symbol }} per {{ ABTokens[0].symbol }}</p>
                    </div>
                    <div>
                        <p>{{ poolShare }}%</p>
                        <p class="caption grey-text">pool share</p>
                    </div>
                </div>
            </div>
            <div class="buttons">
                <div
                    v-if="stepStore.bothPoolTokensThere && stepStore.connectedWallet"
                    class="contents"
                >
                    <div
                        v-for="(token, index) in ABTokens"
                        class="contents"
                    >
                        <!-- @click="callApproveSpending(token.address)" -->
                        <Btn
                            v-if="ABAllowance[index] < ABAmountsUint[index]"
                            @click="callApproveSpending(token.address, ABAmountsUint[index])"
                            is="h4"
                            wide
                            secondary
                            bulky
                        >
                            Approve {{ token.symbol }}
                        </Btn>
                    </div>
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
                    v-if="stepStore.connectedWallet && canAddLiquidity"
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
                            ref="settings"
                            :default-slippage="0.5"
                            :default-deadline="30"
                        ></Settings>
                    </template>
                </Dropdown>
            </div>
            <div class="tokens">{{ ABTokens[0].symbol }} / {{ ABTokens[1].symbol }}</div>
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
    bidAskDisplay,
    bidAskDisplayReverse,
    addLiquidity,
    waitingForAdding,
    resetPool,
    redeemLiquidity,
    setPoolCreationListener,
    setLiquidityChangeListener,
} = usePools(stepStore.routerAddress)

const state = reactive({
    amountA: "",
    amountB: "",
    approvalA: "",
    approvalB: "",
    balanceA: null,
    balanceB: null,
    selectTokenIndex: 0,
    lastChangedToken: 0,
    redeemPercent: 100,
})
//modal stuff----------
const toggleTokenModal = inject("modal")
function openTokenSelectModal(index) {
    toggleTokenModal(ABTokens.value, setToken)
    state.selectTokenIndex = index
}
async function setToken(token) {
    ABTokens.value = ABTokens.value.map((el, index) => (index === state.selectTokenIndex ? token : el))
}
//----------------------

//settings--------------
const settings = ref()
//----------------------

function getPoolInf() {
    findPool(...stepStore.bothPoolTokenAddresses, stepStore.connectedWallet.provider)
}
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
        stepStore.connectedWallet.provider
    )
}
function callAddLiquidity() {
    addLiquidity(
        ...stepStore.bothPoolTokenAddresses,
        ...ABAmounts.value,
        settings.value.slippage,
        settings.value.deadline,
        stepStore.connectedAccount,
        stepStore.connectedWallet.provider
    ).then(() => {
        state.amountA = ""
        state.amountB = ""
    })
}
// function callApproveSpending(address) {
function callApproveSpending(address, amount) {
    if (stepStore.connectedWallet) {
        approveSpending(address, stepStore.connectedWallet.provider, 0, getAllowances)
    }
}
function setTokenAmount(event, inputIndex) {
    state.lastChangedToken = inputIndex
    ABAmounts.value = ABAmounts.value.map((el, i) => (inputIndex === i ? event.target.value : el))
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

const ABTokens = computed({
    get() {
        return [poolTokens.value.A, poolTokens.value.B]
    },
    set(newValue) {
        poolTokens.value.A = newValue[0]
        poolTokens.value.B = newValue[1]
    },
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
const ABAmountsUint = computed(() => {
    return ABAmounts.value.map((el) => (el !== "" ? parseEther(el) : 0))
})
const bothAmountsIn = computed(() => {
    return ABAmounts.value.every((el) => el !== "")
})
const balances = computed(() => {
    return [state.balanceA, state.balanceB]
})
const baseTokenIndex = computed(() => {
    return bidAsk.value && ABTokens.value.indexOf(ABTokens.value.find((el) => el.address == baseTokenAddress.value))
})
const canCreatePool = computed(() => {
    return (
        stepStore.connectedWallet &&
        stepStore.bothPoolTokensThere &&
        poolAddress.value === unhandled &&
        isSuffientAllowance.value
    )
})
const canAddLiquidity = computed(() => {
    return (
        stepStore.connectedWallet &&
        stepStore.bothPoolTokensThere &&
        poolAddress.value !== "" &&
        poolAddress.value !== unhandled
    )
})
const isSuffientAllowance = computed(() => {
    return ABAllowance.value.map((el, index) => el >= ABAmountsUint.value[index]).every((el) => el === true)
})

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
            // resetPool()
        }
    },
    {
        immediate: true,
    }
)

function setupLiquidityChange(providerArg, poolAdd = false) {
    if (providerArg === false) {
        setLiquidityChangeListener(false)
        return
    }
    setLiquidityChangeListener(providerArg, poolAdd).then(
        ([beneficiary, thisIn, thatIn, thisOut, thatOut, poolContractAddress]) => {
            if (poolContractAddress === poolAddress.value) {
                setupPool(poolContractAddress, stepStore.bothPoolTokenAddresses, stepStore.connectedWallet.provider)
            }
            setupLiquidityChange(stepStore.connectedWallet.provider, poolContractAddress)
        }
    )
}
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
    })
}
watch(
    poolAddress,
    (poolAdd, prevPoolAdd) => {
        getAllowances()
        if (!(poolAdd === unhandled || poolAdd === "")) {
            setupPool(poolAdd, stepStore.bothPoolTokenAddresses, stepStore.connectedWallet.provider)
            setupLiquidityChange(stepStore.connectedWallet.provider)
        } else {
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
            return
        }
        if (!wallet) {
            setPoolCreationListener(false)
            setLiquidityChangeListener(false)
            // setLiquidityChangeListener(false)
        }
    },
    {
        immediate: true,
    }
)

watch(
    () => [ABTokens.value, stepStore.connectedWallet],
    (newValue, oldValue) => {
        const newTokens = newValue.at(0)
        const oldTokens = oldValue?.at(0)
        const wallet = newValue.at(1)
        // if (oldTokens?.every((el) => el !== null) && newTokens?.some((el) => el === null)) {
        //     resetPool()
        // }
        // const newTokensNotNull = newTokens.filter((el) => (!oldTokens?.includes(el) && el !== null ? true : false))
        // const bothTokensThere = newTokens.every((el) => el !== null)
        // if (bothTokensThere && oldTokens !== newTokens && wallet) {

        // }

        if (wallet) {
            getAllowances()
        } else {
            ABAllowance.value = ["", ""]
        }
        // }
        // newValue.forEach((el, index) => {
        // if (!el) {
        //     if (index === 0) {
        //         state.amountA = null
        //     } else {
        //         state.amountB = null
        //     }
        // }
        // })
    },
    {
        immediate: true,
    }
)
onMounted(() => {
    if (stepStore.connectedWallet && stepStore.bothPoolTokensThere) {
        findPool(...stepStore.bothPoolTokenAddresses, stepStore.connectedWallet.provider)
    }
})
</script>

<style lang="scss" scoped>
.wrap {
    gap: 20px;
    align-items: start;
    & > div {
        width: 450px;
    }
}
.widget {
    transition: background-color var(--transition);
    color: var(--text-color-reverse);

    .tips {
        margin-bottom: 20px;
    }
    .window {
        /* &.transitions {
            &,
            * {
                transition-property: all;
                transition-duration: var(--transition);
            }
        } */
        display: flex;
        flex-direction: column;
        /* height: 5rem; */
        overflow: hidden;
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
                }
            }
            input {
                color: var(--text-grey);
                width: 100%;
                height: 100%;
                background: transparent;
                border: none;
                outline: none;
                text-align: right;
                font-size: 2rem;
                padding-right: 8px;

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
        }
        &__lower {
            padding: 5px 8px;
            text-align: end;
            background-color: var(--swap-windows);
            color: var(--text-grey);
        }
    }
    #add-symbol {
        text-align: center;
    }
    .info-zone {
        margin-top: 20px;
        .table {
            justify-content: space-between;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid var(--primary-disabled-bg);
            & > div {
                text-align: center;
                p:first-of-type {
                    margin-bottom: 5px;
                }
            }
        }

        /* &.reminder {
                background-color: rgba(237, 190, 103, 0.3);
                border: 2px solid rgba(255, 166, 0, 0.53);
            }
            &.info {
                background-color: rgba(116, 237, 103, 0.3);
                border: 2px solid rgba(35, 149, 58, 0.53);
            } */
    }
    .buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 20px;
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
    padding: 17px 0;
    margin-bottom: 20px;
}
.base-wdg-box {
    background-color: var(--widget-bg);
    border-radius: var(--outer-wdg-radius);
    /* box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px; */
    padding: 20px;
    padding-top: 0;
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
