<template>
    <div class="widget">
        <div class="wrap">
            <div
                v-for="(i, x) in new Array(2)"
                class="amount amount__input"
                :class="[token0Style[x], isMountedStyle]"
            >
                <label
                    for="amount_1"
                    @click="openTokenSelectModal($event, x)"
                >
                    <h3 v-if="switchedTokens[x] !== null">
                        {{ switchedTokens[x].symbol }}
                    </h3>
                    <h3 v-else>select token</h3>
                    <!-- <br /> -->
                    <!-- <p v-if="switchedBalance[x] !== null">balance: {{ switchedBalance[x] }}</p> -->
                </label>
                <input
                    type="number"
                    :id="'amount_' + x + 1"
                    :name="'amount_' + x + 1"
                    placeholder="0"
                    @input="setTokenAmount($event.target.value, x)"
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
                    :class="{ 'show-rate': showRate }"
                >
                    {{ rate }}
                </div>
            </div>
            <div
                v-if="stepStore.activeWallet === null"
                @click="stepStore.connectWalletAction"
                class="connect"
            >
                <h3>connect</h3>
            </div>
            <div
                v-else
                @click="swap()"
                class="connect"
            >
                <h3>swap</h3>
                {{ x }}
            </div>
            <Teleport to="#base">
                <SelectTokenModal
                    ref="tokenModal"
                    :switched-tokens="switchedTokens"
                    @tokenSelected="setToken($event)"
                ></SelectTokenModal>
            </Teleport>
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
import { useStepStore } from "@/stores/step"
import { useTempStore } from "@/stores/temp"
import { mapStores } from "pinia"
import { ethers } from "ethers"

import { getToken } from "~/helpers/index"

// import * as Factory from "../ABIs/factoryAbi.json"
// const FactoryABI = Factory.default

// import * as Pool from "../ABIs/poolAbi.json"
// const PoolABI = Pool.default

// import * as Token from "../ABIs/tokenAbi.json"
// const TokenABI = Token.default

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
            defaultTokenASymbol: "WBTC",
            selectTokenIndex: 0,
            showRate: false,
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
                this.showRate = false
                this.token0Index = null
                return
            }

            // try {
            //     this.setupPool()
            // } catch (err) {
            //     console.log(err)
            // }
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
        openTokenSelectModal(event, index) {
            this.$refs.tokenModal.toggleTokenModal(event)
            this.setSelectTokenIndex(index)
        },
        setSelectTokenIndex(index) {
            this.selectTokenIndex = index
        },
        setToken(token) {
            this.switchedTokens = this.switchedTokens.map((el) =>
                this.switchedTokens.indexOf(el) === this.selectTokenIndex ? token : el
            )
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

            this.showRate = true
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
        rate() {
            if (this.showRate) {
                let rate = this.tokenToSell === this.token0 ? this.bidAsk[0] : 1 / Number(this.bidAsk[1])
                rate = Number(rate) > 1 ? Number(rate).toFixed(2) : Number(rate).toPrecision(2)
                return `1 ${this.switchedTokens[0].symbol} = ${rate} ${this.switchedTokens[1].symbol}`
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
            // if (this.token0Index !== null) {
            //     return this.switchedTokens[0] === this.token0 ? list : list.reverse()
            // } else {
            //     return [null, null]
            // }
            return this.tokenToSellIndex === 0 ? list : list.reverse()
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
    },
}
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
    /* box-shadow: rgba(0, 0, 0, 0.05) 0px 13px 35px -5px, rgba(0, 0, 0, 0.15) 0px 8px 22px -8px; */
    /* box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px; */
    /* padding: 0.6rem; */
    /* padding-top: 6rem; */
    padding: 0.5rem;
    padding-top: 4rem;
    .wrap {
        display: flex;
        flex-direction: column;
        > div {
            &.amount {
                background-color: var(--swap-windows);
                transition: background-color var(--transition);

                &__input {
                    display: flex;
                    align-items: center;
                    position: relative;
                    width: 100%;
                    height: 5.5rem;
                    border-radius: var(--inner-wdg-radius);
                    &.transitions {
                        &,
                        * {
                            transition-property: all;
                            transition-duration: var(--transition);
                        }
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
                    label {
                        flex-shrink: 0;
                        margin: 0 1.2rem;
                        cursor: pointer;
                        p {
                            font-size: 1.4rem;
                        }
                    }
                    &.token0 {
                        height: 7rem;
                    }

                    &:nth-of-type(2) {
                        margin-top: 0.5rem;
                    }
                }
            }

            &.connect {
                --height: 3.5rem;
                background-color: var(--primary-btn-bg);
                transition: background-color var(--transition);
                height: var(--height);
                text-align: center;
                margin-top: 0.5rem;
                border-radius: var(--inner-wdg-radius);
                cursor: pointer;
                h3 {
                    line-height: var(--height);
                    display: inline-block;
                    height: 100%;
                    color: var(--primary-btn-color);
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
