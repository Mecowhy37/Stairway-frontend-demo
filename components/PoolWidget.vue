<template>
    <div class="widget">
        <div class="wrap">
            <div class="amount amount__input">
                <label for="amount_1">{{ TokenA !== null ? TokenA.symbol : "select token" }}</label>
                <input type="number" id="amount_1" name="amount_1" placeholder="0.00" v-model="amountA" />
            </div>
            <div class="add"><h1>+</h1></div>
            <div class="amount amount__input">
                <label for="amount_1">{{ TokenB !== null ? TokenB.symbol : "select token" }}</label>
                <input type="number" id="amount_1" name="amount_1" placeholder="0.00" v-model="amountB" />
            </div>
            <input type="nuber" v-model="stepSize" />
            <div class="buttons">
                <div class="pool" @click="createPair()">
                    <h3>create pair</h3>
                </div>
                <div class="pool" @click="addLiquidity()">
                    <h3>add liquidity</h3>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ethers } from "ethers"

import { useStepStore } from "@/stores/step"
import { useTempStore } from "@/stores/temp"
import { mapStores } from "pinia"

import { getToken } from "~/helpers/index"

import * as Factory from "../ABIs/factoryAbi.json"
const FactoryABI = Factory.default

import * as Pool from "../ABIs/poolAbi.json"
const PoolABI = Pool.default

import * as Token from "../ABIs/tokenAbi.json"
const TokenABI = Token.default

const unhandled = "0x0000000000000000000000000000000000000000"

export default {
    data() {
        return {
            TokenA: null,
            TokenB: null,
            amountA: 1,
            amountB: 30000,
            defaultTokenASymbol: "MyBTC",
            defaultTokenBSymbol: "MyUSD",
            stepSize: null,
        }
    },
    methods: {
        async createPair() {
            //to do - organise contract instantiation not do do it every function
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const factory = new ethers.Contract(this.stepStore.factoryAddress, FactoryABI, provider.getSigner())
            try {
                await factory
                    .createPair(this.TokenA.address, this.TokenB.address, unhandled, this.stepSize)
                    .then(async (created) => {
                        console.log(" - pool - successfully created pool - ")
                        console.log(created)
                        await factory.getPair(this.TokenA.address, this.TokenB.address).then((res) => {
                            console.log(" - pool - is pool address here yet?")
                            console.log(res)
                        })
                    })
            } catch (err) {
                console.log(" - pool - couldnt create pool - ")
                console.log(err)
            }
        },
        async addLiquidity() {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const poolContract = new ethers.Contract(this.tempStore.poolAddress, PoolABI, provider.getSigner())
            const tkA = new ethers.Contract(this.TokenA.address, TokenABI, provider.getSigner())
            const tkB = new ethers.Contract(this.TokenB.address, TokenABI, provider.getSigner())
            // const tkA = new ethers.Contract(this.TokenA.address, TokenABI, provider)
            // const tkB = new ethers.Contract(this.TokenB.address, TokenABI, provider)

            const amountA = ethers.utils.parseEther(this.amountA.toString())
            const amountB = ethers.utils.parseEther(this.amountB.toString())
            try {
                await tkA.approve(this.tempStore.poolAddress, amountA)
                await tkB.approve(this.tempStore.poolAddress, amountB)
            } catch (err) {
                console.log("- pool - couldnt approve amounts - ")
            }
            try {
                const token0 = await poolContract.token0()
                const AB = [this.TokenA.address, this.TokenB.address]
                const index = AB.indexOf((el) => el === token0)
                const ordered = index === 0 ? [amountA, amountB] : [amountB, amountA]

                await poolContract.addLiquidity(...ordered).then((res) => {
                    console.log(res)
                })
            } catch (err) {
                console.log("- pool - couldnt add liquid - ")
                console.log(err)
            }
        },
    },
    computed: {
        ...mapStores(useStepStore, useTempStore),
    },
    created() {
        this.TokenA = getToken(this.defaultTokenASymbol)
        this.TokenB = getToken(this.defaultTokenBSymbol)
    },
}
</script>

<style lang="scss" scoped>
.widget {
    margin-top: 2rem;
    background-color: var(--swap-bg);
    transition: background-color var(--transition);
    width: 500px;
    height: 400px;
    border-radius: var(--outer-wdg-radius);
    box-shadow: rgba(0, 0, 0, 0.15) 0px 8px 32px;
    padding: 0.6rem;
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
        height: 100%;
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
                    height: 12rem;
                    border-radius: 14px;
                    position: relative;
                    &.transitions {
                        transition: height var(--transition);
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
            &.add {
                text-align: center;
            }
            &.buttons {
                display: flex;
                flex-direction: row;
                gap: 1rem;
                margin: auto 0;

                .pool {
                    --height: 6rem;
                    flex-grow: 1;
                    background-color: var(--swap-main-btn-bg);
                    transition: background-color var(--transition);
                    height: var(--height);
                    border-radius: 12px;
                    text-align: center;
                    cursor: pointer;
                    h3 {
                        line-height: var(--height);
                        color: var(--swap-main-btn-color);
                        transition: color var(--transition);
                    }

                    &.connecting {
                        /* box-shadow: 0 0 2px 3px hotpink inset; */
                    }
                }
            }
        }
    }
}
</style>
