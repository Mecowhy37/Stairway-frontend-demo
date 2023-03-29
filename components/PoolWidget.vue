<template>
    <div class="widget">
        <div
            class="contents"
            v-for="(i, x) in new Array(2)"
        >
            <div class="window">
                <label
                    for="amount_1"
                    @click="openTokenSelectModal($event, x)"
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
                    type="number"
                    id="amount_1"
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
                />
            </div>
            <div
                v-if="x === 0"
                id="add-symbol"
            >
                <h1 @click="callbacker">+ {{ state.tryout }}</h1>
            </div>
        </div>
        <div class="buttons">
            <!-- class="pool" -->
            <Btn
                @click="createPair()"
                wide
                bulky
            >
                create pair
            </Btn>
            <!-- class="pool" -->
            <Btn
                @click="addLiquidity()"
                wide
                bulky
            >
                add liquidity
            </Btn>
        </div>
    </div>
</template>

<script setup>
import { inject } from "vue"

import { ethers } from "ethers"

import { useStepStore } from "@/stores/step"
import { useTempStore } from "@/stores/temp"
import { mapStores } from "pinia"
import { getCurrentInstance } from "vue"

import { getToken } from "~/helpers/index"

// import * as Factory from "../ABIs/factoryAbi.json"
// const FactoryABI = Factory.default

// import * as Pool from "../ABIs/poolAbi.json"
// const PoolABI = Pool.default

// import * as Token from "../ABIs/tokenAbi.json"
// const TokenABI = Token.default
const unhandled = "0x0000000000000000000000000000000000000000"
const stepStore = useStepStore()
const state = reactive({
    TokenA: getToken("fBTC"),
    TokenB: getToken("fUSD"),
    amountA: "1",
    amountB: "30000",
    balanceA: null,
    balanceB: null,
    selectTokenIndex: 0,
})

// async function createPair() {
//     //to do - organise contract instantiation not do do it every function
//     const provider = new ethers.providers.Web3Provider(window.ethereum)
//     const factory = new ethers.Contract(stepStore.factoryAddress, FactoryABI, provider.getSigner())
//     try {
//         await factory
//             .createPair(TokenA.address, this.TokenB, unhandled)
//             .then(async (created) => {
//                 console.log(" - pool - successfully created pool - ")
//                 console.log(created)
//                 await factory.getPair(TokenA.address, TokenB.address).then((res) => {
//                     console.log(" - pool - is pool address here yet?")
//                     console.log(res)
//                 })
//             })
//     } catch (err) {
//         console.log(" - pool - couldnt create pool - ")
//         console.log(err)
//     }
// }

// async function addLiquidity() {
//     const provider = new ethers.providers.Web3Provider(window.ethereum)
//     const poolContract = new ethers.Contract(this.tempStore.poolAddress, PoolABI, provider.getSigner())
//     const tkA = new ethers.Contract(this.TokenA.address, TokenABI, provider.getSigner())
//     const tkB = new ethers.Contract(this.TokenB.address, TokenABI, provider.getSigner())
//     // const tkA = new ethers.Contract(this.TokenA.address, TokenABI, provider)
//     // const tkB = new ethers.Contract(this.TokenB.address, TokenABI, provider)

//     const amountA = ethers.utils.parseEther(this.amountA.toString())
//     const amountB = ethers.utils.parseEther(this.amountB.toString())
//     try {
//         await tkA.approve(this.tempStore.poolAddress, amountA)
//         await tkB.approve(this.tempStore.poolAddress, amountB)
//     } catch (err) {
//         console.log("- pool - couldnt approve amounts - ")
//     }
//     try {
//         const token0 = await poolContract.token0()
//         const AB = [this.TokenA.address, this.TokenB.address]
//         const index = AB.indexOf((el) => el === token0)
//         const ordered = index === 0 ? [amountA, amountB] : [amountB, amountA]

//         await poolContract.addLiquidity(...ordered).then((res) => {
//             console.log(res)
//         })
//     } catch (err) {
//         console.log("- pool - couldnt add liquid - ")
//         console.log(err)
//     }
// }
const toggleTokenModal = inject("modal")
function openTokenSelectModal(event, index) {
    toggleTokenModal(ABTokens.value, setToken)
    state.selectTokenIndex = index
}

function setToken(token) {
    ABTokens.value = ABTokens.value.map((el, index) => (index === state.selectTokenIndex ? token : el))
}
function setTokenAmount(event, inputIndex) {
    ABAmounts.value = ABAmounts.value.map((el, i) => (inputIndex === i ? event.target.value : el))
}

const ABTokens = computed({
    get() {
        return [state.TokenA, state.TokenB]
    },
    set(newValue) {
        state.TokenA = newValue[0]
        state.TokenB = newValue[1]
    },
})
const ABAmounts = computed({
    get() {
        return [state.amountA, state.amountB]
    },
    set(newValue) {
        state.amountA = newValue[0]
        state.amountB = newValue[1]
    },
})
const balances = computed(() => {
    return [state.balanceA, state.balanceB]
})
</script>

<style lang="scss" scoped>
.widget {
    margin-top: 2rem;
    background-color: var(--widget-bg);
    transition: background-color var(--transition);
    width: 500px;
    border-radius: var(--outer-wdg-radius);
    box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px;
    padding: 0.5rem;
    .window {
        background-color: var(--swap-windows);
        transition: background-color var(--transition);
        display: flex;
        align-items: center;
        position: relative;
        width: 100%;
        height: 6.5rem;
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
            margin-bottom: 1.5rem;

            cursor: pointer;
            p {
                position: absolute;
                white-space: nowrap;
                bottom: -90%;
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
    .buttons {
        display: flex;
        flex-direction: row;
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
</style>
