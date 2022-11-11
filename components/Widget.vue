<template>
    <div>
        <div class="widget">
            <!-- <div v-if="showPrice" class="prices">price here </div> -->
            <div class="amount-wrap">
                <div class="amount amount__input" :class="isHigherStyle[0]">
                    <label v-if="orderedTokens[0] !== null" for="amount_1">{{ orderedTokens[0].symbol }}</label>
                    <label v-else for="amount_1" @click="setToken(0)">select token</label>
                    <input
                        type="number"
                        id="amount_1"
                        name="amount_1"
                        placeholder="0.00"
                        @input="setLastChanged(0)"
                        v-model="sellAmount"
                    />
                    <div class="switch" @click="switchOrder">switch</div>
                </div>
                <div class="amount amount__input" :class="isHigherStyle[1]">
                    <label v-if="orderedTokens[1] !== null" for="amount_1">{{ orderedTokens[1].symbol }}</label>
                    <label v-else for="amount_1" @click="setToken(1)">select token</label>
                    <input
                        type="number"
                        name="amount_1"
                        id="amount_1"
                        placeholder="0.00"
                        @input="setLastChanged(1)"
                        v-model="buyAmount"
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
    </div>
</template>

<script>
import { useStepStore } from "~/stores/step"
import { mapStores } from "pinia"
import { ethers } from "ethers"

import * as Factory from "../../contracts/core/build/contracts/IGapswapV2Factory.json"
import * as Pair from "../../contracts/core/build/contracts/GapswapV2Pair.json"
import * as Token from "../../contracts/core/build/contracts/ERC20.json"

import * as Tokens from "../contants/tokens.json"

const PoolABI = Pair.abi
const TokenABI = Token.abi
const FactoryABI = Factory.abi
const TokenList = Tokens.list

export default {
    data() {
        return {
            tokens: [
                { name: "TK1 (usd)", amount: "", isToken0: false },
                { name: "TK2 (btc)", amount: "0.01", isToken0: true },
            ],
            TokenA: null,
            TokenB: null,
            sellAmount: 28000,
            buyAmount: null,
            tokenToSell: 0,
            lastChangedToken: 1,
            defaultTokenASymbol: "USD",
            defaultTokenBSymbol: "BTC",
            bid: null,
            ask: null,
            showPrice: true,
            price: null,
            noSlippage: false,
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
            this.tokenToSell = this.tokenToSell === 0 ? 1 : 0
        },
        async getNewPrice() {
            const provider = new ethers.providers.Web3Provider(window.ethereum)

            const pairAddress = await this.stepStore.getPairAddress
            const poolContract = new ethers.Contract(pairAddress, PoolABI, provider)

            const bidAsk = await poolContract.getBidAsk()

            const reserve = await poolContract.getReserves()
            console.log("reserve", reserve)

            this.showPrice = true
            this.bid = ethers.utils.formatEther(bidAsk._bid)
            this.ask = ethers.utils.formatEther(bidAsk._ask)

            this.calculatePrice()
            this.calculateAmount()
        },
        calculatePrice() {
            if (this.tokens[0].isToken0) {
                this.price = 1 / this.bid
            } else {
                this.price = this.ask
            }
        },
        calculateAmount() {
            let desiredInput = this.tokens[this.lastChangedToken]
            let expectedOutput = this.tokens.find((el) => el !== desiredInput)

            if (desiredInput.amount === "") {
                expectedOutput.amount = ""
                this.showPrice = false
                return
            }

            if (this.tokens[0].name === this.tokens[this.lastChangedToken].name) {
                if (this.tokens[0].isToken0) {
                    expectedOutput.amount = desiredInput.amount * this.bid
                } else {
                    expectedOutput.amount = desiredInput.amount / this.ask
                }
            } else {
                if (this.tokens[0].isToken0) {
                    expectedOutput.amount = desiredInput.amount / this.bid
                } else {
                    expectedOutput.amount = desiredInput.amount * this.ask
                }
            }
        },
        setLastChanged(index) {
            this.lastChangedToken = index
        },
        async swap() {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum)

                //contract can recevie either just provider for read-only or signer or read-write
                // https://docs.ethers.io/v5/single-page/#/v5/api/contract/example/-%23-example-erc-20-contract--connecting-to-a-contract--erc20contract
                const poolAddress = await this.stepStore.getPairAddress
                const poolContract = new ethers.Contract(poolAddress, PoolABI, provider.getSigner())
                const tk1add = await poolContract.token0()
                const tk2add = await poolContract.token1()
                const token0Contract = new ethers.Contract(tk1add, TokenABI, provider.getSigner())
                const token1Contract = new ethers.Contract(tk2add, TokenABI, provider.getSigner())

                const token0 = this.tokens.find((el) => el.isToken0)

                const bidAsk = await poolContract.getBidAsk()
                const amount = ethers.utils.parseEther(token0.amount.toString())
                const poolAction = this.tokens[0].isToken0 ? "TokenA0" : "TokenB0"
                let price = this.tokens[0].isToken0 ? bidAsk._bid : bidAsk._ask

                console.log("bid: ", ethers.utils.formatEther(bidAsk._bid))
                console.log("ask: ", ethers.utils.formatEther(bidAsk._ask))

                // const to = await poolContract.getReserves()
                // console.log(ethers.utils.formatEther(to[0]))
                // console.log(ethers.utils.formatEther(to[1]))

                const approveAmount = ethers.utils.parseEther((token0.amount * 10000000000000).toString())
                const approvalResponse = await token0Contract.approve(poolAddress, approveAmount)
                const approvalResponse1 = await token1Contract.approve(poolAddress, approveAmount)

                console.log("poolAction: ", poolAction)
                console.log("amount: ", ethers.utils.formatEther(amount))
                console.log("price: ", ethers.utils.formatEther(price))

                const buy = await poolContract[poolAction](amount, price)
                console.log("success:", buy)
                this.tokens[0].amount = ""
                this.tokens[1].amount = ""
                this.tokens.sort((a, b) => (a.isToken0 ? -1 : 1))

                // const immutables = await getPoolImmutables(poolContract)
                // const state = await getPoolState(poolContract)
            } catch (err) {
                console.log(err)
            }
        },
        getToken(symb) {
            return TokenList.find((el) => el.symbol === symb)
        },
        setToken(index) {
            console.log("set token")
            const toSet = this.getToken("BTC")
            this.orderedTokens = this.orderedTokens.map((el) => (this.orderedTokens.indexOf(el) === index ? toSet : el))
        },
    },
    computed: {
        ...mapStores(useStepStore),
        isConnectingStyle() {
            return this.connecting ? "connecting" : ""
        },
        cssa() {
            this.stepStore.isDark ? `--dark-primary` : `--light-primary`
        },
        orderedTokens: {
            get() {
                const list = [this.TokenA, this.TokenB]
                return !Boolean(this.tokenToSell) ? list : list.reverse()
            },
            set(newValue) {
                if (this.tokenToSell === 0) {
                    this.TokenA = newValue[0]
                    this.TokenB = newValue[1]
                } else {
                    this.TokenA = newValue[1]
                    this.TokenB = newValue[0]
                }
            },
        },
        isHigherStyle() {
            const list = ["higher", null]
            return !Boolean(this.tokenToSell) ? list : list.reverse()
        },
    },
    mounted() {
        this.TokenA = this.getToken(this.defaultTokenASymbol)
        // this.TokenB = this.getToken(this.defaultTokenBSymbol)
        this.getNewPrice()
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
                background: var(--swap-windows);
                transition: background-color var(--transition);

                &__input {
                    position: relative;
                    width: 100%;
                    height: 8rem;
                    border-radius: 14px;
                    position: relative;
                    /* padding: 0.6rem 1.6rem; */
                    /* &:first-of-type { */
                    .switch {
                        position: absolute;
                        z-index: 2;
                        background-color: var(--swap-windows);
                        border: var(--swap-bg) 0.4rem solid;
                        transition: all var(--transition);
                        border-radius: 0.8rem 0 0 0.8rem;
                        padding: 0.7rem 1rem;
                        cursor: pointer;
                        transform: translateY(-50%);
                        top: calc(100% + 0.3rem);
                        right: calc(0% - 0.4rem);
                    }
                    &.higher {
                        height: 10rem;
                    }

                    &:nth-of-type(2) {
                        margin-top: 0.6rem;
                    }

                    label {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        margin-left: 1.2rem;
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
