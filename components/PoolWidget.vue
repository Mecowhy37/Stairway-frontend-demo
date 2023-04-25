<template>
    <div class="widget white-box">
        {{ ABAllowance }}
        <div
            class="contents"
            v-for="(i, x) in new Array(2)"
        >
            <div class="window green-box">
                <label
                    for="amount_1"
                    @click="!waitingForAdding && openTokenSelectModal(x)"
                >
                    <h3
                        class="bolder"
                        v-if="ABTokens[x] !== null"
                    >
                        {{ ABTokens[x]?.symbol }}
                    </h3>
                    <h3
                        class="bolder"
                        v-else
                    >
                        select token
                    </h3>
                    <p v-if="balances[x] !== null">balance: {{ balances[x] }}</p>
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
            <div
                v-if="x === 0"
                id="add-symbol"
            >
                <h1>+</h1>
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
        <div class="buttons">
            <!-- <div
                v-if="stepStore.bothPoolTokensThere"
                class="contents"
            >
                <Btn
                    wide
                    secondary
                    bulky
                >
                    Approve {{ ABTokens[0].symbol }}
                </Btn>
                <Btn
                    wide
                    secondary
                    bulky
                >
                    Approve {{ ABTokens[1].symbol }}
                </Btn>
            </div> -->
            <Btn
                v-if="bidAsk === null"
                @click="callAddLiquidity()"
                wide
                bulky
                :loading="waitingForAdding"
                :disabled="!canCreatePool || !bothAmountsIn"
            >
                {{ waitingForAdding ? "waiting for pool" : "create pool" }}
            </Btn>
            <!-- @click="addLiquidity()" -->
            <Btn
                v-if="canAddLiquidity"
                wide
                bulky
                @click="callAddLiquidity()"
                :loading="waitingForAdding"
                :disabled="!canAddLiquidity || !bothAmountsIn"
            >
                {{ waitingForAdding ? "waiting for pool" : "add liquidity" }}
            </Btn>
            <!-- <Btn
                wide
                bulky
                @click="getPoolInf()"
            >
                check pool
            </Btn>
            <Btn
                wide
                bulky
                @click="checkAllow()"
            >
                check allowance
            </Btn> -->
        </div>
    </div>
    <div
        class="redeem white-box"
        v-if="poolShare"
    >
        <div class="info-box green-box green-box--padded">
            <p>your pool share: {{ poolShare }}%</p>
            <p>procent to redeem: {{ state.redeemProcent }}%</p>
            <div class="inputs-flex">
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    v-model="state.redeemProcent"
                />
                <p @click="setRedeemProc(25)">25%</p>
                <p @click="setRedeemProc(50)">50%</p>
                <p @click="setRedeemProc(75)">75%</p>
                <p @click="setRedeemProc(100)">100%</p>
            </div>
            <hr />
            <p>
                pooled {{ ABTokens[0]?.symbol }}:
                {{
                    ABTokens[0]?.address === baseTokenAddress
                        ? (thisReserve * state.redeemProcent) / 100
                        : (thatReserve * state.redeemProcent) / 100
                }}
            </p>
            <p>
                pooled {{ ABTokens[1]?.symbol }}:
                {{
                    ABTokens[1]?.address === baseTokenAddress
                        ? (thisReserve * state.redeemProcent) / 100
                        : (thatReserve * state.redeemProcent) / 100
                }}
            </p>
        </div>
        <Btn
            wide
            bulky
            @click="redeemLiquidityCall()"
        >
            reedem liquidity
        </Btn>
    </div>
</template>

<script setup>
import { inject } from "vue"

import { ethers } from "ethers"

import { storeToRefs } from "pinia"
import { useStepStore } from "@/stores/step"

import { getToken, useBalances, usePools } from "~/helpers/index"

import * as Factory from "../ABIs/Factory.json"
const FactoryABI = Factory.default

import * as Token from "../ABIs/ERC20.json"
const TokenABI = Token.default

const unhandled = "0x0000000000000000000000000000000000000000"
const stepStore = useStepStore()

const { poolTokens } = storeToRefs(stepStore)
const {
    bidAsk,
    baseTokenAddress,
    poolRatio,
    thisReserve,
    thatReserve,
    getBidAsk,
    getPoolInfo,
    checkAllowance,
    lpTotalSupply,
    liquidityTokenBalance,
    waitingBidAsk,
    bidAskFormat,
    addLiquidity,
    waitingForAdding,
    resetPool,
    redeemLiquidity,
} = usePools(stepStore.routerAddress)

const state = reactive({
    amountA: "",
    amountB: "",
    approvalA: null,
    approvalB: null,
    balanceA: null,
    balanceB: null,
    selectTokenIndex: 0,
    lastChangedToken: 0,
    redeemProcent: 50,
})
//modal stuff----------
const toggleTokenModal = inject("modal")
function openTokenSelectModal(index) {
    toggleTokenModal(ABTokens.value, setToken)
    state.selectTokenIndex = index
}
async function setToken(token) {
    ABTokens.value = ABTokens.value.map((el, index) => (index === state.selectTokenIndex ? token : el))
    if (token !== null) {
        const allowance = BigInt(await getApprovedAmount(token.address))
        ABAllowance.value = ABAllowance.value.map((el, index) => (index === state.selectTokenIndex ? allowance : el))
    }
}
//----------------------

async function getApprovedAmount(address) {
    const allowance = await checkAllowance(
        address,
        stepStore.connectedAccount,
        stepStore.routerAddress,
        stepStore.connectedWallet.provider
    ).catch((err) => {
        console.log("finshed executing apporval getter with error")
        retrurn
    })
    console.log("the allowance is", ABAllowance.value)
    return allowance
}

function getPoolInf() {
    getPoolInfo(...stepStore.bothPoolTokenAddresses, stepStore.connectedWallet.provider)
}
function setRedeemProc(proc) {
    state.redeemProcent = proc
}
function redeemLiquidityCall() {
    redeemLiquidity(state.redeemProcent, stepStore.connectedWallet.provider)
}
function callAddLiquidity() {
    addLiquidity(...stepStore.bothPoolTokenAddresses, ...ABAmounts.value, stepStore.connectedWallet.provider).then(
        () => {
            state.amountA = ""
            state.amountB = ""
        }
    )
}
async function getSigner() {
    const provider = new ethers.BrowserProvider(stepStore.connectedWallet.provider)
    const signer = await provider.getSigner()
    const txDetails = {
        to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        value: 100000000000000,
    }

    const sendTransaction = () => {
        return signer.sendTransaction(txDetails).then((tx) => tx.hash)
    }

    // const gasPrice = () => provider.getGasPrice().then((res) => res.toString())

    const estimateGas = () => {
        return signer.estimateGas(txDetails).then((res) => res.toString())
    }
    const transactionHash = await stepStore.onboard.state.actions.preflightNotifications({
        sendTransaction,
        // gasPrice,
        estimateGas,
        // balance: balanceValue,
        txDetails: txDetails,
    })
    console.log(transactionHash)
}
function setTokenAmount(event, inputIndex) {
    state.lastChangedToken = inputIndex
    ABAmounts.value = ABAmounts.value.map((el, i) => (inputIndex === i ? event.target.value : el))
}

const poolShare = computed(() => {
    return liquidityTokenBalance.value && lpTotalSupply.value
        ? (Number(liquidityTokenBalance.value) / Number(lpTotalSupply.value)) * 100
        : null
})
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
        state.approvalA = newValue[1]
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
    return stepStore.connectedWallet && stepStore.bothPoolTokensThere && bidAsk.value === null
})
const canAddLiquidity = computed(() => {
    return stepStore.connectedWallet && stepStore.bothPoolTokensThere && bidAsk.value !== null
})

watch(
    () => [stepStore.bothPoolTokensThere, stepStore.connectedWallet],
    (newValue) => {
        if (newValue[0] && newValue[1]) {
            getBidAsk(...stepStore.bothPoolTokenAddresses, stepStore.connectedWallet.provider)
        } else {
            resetPool()
        }
    },
    {
        immediate: true,
    }
)

watch(
    () => [ABTokens, stepStore.connectedWallet],
    (newValue, oldValue) => {
        if (oldValue?.every((el) => el !== null) && newValue.some((el) => el === null)) {
            resetPool()
        }
        newValue.forEach((el, index) => {
            // if (!el) {
            //     if (index === 0) {
            //         state.amountA = null
            //     } else {
            //         state.amountB = null
            //     }
            // }
        })
    },
    {
        immediate: true,
    }
)
</script>

<style lang="scss" scoped>
.widget {
    margin-top: 2rem;
    width: 500px;
    transition: background-color var(--transition);
    .window {
        display: flex;
        align-items: center;
        position: relative;
        width: 100%;
        height: 6.5rem;

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
    }
    #add-symbol {
        text-align: center;
    }
    .info-zone {
        p {
            margin: 0.5rem 0;
            border-radius: var(--inner-wdg-radius);
            padding: 0.5rem 1rem;
            &.reminder {
                background-color: rgba(237, 190, 103, 0.3);
                border: 2px solid rgba(255, 166, 0, 0.53);
            }
            &.info {
                background-color: rgba(116, 237, 103, 0.3);
                border: 2px solid rgba(35, 149, 58, 0.53);
            }
        }
    }
    .buttons {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 0.5rem;

        /* .pool {
                    --height: 6rem;
                    background-color: var(--primary-btn-bg);
                    transition: background-color var(--transition);
                    height: var(--height);
                    border-radius: 12px;
                    text-align: center;
                    cursor: pointer;
                    h3 {
                        line-height: var(--height);
                        color: var(--primary-btn-color);
                        transition: color var(--transition);
                    }

                    &.connecting {
                        box-shadow: 0 0 2px 3px hotpink inset;
                    }
                } */
    }
}
.redeem {
    margin-top: 2rem;
    .info-box {
        margin-bottom: 0.5rem;
        & > * {
            margin-bottom: 0.5rem;
            &:last-child {
                margin-bottom: 0rem;
            }
            p {
                cursor: pointer;
                &:hover {
                    color: rgb(7, 255, 7);
                }
            }

            &.inputs-flex {
                display: flex;
                justify-content: space-between;
                input {
                    width: 50%;
                }
            }
        }
    }
}
.green-box {
    background-color: var(--swap-windows);
    transition: background-color var(--transition);
    border-radius: var(--inner-wdg-radius);
    &--padded {
        padding: 1rem;
    }
}
.white-box {
    background-color: var(--widget-bg);
    border-radius: var(--outer-wdg-radius);
    box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px;
    padding: 0.5rem;
}
</style>
