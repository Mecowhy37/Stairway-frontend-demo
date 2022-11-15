<template>
    <div class="widget">
        <div class="amount-wrap">
            <div class="amount amount__input" :class="[token0Style[0], isMountedStyle]">
                <label for="amount_1" @click="setToken(0)">{{
                    switchedTokens[0] !== null ? switchedTokens[0].symbol : "select token"
                }}</label>
                <input
                    type="number"
                    id="amount_1"
                    name="amount_1"
                    placeholder="0.00"
                    @input="setTokenAmount($event.target.value, 0)"
                    :value="amountInputs[0]"
                />
                <div class="floater floater__switch" @click="switchOrder">switch</div>
                <div class="floater floater__price" :class="{ 'show-price': showPrice }">{{ price }}</div>
            </div>
            <div class="amount amount__input" :class="[token0Style[1], isMountedStyle]">
                <label for="amount_1" @click="setToken(1)">{{
                    switchedTokens[1] !== null ? switchedTokens[1].symbol : "select token"
                }}</label>
                <input
                    type="number"
                    name="amount_1"
                    id="amount_1"
                    placeholder="0.00"
                    @input="setTokenAmount($event.target.value, 1)"
                    :value="amountInputs[1]"
                />
            </div>
            <div v-if="stepStore.activeWallet === null" @click="stepStore.connectToMetamask" class="connect">
                <h3>{{ stepStore.isConnectingText }}</h3>
            </div>
            <div v-else @click="swap()" class="connect">
                <h3>swap</h3>
            </div>
        </div>
        <!-- <div class="slippage">
                <div class="checkbox inset" @click="toggleSlippage">
                    <div v-show="noSlippage">✓</div>
                </div>
                <label for="slippage">No slippage - set price</label>
            </div> -->
    </div>
</template>

<script>
import { useStepStore } from "~/stores/step"
import { mapStores } from "pinia"
import { ethers } from "ethers"

import * as Pair from "../contractABIs/GapswapV2Pair.json"
import * as Token from "../contractABIs/ERC20.json"
import * as Factory from "../contractABIs/GapswapV2Factory.json"
import * as Tokens from "../contants/tokens.json"

const unhandled = "0x0000000000000000000000000000000000000000"

const FactoryABI = Factory.abi
const PoolABI = Pair.abi
const TokenABI = Token.abi
const TokenList = Tokens.list

export default {
    data() {
        return {
            TokenA: null,
            TokenB: null,
            bidAsk: [],
            token0Index: null,
            buyAmount: null,
            sellAmount: null,
            tokenToSellIndex: 0,
            lastChangedToken: 0,
            defaultTokenASymbol: "BTC",
            defaultTokenBSymbol: "USD",
            showPrice: false,
            noSlippage: false,
            alreadyMounted: false,
        }
    },
    watch: {
        // tokens: {
        //     handler: async function (newValue, oldValue) {
        //         if (newValue[0].amount + newValue[1].amount === "") {
        //             this.showPrice = false
        //         }
        //         this.getNewPrice()
        //     },
        //     deep: true,
        // },
        async ABTokens() {
            if (!this.ABTokens.every((el) => el !== null)) {
                console.log("one of the tokens is null")

                this.bidAsk = []
                this.showPrice = false
                this.token0Index = null
                return
            }

            // try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const factory = new ethers.Contract(this.stepStore.factoryAddress, FactoryABI, provider)

            //find a pool
            const pairAddress = await factory.getPair(this.TokenA.address, this.TokenB.address)
            if (pairAddress === unhandled) {
                console.log("pair doesnt exist - check /constats/tokens.json")
                //notify
                return
            }

            const pool = new ethers.Contract(pairAddress, PoolABI, provider)

            //get bidAsk and maybe depth
            const bidAsk = await pool.getBidAsk()
            this.bidAsk[0] = ethers.utils.formatEther(bidAsk._bid)
            this.bidAsk[1] = ethers.utils.formatEther(bidAsk._ask)
            this.showPrice = true

            //find which is token0
            const token0 = await pool.token0()
            console.log("token0", token0)

            this.token0Index = this.ABTokens.findIndex((el) => el.address === token0)
            // } catch (err) {
            //     console.log(err)
            // }
        },
    },
    methods: {
        toggleSlippage() {
            this.noSlippage = !this.noSlippage
        },
        switchOrder() {
            const shuffle = [this.sellAmount, this.buyAmount].reverse()
            this.sellAmount = shuffle[0]
            this.buyAmount = shuffle[1]
            this.lastChangedToken = this.lastChangedToken === 0 ? 1 : 0
            this.tokenToSellIndex = this.tokenToSellIndex === 0 ? 1 : 0
        },
        getToken(symb) {
            return TokenList.find((el) => el.symbol === symb)
        },
        setTokenAmount(value, inputIndex) {
            this.lastChangedToken = inputIndex
            this.amountInputs = this.amountInputs.map((el, i) => (inputIndex === i ? value : el))
        },
        setToken(index) {
            // -> triggers ABTokens() watcher
            // opening modal and choosing token
            // do validation
            const toSet = this.getToken(this.defaultTokenBSymbol)

            if (this.switchedTokens[index] === null) {
                this.switchedTokens = this.switchedTokens.map((el) =>
                    this.switchedTokens.indexOf(el) === index ? toSet : el
                )
            } else {
                this.switchedTokens = this.switchedTokens.map((el) =>
                    this.switchedTokens.indexOf(el) === index && el.symbol !== this.defaultTokenASymbol ? null : el
                )
            }
        },
    },
    computed: {
        ...mapStores(useStepStore),
        ABTokens() {
            return [this.TokenA, this.TokenB]
        },
        token0() {
            return this.ABTokens[this.token0Index]
        },
        tokensNotNull() {
            return this.ABTokens.every((el) => el !== null)
        },
        tokenToSell() {
            return this.switchedTokens[0]
        },
        amountInputs: {
            get() {
                if (this.lastChangedToken === 0) {
                    if (this.tokenToSell === this.token0) {
                        this.buyAmount = this.sellAmount * this.bidAsk[0]
                    } else {
                        this.buyAmount = this.sellAmount / this.bidAsk[1]
                    }
                } else {
                    if (this.tokenToSell === this.token0) {
                        this.sellAmount = this.buyAmount / this.bidAsk[0]
                    } else {
                        this.sellAmount = this.buyAmount * this.bidAsk[1]
                    }
                }
                return [this.sellAmount || null, this.buyAmount || null]
            },
            set(newValue) {
                this.sellAmount = newValue[0]
                this.buyAmount = newValue[1]
            },
        },
        price() {
            if (this.showPrice) {
                const price = this.tokenToSell === this.token0 ? this.bidAsk[0] : 1 / Number(this.bidAsk[1])
                return `1 ${this.switchedTokens[0].symbol} = ${price} ${this.switchedTokens[1].symbol}`
            } else {
                return ""
            }
        },
        switchedTokens: {
            get() {
                const list = [this.TokenA, this.TokenB]
                return !Boolean(this.tokenToSellIndex) ? list : list.reverse()
            },
            set(newValue) {
                if (this.tokenToSellIndex === 0) {
                    this.TokenA = newValue[0]
                    this.TokenB = newValue[1]
                } else {
                    this.TokenA = newValue[1]
                    this.TokenB = newValue[0]
                }
            },
        },
        isConnectingStyle() {
            return this.connecting ? "connecting" : ""
        },
        token0Style() {
            const list = ["token0", null]
            if (this.tokensNotNull) {
                return this.switchedTokens[0] === this.token0 ? list : list.reverse()
            } else {
                return [null, null]
            }
        },
        isMountedStyle() {
            return !this.alreadyMounted ? "" : "transitions"
        },
    },
    mounted() {
        this.TokenA = this.getToken(this.defaultTokenASymbol)
        // this.TokenB = this.getToken(this.defaultTokenBSymbol)
        // this.getNewPrice()
        this.alreadyMounted = true
    },
}
</script>

<style lang="scss" scoped>
/* $primary: #efe8d6;
$secodary: #0a44c9; */

$primary: #b1d6f6;
$secodary: #ffd5c9;

.widget {
    background-color: var(--swap-bg);
    transition: background-color var(--transition);
    width: 500px;
    border-radius: 16px;
    box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px;
    /* box-shadow: rgba(0, 0, 0, 0.05) 0px 13px 35px -5px, rgba(0, 0, 0, 0.15) 0px 8px 22px -8px; */
    /* box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px; */
    padding: 0.6rem;
    padding-top: 6rem;
    display: flex;
    flex-direction: column;

    h2 {
        font-size: 2.6rem;
        text-align: center;
    }
    h3 {
        font-size: 2rem;
    }

    label {
        font-size: 2rem;
    }

    .amount-wrap {
        > div {
            &.amount {
                /* display: flex; */
                background: var(--swap-windows);
                transition: background-color var(--transition);

                &__input {
                    position: relative;
                    width: 100%;
                    height: 8rem;
                    border-radius: 14px;
                    position: relative;
                    &.transitions {
                        transition: height var(--transition);
                    }
                    .floater {
                        position: absolute;
                        z-index: 2;
                        background-color: var(--swap-windows);
                        border: var(--swap-bg) 0.5rem solid;
                        transition: all var(--transition);
                        padding: 0.7rem 1rem;
                        cursor: pointer;
                        top: calc(100% + 0.3rem);
                        font-size: 1.35rem;

                        &__switch {
                            transform: translateY(-50%);
                            border-radius: 1.3rem 0 0 1.3rem;
                            right: calc(0% - 0.4rem);
                        }
                        &__price {
                            border-radius: 0 1.3rem 1.3rem 0;
                            left: calc(0% - 0.4rem);
                            transform: translateY(-50%) scale(0);
                            transform-origin: left center;
                            &.show-price {
                                transform: translateY(-50%) scale(1);
                            }
                        }
                    }
                    &.token0 {
                        height: 10rem;
                        label {
                            font-weight: bold;
                        }
                    }

                    &:nth-of-type(2) {
                        margin-top: 0.5rem;
                    }

                    label {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        margin-left: 1.2rem;
                        cursor: pointer;
                        padding: 0.5rem;
                    }

                    input {
                        width: 100%;
                        height: 100%;
                        background: transparent;
                        border: none;
                        outline: none;
                        text-align: center;
                        font-weight: 400;
                        font-size: 4rem;

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
            }
            &.connect {
                background-color: var(--swap-main-btn-bg);
                transition: background-color var(--transition);
                height: 6rem;
                display: flex;
                margin-top: 0.6rem;
                flex-direction: column;
                place-content: center;
                border-radius: 12px;
                text-align: center;
                cursor: pointer;
                & > * {
                    color: var(--swap-main-btn-color);
                    transition: color var(--transition);
                }

                &.connecting {
                    /* box-shadow: 0 0 2px 3px hotpink inset; */
                }
            }
        }
    }

    .prices {
        /* margin-top: 1.6rem; */
        margin-bottom: 0.8rem;
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
</style>
