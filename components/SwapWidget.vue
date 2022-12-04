<template>
    <div class="widget">
        <div class="wrap">
            <div class="amount amount__input" :class="[token0Style[0], isMountedStyle]">
                <label for="amount_1" @click="setToken(0)"
                    >{{ switchedTokens[0] !== null ? switchedTokens[0].symbol : "select token" }} <br />
                    <p v-if="switchedBalance[0] !== null">balance: {{ switchedBalance[0] }}</p></label
                >
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
                <label for="amount_1" @click="setToken(1)"
                    >{{ switchedTokens[1] !== null ? switchedTokens[1].symbol : "select token" }}<br />
                    <p v-if="switchedBalance[1] !== null">balance: {{ switchedBalance[1] }}</p></label
                >
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
import { useTempStore } from "~/stores/temp"
import { mapStores } from "pinia"
import { ethers } from "ethers"

import { getToken } from "~/helpers/index"

import * as Factory from "../ABIs/factoryAbi.json"
const FactoryABI = Factory.default

import * as Pool from "../ABIs/poolAbi.json"
const PoolABI = Pool.default

import * as Token from "../ABIs/tokenAbi.json"
const TokenABI = Token.default

import * as Tokens from "../constants/tokenAddresses.json"
const TokenList = Tokens.default

const unhandled = "0x0000000000000000000000000000000000000000"

export default {
    data() {
        return {
            TokenA: null,
            TokenB: null,
            balanceA: null,
            balanceB: null,
            bidAsk: [],
            token0Index: null,
            buyAmount: "",
            sellAmount: "",
            tokenToSellIndex: 0,
            lastChangedToken: 0,
            defaultTokenASymbol: "MyBTC",
            defaultTokenBSymbol: "MyUSD",
            showPrice: false,
            noSlippage: false,
            alreadyMounted: false,
        }
    },
    watch: {
        async ABTokens() {
            this.getBalances()
            if (!this.ABTokens.every((el) => el !== null)) {
                // one of the tokens is null
                this.bidAsk = []
                this.tempStore.poolAddress = null
                this.showPrice = false
                this.token0Index = null
                return
            }

            try {
                this.setupPool()
            } catch (err) {
                console.log(err)
            }
        },
        activeWalletCallback() {
            this.getBalances()
        },
    },
    methods: {
        async getBalances() {
            if (this.stepStore.activeWallet) {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                if (this.TokenA) {
                    const tkA = new ethers.Contract(this.TokenA.address, TokenABI, provider)
                    const balA = await tkA.balanceOf(this.stepStore.activeWallet)
                    this.balanceA = ethers.utils.formatEther(balA)
                } else {
                    this.balanceA = null
                }
                if (this.TokenB) {
                    const tkB = new ethers.Contract(this.TokenB.address, TokenABI, provider)
                    const balB = await tkB.balanceOf(this.stepStore.activeWallet)
                    this.balanceB = ethers.utils.formatEther(balB)
                } else {
                    this.balanceB = null
                }
            }
        },
        switchOrder() {
            const shuffle = [this.sellAmount, this.buyAmount].reverse()
            this.sellAmount = shuffle[0]
            this.buyAmount = shuffle[1]
            this.lastChangedToken = this.lastChangedToken === 0 ? 1 : 0
            this.tokenToSellIndex = this.tokenToSellIndex === 0 ? 1 : 0
        },
        setTokenAmount(value, inputIndex) {
            this.lastChangedToken = inputIndex
            this.amountInputs = this.amountInputs.map((el, i) => (inputIndex === i ? value : el))
        },
        setToken(index) {
            // -> triggers ABTokens() watcher
            // opening modal and choosing token
            // do validation
            const toSet = getToken(this.defaultTokenBSymbol)

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
        async swap() {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const factory = new ethers.Contract(this.stepStore.factoryAddress, FactoryABI, provider)

                //find a pool
                const poolAddress = await factory.getPair(this.TokenA.address, this.TokenB.address)

                const poolContract = new ethers.Contract(poolAddress, PoolABI, provider.getSigner())

                const sellToken = new ethers.Contract(this.tokenToSell.address, TokenABI, provider.getSigner())

                const approveAmount = ethers.utils.parseEther(this.sellAmount)
                const approvalResponse = await sellToken.approve(this.tempStore.poolAddress, approveAmount)

                // const allow = await sellToken.allowance(this.stepStore.activeWallet, this.tempStore.poolAddress)
                // console.log("allowance", ethers.utils.formatEther(allow._hex))

                const poolAction = this.tokenToSell === this.token0 ? "sellToken0" : "buyToken0"

                //for 1x token0 how much token0 do you get
                // const price = this.tokenToSell === this.token0 ? this.bidAsk[0] : String(1 / Number(this.bidAsk[1]))
                const price = this.tokenToSell === this.token0 ? this.bidAsk[0] : this.bidAsk[1]
                const formatedPrice = ethers.utils.parseEther(price)

                const token0Amount = this.tokenToSell === this.token0 ? this.sellAmount : this.buyAmount
                const formatedToken0Amount = ethers.utils.parseEther(token0Amount)

                console.log(" - swap - pool action: ", poolAction)
                console.log(" - swap - amount: ", token0Amount)
                console.log(" - swap - price - : ", price)
                // return
                await poolContract[poolAction](formatedToken0Amount, formatedPrice).then((res) => {
                    console.log(" - swap -  SUCCESSFUL SWAP -")
                    console.log(res)

                    this.setupPool()
                    this.amountA = ""
                    this.amountB = ""
                })
            } catch (err) {
                console.log(" - swap - could swap")
                console.log(err)
            }
        },
        async setupPool() {
            console.log(" - swap - SETUP POOL CALLED - ")
            this.getBalances()
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const factory = new ethers.Contract(this.stepStore.factoryAddress, FactoryABI, provider)

            //find a pool
            const poolAddress = await factory.getPair(this.TokenA.address, this.TokenB.address)

            if (poolAddress === unhandled) {
                console.log(" - swap - ? pair doesnt exist ? - ")
                this.tempStore.poolAddress = null
                return
            }
            this.tempStore.poolAddress = poolAddress

            const pool = new ethers.Contract(poolAddress, PoolABI, provider)

            //get bidAsk and maybe depth
            const bidAsk = await pool.getBidAsk()
            this.bidAsk[0] = ethers.utils.formatEther(bidAsk._bid)
            this.bidAsk[1] = ethers.utils.formatEther(bidAsk._ask)

            //find which is token0
            const token0 = await pool.token0()
            this.token0Index = this.ABTokens.findIndex((el) => el.address === token0)

            this.showPrice = true
        },
    },
    computed: {
        ...mapStores(useStepStore, useTempStore),
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
                function Round(amt) {
                    let amount = Number(amt)
                    amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
                    return amount === "NaN" || Number(amount) === 0 ? "" : String(parseFloat(amount))
                }
                if (
                    (this.lastChangedToken === 0 && String(this.sellAmount).length === 0) ||
                    (this.lastChangedToken === 1 && String(this.buyAmount).length === 0)
                ) {
                    return ["", ""]
                }
                if (this.lastChangedToken === 0) {
                    if (this.tokenToSell === this.token0) {
                        this.buyAmount = Round(this.sellAmount * this.bidAsk[0])
                    } else {
                        this.buyAmount = Round(this.sellAmount / this.bidAsk[1])
                    }
                } else {
                    if (this.tokenToSell === this.token0) {
                        this.sellAmount = Round(this.buyAmount / this.bidAsk[0])
                    } else {
                        this.sellAmount = Round(this.buyAmount * this.bidAsk[1])
                    }
                }
                return [this.sellAmount || "", this.buyAmount || ""]
            },
            //unneccessary, can be moved where amountInputs are st
            set(newValue) {
                this.sellAmount = newValue[0]
                this.buyAmount = newValue[1]
            },
        },
        price() {
            if (this.showPrice) {
                let price = this.tokenToSell === this.token0 ? this.bidAsk[0] : 1 / Number(this.bidAsk[1])
                price = Number(price) > 1 ? Number(price).toFixed(2) : Number(price).toPrecision(2)
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
        switchedBalance: {
            get() {
                const list = [this.balanceA, this.balanceB]
                return !Boolean(this.tokenToSellIndex) ? list : list.reverse()
            },
        },
        isConnectingStyle() {
            return this.connecting ? "connecting" : ""
        },
        token0Style() {
            const list = ["token0", null]
            if (this.token0Index !== null) {
                return this.switchedTokens[0] === this.token0 ? list : list.reverse()
            } else {
                return [null, null]
            }
        },
        isMountedStyle() {
            return !this.alreadyMounted ? "" : "transitions"
        },
        activeWalletCallback() {
            // watch callback when wallet changes
            return this.stepStore.activeWallet
        },
    },
    mounted() {
        this.alreadyMounted = true
    },
    created() {
        this.TokenA = getToken(this.defaultTokenASymbol)
        this.TokenB = getToken(this.defaultTokenBSymbol)
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
    border-radius: var(--outer-wdg-radius);
    box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px;
    /* box-shadow: rgba(0, 0, 0, 0.05) 0px 13px 35px -5px, rgba(0, 0, 0, 0.15) 0px 8px 22px -8px; */
    /* box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px; */
    padding: 0.6rem;
    padding-top: 6rem;
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

    .wrap {
        display: flex;
        flex-direction: column;
        > div {
            &.amount {
                /* display: flex; */
                background-color: var(--swap-windows);
                transition: background-color var(--transition);

                &__input {
                    position: relative;
                    width: 100%;
                    height: 8rem;
                    border-radius: 14px;
                    position: relative;
                    &.transitions {
                        transition: all var(--transition);
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
                            /* font-weight: bold; */
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
                        p {
                            font-size: 1.4rem;
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
