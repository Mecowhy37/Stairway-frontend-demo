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
    async function getTokenBalance(token, wallet, providerArg) {
        const provider = new BrowserProvider(providerArg)
        const tokenContract = new Contract(token.address, TokenABI, provider)
        const balance = await tokenContract.balanceOf(wallet)
        const formatedBalance = formatUnits(balance, token.decimals)
        return formatedBalance
    }

    async function getTotalSupply(address, providerArg) {
        const provider = new BrowserProvider(providerArg)
        const tokenContract = new Contract(address, TokenABI, provider)
        const totalSupply = await tokenContract.totalSupply()
        const formatedTotalSupply = formatEther(totalSupply)
        return formatedTotalSupply
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
    const bidAskDisplayReverse = computed(() => {
        return bidAskFormat
            ? bidAskFormat.value.map((el) =>
                  Number(1 / el) >= 1
                      ? Number(1 / el).toFixed(2)
                      : Number(1 / el) < 0.0001
                      ? "<0.0001"
                      : Number(1 / el).toPrecision(3)
              )
            : []
    })

    async function findPool(addressA, addressB, providerArg) {
        const provider = new BrowserProvider(providerArg)
        const router = new Contract(routerAddress, RouterABI, provider)
        const factoryAdd = await router.factory()
        const factory = new Contract(factoryAdd, FactoryABI, provider)
        const poolAdd = await factory.getPool(addressA, addressB)

        poolAddress.value = poolAdd
        return poolAdd
    }

    async function getBidAsk(tokenAddresses, providerArg) {
        const provider = new BrowserProvider(providerArg)
        const router = new Contract(routerAddress, RouterABI, provider)
        const bidAskVar = await router.getBidAsk(...tokenAddresses)
        const depth = formatEther(await router.getDepth(...tokenAddresses))
        bidAsk.value = bidAskVar
        poolDepth.value = depth
        return
    }

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
        await setupPool(poolAddress.value, [tokenA, tokenB], providerArg, connectedAccount)
        if (poolShare.value) {
            try {
                const provider = new BrowserProvider(providerArg)
                const signer = await provider.getSigner()
                const router = new Contract(routerAddress, RouterABI, signer)

                const tokenList = [tokenA, tokenB]
                const orderedTokens = tokenA === thisTokenAddress.value ? tokenList : tokenList.reverse()

                const amount0 = parseEther(String((thisReserve.value * poolShare.value * redeemPercent) / 10000))
                const amount1 = parseEther(String((thatReserve.value * poolShare.value * redeemPercent) / 10000))
                const lqAmount = parseEther(String((liquidityTokenBalance.value * redeemPercent) / 100))

                const blockTimestamp = (await provider.getBlock("latest")).timestamp
                const deadlineStamp = blockTimestamp + deadline * 60

                await approveSpending(lpTokenAddress.value, providerArg, lqAmount)
                await router.redeemLiquidity(
                    ...orderedTokens,
                    amount0,
                    amount1,
                    lqAmount,
                    connectedAccount,
                    deadlineStamp
                )
            } catch (err) {
                console.log("failed to redeem liquidity: ", err)
            }
        }
    }

    async function swap(tokens, amounts, maxPrice, account, deadline, providerArg) {
        // address, address, desiredAmount, maxPrice, recepient, deadline
        const provider = new BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const router = new Contract(routerAddress, RouterABI, signer)

        const blockTimestamp = (await provider.getBlock("latest")).timestamp
        const deadlineStamp = blockTimestamp + deadline * 60

        const allowance = await checkAllowance(tokens[1], signer.address, routerAddress, providerArg)
        const needApproval = allowance < amounts[0]
        if (needApproval) {
            await approveSpending(tokens[1], providerArg, amounts[0])
        }

        await router.buy(...tokens, amounts[1], maxPrice, account, deadlineStamp)
    }

    let currentFactoryContract = null
    async function setPoolCreationListener(providerArg) {
        if (providerArg === false) {
            if (currentFactoryContract) {
                console.log("FACTORY - turn off 'poolCreated'")
                currentFactoryContract.off("PoolCreated")
                currentFactoryContract = null
            }
            return
        }
        const provider = new BrowserProvider(providerArg)
        const router = new Contract(routerAddress, RouterABI, provider)
        const factoryAdd = await router.factory()
        const newFactoryContract = new Contract(factoryAdd, FactoryABI, provider)
        return new Promise((resolve, reject) => {
            if (currentFactoryContract) {
                console.log("FACTORY - removing 'poolCreated'")
                currentFactoryContract.off("PoolCreated", creationHandler)
            }

            console.log("FACTORY - listening for 'poolCreated'")
            newFactoryContract.on("PoolCreated", creationHandler)

            function creationHandler(thisToken, thatToken, newPoolAddress) {
                console.log("FACTORY - pool created:", newPoolAddress)

                newFactoryContract.off("PoolCreated", creationHandler)
                currentFactoryContract = null

                resolve([thisToken, thatToken, newPoolAddress])
            }
            currentFactoryContract = newFactoryContract
        })
    }

    let currentPoolContracts = []
    function setLiquidityChangeListener(providerArg, poolAdd = false) {
        if (providerArg === false) {
            console.log("POOL - turn off all listeners")
            currentPoolContracts.forEach((el) => el.off("LiquidityChange"))
            currentPoolContracts = []
            return
        }
        const provider = new BrowserProvider(providerArg)
        const addressToContract = !poolAdd ? poolAddress.value : poolAdd
        const newPoolContract = new Contract(addressToContract, PoolABI, provider)
        const currentPoolMap = currentPoolContracts.map((el) => el && el.target)

        return new Promise((resolve, reject) => {
            if (currentPoolMap.includes(newPoolContract.target)) {
                console.log("POOL - pool already listening")
                return
            }

            console.log("POOL - listening for 'liquidityChange'")
            newPoolContract.on("LiquidityChange", liquidityHandler)
            currentPoolContracts.push(newPoolContract)

            function liquidityHandler(beneficiary, thisIn, thatIn, thisOut, thatOut, contract) {
                const poolAdd = contract.emitter.target
                console.log("POOL - liqudity changed in: ", poolAdd)

                newPoolContract.off("LiquidityChange", liquidityHandler)
                currentPoolContracts = currentPoolContracts.filter((el) => el.target !== newPoolContract.target)

                resolve([beneficiary, thisIn, thatIn, thisOut, thatOut, poolAdd])
            }
        })
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
        bidAskDisplayReverse,
        waitingForAdding,
        approveSpending,
        iterations,
        resetPool,
        redeemLiquidity,
        setPoolCreationListener,
        setLiquidityChangeListener,
        listenForTransactionMine,
    }
}
