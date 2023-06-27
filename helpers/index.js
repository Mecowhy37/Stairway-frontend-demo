import { ref } from "vue"
import { BrowserProvider, Contract, parseEther, formatEther, formatUnits } from "ethers"

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

export function useBalances() {
    async function getTokenBalance() {
        console.log("getTokenBalance()")
    }

    async function getTotalSupply(address, providerArg) {
        console.log("getTotalSupply()")
    }

    return { getTokenBalance, getTotalSupply }
}

export function usePools(routerAddress) {
    const bidAsk = ref(null)
    const poolAddress = ref("")
    const thisTokenAddress = ref(null)
    const thisReserve = ref(null)
    const thatReserve = ref(null)
    const poolRatio = ref(null)
    const poolDepth = ref(null)
    const lpTokenAddress = ref(null)
    const liquidityTokenBalance = ref(null)
    const lpTotalSupply = ref(null)
    const interval = ref()
    const iterations = ref(0)
    const waitingForAdding = ref(false)
    const waitingBidAsk = ref(false)

    const bidAskFormat = computed(() => {
        return bidAsk.value !== null ? bidAsk.value.map((el) => Number(formatEther(el))) : []
    })
    const bidAskDisplay = computed(() => {
        return bidAskFormat
            ? bidAskFormat.value.map((el) => (el >= 1 ? el.toFixed(2) : el < 0.0001 ? "<0.0001" : el.toPrecision(3)))
            : []
    })

    async function getBidAsk() {
        console.log("getting bidAsk")
        // bidAsk.value = bidAskVar
        // poolDepth.value = depth
    }
    async function findPool(addressA, addressB) {
        console.log("findPool()")
        // poolAddress.value = poolAdd
        // return poolAdd
    }

    // async function findPool(addressA, addressB) {
    //     console.log("find pool")

    //     const url = `https://api.stairway.fi/pool/${addressA}/${addressB}`
    //     // const url = `https://api.stairway.fi/pool/0x70997970C51812dc3A010C7d01b50e0d17dc79C8/0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
    //     const response = await $fetch(url)
    //     console.log("response:", response)
    //     const data = await response.json()
    //     console.log("data:", data)
    // }

    //     const url = `https://api.stairway.fi/pool/${tokenAddresses[0]}/${tokenAddresses[1]}`
    //     const response = await $fetch(url)
    //     console.log("response:", response)
    //     const data = await response.json()
    //     console.log("data:", data)

    async function setupPool(poolAdd, tokenAddresses, providerArg, wallet) {
        console.log("setup")
        const provider = new BrowserProvider(providerArg)
        const router = new Contract(routerAddress, RouterABI, provider)
        const pool = new Contract(poolAdd, PoolABI, provider)

        // BID_ASK
        const bidAskVar = await router.getBidAsk(...tokenAddresses)

        // DEPTH
        const depth = formatEther(await router.getDepth(...tokenAddresses))

        // THIS TOKEN
        const thisToken = await pool.thisToken()

        // RESERVES & RATIO
        const thisAmount = formatEther(await pool.thisBalance())
        const thatAmount = formatEther(await pool.thatBalance())

        // LIQUIDITY TOKEN
        const lpToken = await pool.lpToken()

        // LQ TOKEN BALANCE
        const { getTokenBalance, getTotalSupply } = useBalances()
        const bal = await getTokenBalance({ address: lpToken, decimals: 18 }, wallet, providerArg)

        // LQ TOKEN SUPPLY
        const totalSupply = await getTotalSupply(lpToken, providerArg)

        bidAsk.value = bidAskVar
        thisTokenAddress.value = thisToken
        thisReserve.value = Number(thisAmount)
        thatReserve.value = Number(thatAmount)
        poolRatio.value = Number(thatAmount) / Number(thisAmount)
        poolDepth.value = Number(depth)
        lpTokenAddress.value = lpToken
        liquidityTokenBalance.value = bal
        lpTotalSupply.value = totalSupply
    }

    const poolShare = computed(() => {
        return liquidityTokenBalance.value && lpTotalSupply.value
            ? (Number(liquidityTokenBalance.value) / Number(lpTotalSupply.value)) * 100
            : null
    })

    // async function approveSpending(tokenAddress, provider) {
    async function approveSpending(tokenAddress, providerArg, amount, callback = false) {
        const provider = new BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const erc20 = new Contract(tokenAddress, TokenABI, signer)
        const maxUint = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
        const quantity = amount === 0 ? maxUint : amount
        const tx = await erc20.approve(routerAddress, quantity)
        await tx.wait(1)
        return await listenForTransactionMine(tx, provider, callback)
    }
    function listenForTransactionMine(txRes, provider, callback = false) {
        console.log(`Mining ${txRes.hash}...`)
        return new Promise((resolve, reject) => {
            provider.once(txRes.hash, async (txReciept) => {
                if (callback !== false) {
                    callback()
                }
                resolve()
                console.log("Done!")
            })
        })
    }
    async function checkAllowance(tokenAddress, owner, spender, providerArg) {
        try {
            const provider = new BrowserProvider(providerArg)
            const token = new Contract(tokenAddress, TokenABI, provider)
            const allowance = await token.allowance(owner, spender)
            return allowance
        } catch (err) {
            return err
        }
    }

    async function addLiquidity(addressA, addressB, amountA, amountB, slippage, deadline, recipient, providerArg) {
        const provider = new BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const router = new Contract(routerAddress, RouterABI, signer)

        const parsedAmountA = parseEther(amountA)
        const parsedAmountB = parseEther(amountB)
        const parsedMinAmountA = parseEther(String(amountA - (amountA * slippage) / 100))
        const parsedMinAmountB = parseEther(String(amountB - (amountB * slippage) / 100))

        const blockTimestamp = (await provider.getBlock("latest")).timestamp
        const deadlineStamp = blockTimestamp + deadline * 60

        try {
            const allowanceA = await checkAllowance(addressA, signer.address, routerAddress, providerArg)
            const needApprovalA = allowanceA < parsedAmountA

            const allowanceB = await checkAllowance(addressB, signer.address, routerAddress, providerArg)
            const needApprovalB = allowanceB < parsedAmountB

            if (needApprovalA || needApprovalB) {
                const approvalPromises = []

                if (needApprovalA) {
                    approvalPromises.unshift(approveSpending(addressA, providerArg, 0))
                    // approvalPromises.unshift(approveSpending(addressA, providerArg, parsedAmountA))
                }

                if (needApprovalB) {
                    approvalPromises.unshift(approveSpending(addressB, providerArg, 0))
                    // approvalPromises.unshift(approveSpending(addressB, providerArg, parsedAmountB))
                }

                await Promise.all(approvalPromises)
            }

            await router.addLiquidity(
                addressA,
                addressB,
                parsedMinAmountA,
                parsedAmountA,
                parsedMinAmountB,
                parsedAmountB,
                recipient,
                deadlineStamp
            )
        } catch (error) {
            console.log("Failed to add liquidity:", error)
        }
    }

    async function redeemLiquidity(tokenA, tokenB, redeemPercent, connectedAccount, deadline, providerArg) {
        console.log("redeemLiquidity()")

        // await setupPool(poolAddress.value, [tokenA, tokenB], providerArg, connectedAccount)
        // if (poolShare.value) {
        //     try {
        //         const provider = new BrowserProvider(providerArg)
        //         const signer = await provider.getSigner()
        //         const router = new Contract(routerAddress, RouterABI, signer)

        //         const tokenList = [tokenA, tokenB]
        //         const orderedTokens = tokenA === thisTokenAddress.value ? tokenList : tokenList.reverse()

        //         const amount0 = parseEther(String((thisReserve.value * poolShare.value * redeemPercent) / 10000))
        //         const amount1 = parseEther(String((thatReserve.value * poolShare.value * redeemPercent) / 10000))
        //         const lqAmount = parseEther(String((liquidityTokenBalance.value * redeemPercent) / 100))

        //         const blockTimestamp = (await provider.getBlock("latest")).timestamp
        //         const deadlineStamp = blockTimestamp + deadline * 60

        //         await approveSpending(lpTokenAddress.value, providerArg, lqAmount)
        //         await router.redeemLiquidity(
        //             ...orderedTokens,
        //             amount0,
        //             amount1,
        //             lqAmount,
        //             connectedAccount,
        //             deadlineStamp
        //         )
        //     } catch (err) {
        //         console.log("failed to redeem liquidity: ", err)
        //     }
        // }
    }

    async function swap(tokens, amounts, maxPrice, account, deadline, providerArg) {
        // address, address, desiredAmount, maxPrice, recepient, deadline
        console.log("swap()")
        // const provider = new BrowserProvider(providerArg)
        // const signer = await provider.getSigner()
        // const router = new Contract(routerAddress, RouterABI, signer)

        // const blockTimestamp = (await provider.getBlock("latest")).timestamp
        // const deadlineStamp = blockTimestamp + deadline * 60

        // const allowance = await checkAllowance(tokens[1], signer.address, routerAddress, providerArg)
        // const needApproval = allowance < amounts[0]
        // if (needApproval) {
        //     await approveSpending(tokens[1], providerArg, amounts[0])
        // }

        // await router.buy(...tokens, amounts[1], maxPrice, account, deadlineStamp)
    }
    function resetPool() {
        bidAsk.value = null
        thisTokenAddress.value = ""
        thisReserve.value = null
        thatReserve.value = null
        poolRatio.value = null
        lpTokenAddress.value = null
        liquidityTokenBalance.value = null
        lpTotalSupply.value = null
    }

    return {
        bidAsk,
        getBidAsk,
        poolAddress,
        thisReserve,
        thatReserve,
        thisTokenAddress,
        lpTokenAddress,
        poolRatio,
        poolDepth,
        findPool,
        poolShare,
        setupPool,
        checkAllowance,
        lpTotalSupply,
        liquidityTokenBalance,
        swap,
        addLiquidity,
        redeemLiquidity,
        bidAskFormat,
        bidAskDisplay,
        waitingForAdding,
        approveSpending,
        iterations,
        resetPool,
        redeemLiquidity,
        listenForTransactionMine,
    }
}
