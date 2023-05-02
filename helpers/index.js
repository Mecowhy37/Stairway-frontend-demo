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
    const thisReserve = ref(null)
    const thatReserve = ref(null)
    const poolRatio = ref(null)
    const lpTokenAddress = ref(null)
    const liquidityTokenBalance = ref(null)
    const lpTotalSupply = ref(null)

    const interval = ref()
    const iterations = ref(0)
    const waitingForAdding = ref(false)
    const waitingBidAsk = ref(false)

    const bidAskFormat = computed(() => {
        return bidAsk.value !== null ? bidAsk.value.map((el) => ethers.formatEther(el)) : []
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
                // console.log("err is here ", err)

                resetPool()

                if (err.reason === "DEX__PoolNotFound()") {
                    console.log("not found", err)
                    return null
                }
            })
        const factoryAddress = await router.factory()
        const factory = new ethers.Contract(factoryAddress, FactoryABI, provider)
        const allPools = await factory.getAllPools()
        console.log("allPools:", allPools)
    }

    async function getPoolInfo(addressA, addressB, providerArg) {
        const provider = new ethers.BrowserProvider(providerArg)
        const router = new ethers.Contract(routerAddress, RouterABI, provider)

        const factoryAddress = await router.factory()
        const factory = new ethers.Contract(factoryAddress, FactoryABI, provider)

        const poolAddress = await factory.getPool(addressA, addressB)
        const pool = new ethers.Contract(poolAddress, PoolABI, provider)

        const thisAmount = ethers.formatEther(await pool.thisRegisteredBalance())
        // console.log("thisAmount:", thisAmount)
        const thatAmount = ethers.formatEther(await pool.thatRegisteredBalance())
        // console.log("thatAmount:", thatAmount)

        thisReserve.value = Number(thisAmount)
        thatReserve.value = Number(thatAmount)

        poolRatio.value = Number(thatAmount) / Number(thisAmount)

        const thisToken = await pool.thisToken()
        baseTokenAddress.value = thisToken

        const lpToken = await pool.lpToken()
        lpTokenAddress.value = lpToken

        const { getBalance, getTotalSupply } = useBalances(providerArg)
        const bal = await getBalance({ address: lpToken, decimals: 18 })
        liquidityTokenBalance.value = bal

        lpTotalSupply.value = await getTotalSupply(lpToken)
    }

    async function addLiquidity(addressA, addressB, amountA, amountB, slippage, deadline, recipient, providerArg) {
        const provider = new ethers.BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const router = new ethers.Contract(routerAddress, RouterABI, signer)
        // check allowance if its enought
        // do
        const parsedAmountA = ethers.parseEther(amountA)
        const parsedAmountB = ethers.parseEther(amountB)
        console.log("parsedAmountB:", parsedAmountB)
        const parsedMinAmountA = ethers.parseEther(String(amountA - (amountA * slippage) / 100))
        const parsedMinAmountB = ethers.parseEther(String(amountB - (amountB * slippage) / 100))
        console.log("parsedMinAmountB:", parsedMinAmountB)

        const blockTimestamp = (await provider.getBlock("latest")).timestamp
        const deadlineStamp = blockTimestamp + deadline * 60

        // await router
        // .addLiquidity(
        //     addressA,
        //     addressB,
        //     parsedMinAmountA,
        //     parsedAmountA,
        //     parsedMinAmountB,
        //     parsedAmountB,
        //     recipient,
        //     deadlineStamp
        // )
        // .then(async (res) => {
        //     // console.log("res", res)
        //     waitingForAdding.value = true
        //     getBidAsk(addressA, addressB, providerArg).then(() => {
        //         if (bidAsk.value === null) {
        //             interval.value = setInterval(() => {
        //                 if (bidAsk.value === null) {
        //                     iterations.value++
        //                     getBidAsk(addressA, addressB, providerArg, true)
        //                 } else {
        //                     waitingForAdding.value = false
        //                     clearInterval(interval.value)
        //                     console.log("pool is found after " + iterations.value / 2 + " seconds")
        //                 }
        //             }, 500)
        //         } else {
        //             console.log("immediately")
        //             waitingForAdding.value = false
        //         }
        //     })
        // })
        // .catch((err) => {
        //     console.log(" - pool - couldnt create pool - ")
        //     waitingForAdding.value = false
        //     console.log(err)
        //     return null
        // })
    }

    async function checkAllowance(tokenAddress, owner, spender, providerArg) {
        try {
            const provider = new ethers.BrowserProvider(providerArg)
            const token = new ethers.Contract(tokenAddress, TokenABI, provider)
            const allowance = await token.allowance(owner, spender)
            return allowance
        } catch (err) {
            return err
        }
    }

    function resetPool() {
        bidAsk.value = null
        baseTokenAddress.value = null
        thisReserve.value = null
        thatReserve.value = null
        poolRatio.value = null
        lpTokenAddress.value = null
        liquidityTokenBalance.value = null
        lpTotalSupply.value = null
    }

    async function redeemLiquidity(redeemProcent, providerArg) {
        if (lpTokenAddress.value && liquidityTokenBalance.value) {
            const provider = new ethers.BrowserProvider(providerArg)
            const signer = await provider.getSigner()
            const router = new ethers.Contract(routerAddress, RouterABI, signer)
            const amount = ethers.parseEther(liquidityTokenBalance.value)
            const amountFraction = `${(amount * BigInt(redeemProcent)) / BigInt(100)}`
            const blockTimestamp = (await provider.getBlock("latest")).timestamp
            const deadline = blockTimestamp + 360

            try {
                await approveSpending(lpTokenAddress.value, amountFraction, signer)
                await router
                    .redeemLiquidity(lpTokenAddress.value, amountFraction, deadline)
                    .then((res) => {
                        console.log(res)
                    })
                    .catch((err) => {
                        console.error("redeem error: ", err)
                    })
            } catch (err) {
                console.log("err i  her: ", err)
            }
            // Promise.all([approval, redeeming]).catch((err) => {
            //     console.log(err)
            // })
        }
    }

    async function approveSpending(tokenAddress, signer) {
        const erc20 = new ethers.Contract(tokenAddress, TokenABI, signer)
        const maxUint = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
        const tx = await erc20.approve(routerAddress, maxUint)
        const receipt = await tx.wait(1)
        return
    }

    return {
        bidAsk,
        thisReserve,
        thatReserve,
        baseTokenAddress,
        poolRatio,
        getPoolInfo,
        getBidAsk,
        checkAllowance,
        lpTotalSupply,
        liquidityTokenBalance,
        redeemLiquidity,
        bidAskFormat,
        addLiquidity,
        waitingForAdding,
        approveSpending,
        iterations,
        resetPool,
        redeemLiquidity,
    }
}
