import { ref } from "vue"
import { ethers } from "ethers"
import { storeToRefs } from "pinia"
import { useStepStore } from "@/stores/step"

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

export function useBalances(providerArg) {
    // I will return object that contains
    //      {
    //          "address": balance
    //      }

    const balances = ref({})
    const stepStore = useStepStore()
    const { connectedAccount, connectedWallet } = storeToRefs(stepStore)

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

    async function getBalance(token) {
        const provider = new ethers.BrowserProvider(providerArg)
        const tokenContract = new ethers.Contract(token.address, TokenABI, provider)
        const balance = await tokenContract.balanceOf(connectedAccount.value)
        const formatedBalance = ethers.formatUnits(balance, token.decimals)
        return formatedBalance
    }

    async function getTotalSupply(address) {
        const provider = new ethers.BrowserProvider(providerArg)
        const tokenContract = new ethers.Contract(address, TokenABI, provider)
        const totalSupply = await tokenContract.totalSupply()
        const formatedTotalSupply = ethers.formatEther(totalSupply)
        return formatedTotalSupply
    }

    return { updateBalance, getBalance, getTotalSupply }
}

export function usePools(routerAddress) {
    const bidAsk = ref(null)
    const baseTokenAddress = ref(null)
    const poolRatio = ref(null)
    const liquidityTokenBalance = ref(null)
    const lpTotalSupply = ref(null)
    const thisReserve = ref(null)
    const thatReserve = ref(null)

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
                // console.log("found!", res)
                console.log("found!")
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

        const thisAmount = ethers.formatEther(await pool.thisRegisteredBalance())
        const thatAmount = ethers.formatEther(await pool.thatRegisteredBalance())

        thisReserve.value = Number(thisAmount)
        thatReserve.value = Number(thatAmount)

        poolRatio.value = Number(thatAmount) / Number(thisAmount)

        const thisToken = await pool.thisToken()
        baseTokenAddress.value = thisToken

        const lpToken = await pool.lpToken()
        console.log("lpToken:", lpToken)

        const { getBalance, getTotalSupply } = useBalances(providerArg)
        liquidityTokenBalance.value = await getBalance({ address: lpToken, decimals: 18 })

        lpTotalSupply.value = await getTotalSupply(lpToken)
    }

    async function addLiquidity(addressA, addressB, amountA, amountB, providerArg) {
        const provider = new ethers.BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const router = new ethers.Contract(routerAddress, RouterABI, signer)
        // check allowance if its enought
        // do
        const parsedAmountA = ethers.parseEther(amountA)
        const parsedAmountB = ethers.parseEther(amountB)

        const blockTimestamp = (await provider.getBlock("latest")).timestamp
        const deadline = blockTimestamp + 360
        // const approve1 =
        await approveSpending(addressA, parsedAmountA, signer)
        // const approve2 =
        await approveSpending(addressB, parsedAmountB, signer)

        await router
            .addLiquidity(addressA, addressB, parsedAmountA, parsedAmountB, deadline)
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
        // Promise.all([approve1, approve2, poolAction]).catch((err) => {
        // Promise.all([poolAction]).catch((err) => {
        //     console.log(err)
        // })
    }

    async function redeemLiquidity() {}

    async function approveSpending(tokenAddress, amount, signer) {
        const erc20 = new ethers.Contract(tokenAddress, TokenABI, signer)
        await erc20.approve(routerAddress, amount).then((res) => {
            console.log("it reslved the approval")
        })
    }

    return {
        bidAsk,
        thisReserve,
        thatReserve,
        baseTokenAddress,
        poolRatio,
        getPoolInfo,
        getBidAsk,
        lpTotalSupply,
        liquidityTokenBalance,
        redeemLiquidity,
        bidAskFormat,
        avgPrice,
        addLiquidity,
        waitingForAdding,
        approveSpending,
        iterations,
    }
}
