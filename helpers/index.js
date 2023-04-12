import { ref } from "vue"
import { ethers } from "ethers"

import * as Tokens from "../constants/tokenList.json"
const TokenList = Tokens.default

import * as Router from "../ABIs/DEX.json"
const RouterABI = Router.default

import * as Factory from "../ABIs/Factory.json"
const FactoryABI = Factory.default

import * as Token from "../ABIs/ERC20.json"
const TokenABI = Token.default

import * as Pool from "../ABIs/Pool.json"
const PoolABI = Pool.default

const unhandled = "0x0000000000000000000000000000000000000000"
const routerAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"

export function getToken(symb) {
    return TokenList.find((el) => el.symbol === symb)
}

export function useBalances() {
    // I will return object that contains
    //      {
    //          "address": balance
    //      }

    const balances = ref({})

    function updateBalance(newVal, oldVal) {
        // console.log(
        //     "old: ",
        //     oldVal.map((el) => el?.symbol || null)
        // )
        // console.log(
        //     "new: ",
        //     newVal.map((el) => el?.symbol || null)
        // )
    }

    async function getBalance(provider) {
        // const provider = new ethers.BrowserProvider(provider)
        // const tokenContract = new ethers.Contract(token.address, TokenABI, provider)
        // const balance = await tokenContract.balanceOf(this.stepStore.getConnectedAccount)
        // const formatedBalance = ethers.formatUnits(balance, token.decimals)
    }

    return { updateBalance }

    //     const balanceA = ref(null)
    //     const balanceB = ref(null)
    //     const loading = ref(false)
}

// export function usePools() {
//     this function should store
// }

export function usePools(routerAddress) {
    const bidAsk = ref(null)
    const baseTokenAddress = ref(null)
    const poolRatio = ref(null)

    const interval = ref()
    const iterations = ref(0)
    const waitingForAdding = ref(false)
    const waitingBidAsk = ref(false)

    const bidAskFormat = computed(() => {
        return bidAsk.value !== null ? bidAsk.value.map((el) => ethers.formatEther(el)) : []
    })
    const avgPrice = computed(() => {
        return bidAskFormat.value !== null
            ? `${(Number(bidAskFormat.value[0]) + Number(bidAskFormat.value[1])) / 2}`
            : null
    })

    async function getBidAsk(addressA, addressB, providerArg, continuous = false) {
        console.log("looking for pool(bidAsk)...")
        const provider = new ethers.BrowserProvider(providerArg)
        const router = new ethers.Contract(routerAddress, RouterABI, provider)
        await router
            .getBidAsk(addressA, addressB)
            .then((res) => {
                console.log("found!", res)
                bidAsk.value = [res[0], res[1]]
                getPoolInfo(addressA, addressB, providerArg)
                return res
            })
            .catch((err) => {
                if (err.reason === "DEX__PoolNotFound()") {
                    console.log("not found")
                    bidAsk.value = null
                    baseTokenAddress.value = null
                    poolRatio.value = null
                    return null
                }
            })
    }

    async function getPoolInfo(addressA, addressB, providerArg) {
        const provider = new ethers.BrowserProvider(providerArg)
        const router = new ethers.Contract(routerAddress, RouterABI, provider)

        const factoryAddress = await router.factory()
        const factory = new ethers.Contract(factoryAddress, FactoryABI, provider)

        const poolAddress = await factory.getPool(addressA, addressB)
        const pool = new ethers.Contract(poolAddress, PoolABI, provider)

        const thisReserv = await pool.thisRegisteredBalance()
        const thatReserv = await pool.thatRegisteredBalance()

        console.log("this reserv: ", ethers.formatEther(thisReserv))
        console.log("that reserv: ", ethers.formatEther(thatReserv))

        const ratio = Number(thatReserv) / Number(thisReserv)
        poolRatio.value = ratio
        console.log("ratio:", ratio)

        const thisToken = await pool.thisToken()
        baseTokenAddress.value = thisToken
        console.log("thisToken:", thisToken)
    }

    async function addLiquidity(addressA, addressB, amountA, amountB, providerArg) {
        const provider = new ethers.BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const router = new ethers.Contract(routerAddress, RouterABI, signer)
        // check allowance if its enought
        // do
        const parsedAmountA = ethers.parseEther(amountA)
        const parsedAmountB = ethers.parseEther(amountB)

        const approve1 = await approveSpending(addressA, parsedAmountA, signer)
        const approve2 = await approveSpending(addressB, parsedAmountB, signer)
        Promise.all([approve1, approve2]).catch((err) => {
            console.log(err)
        })

        await router
            .addLiquidity(addressA, addressB, parsedAmountA, parsedAmountB)
            .then(async (res) => {
                // console.log("res", res)
                waitingForAdding.value = true
                getBidAsk(addressA, addressB, providerArg).then(() => {
                    if (bidAsk.value === null) {
                        interval.value = setInterval(() => {
                            if (bidAsk.value === null) {
                                iterations.value++
                                getBidAsk(addressA, addressB, providerArg, true)
                            } else {
                                waitingForAdding.value = false
                                clearInterval(interval.value)
                                console.log("pool is found after " + iterations.value / 2 + " seconds")
                            }
                        }, 500)
                    } else {
                        console.log("immediately")
                        waitingForAdding.value = false
                    }
                })
            })
            .catch((err) => {
                console.log(" - pool - couldnt create pool - ")
                waitingForAdding.value = false
                console.log(err)
                return null
            })
    }

    async function approveSpending(tokenAddress, amount, signer) {
        const erc20 = new ethers.Contract(tokenAddress, TokenABI, signer)
        await erc20.approve(routerAddress, amount).then((res) => {
            // console.log('approval: ', res)
        })
    }

    return {
        bidAsk,
        baseTokenAddress,
        poolRatio,
        getBidAsk,
        bidAskFormat,
        avgPrice,
        addLiquidity,
        waitingForAdding,
        approveSpending,
        iterations,
    }
}
