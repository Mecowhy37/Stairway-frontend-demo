<template>
    <div class="widget">
        <h3 class="bolder">deposit amounts</h3>
        <div class="window">
            <label for="amount_1">
                <h3 class="bolder">token A</h3>
                <p>balance: 12</p>
            </label>
            <input
                type="number"
                id="amount_1"
                placeholder="0"
                v-model="amountA"
            />
        </div>
        <div id="add-symbol"><h1>+</h1></div>
        <div class="window">
            <label for="amount_2">
                <h3 class="bolder">token B</h3>
                <p>balance: 7</p>
            </label>
            <input
                type="number"
                id="amount_2"
                placeholder="0"
                v-model="amountB"
            />
        </div>
        <!-- <div class="buttons">
                <Btn
                    class="pool"
                    @click="createPair()"
                    wide
                    bulky
                >
                    create pair
                </Btn>
                <Btn
                    class="pool"
                    @click="addLiquidity()"
                    wide
                    bulky
                >
                    add liquidity
                </Btn>
            </div> -->
    </div>
</template>

<script>
import { ethers } from "ethers"

import { useStepStore } from "@/stores/step"
import { useTempStore } from "@/stores/temp"
import { mapStores } from "pinia"

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
            amountA: 1,
            amountB: 30000,
            defaultTokenASymbol: "WBTC",
            defaultTokenBSymbol: "1INCH",
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
    background-color: var(--widget-bg);
    transition: background-color var(--transition);
    width: 500px;
    height: 500px;
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
    &.buttons {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        margin: auto 0;

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
