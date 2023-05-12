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
        const provider = new BrowserProvider(providerArg)
        const tokenContract = new Contract(token.address, TokenABI, provider)
        const balance = await tokenContract.balanceOf(connectedAccount.value)
        const formatedBalance = formatUnits(balance, token.decimals)
        return formatedBalance
    }

    async function getTotalSupply(address) {
        const provider = new BrowserProvider(providerArg)
        const tokenContract = new Contract(address, TokenABI, provider)
        const totalSupply = await tokenContract.totalSupply()
        const formatedTotalSupply = formatEther(totalSupply)
        return formatedTotalSupply
    }

    return { updateBalance, getBalance, getTotalSupply }
}

export function usePools(routerAddress) {
    const bidAsk = ref(null)
    const poolAddress = ref("")
    const baseTokenAddress = ref(null)
    const thisReserve = ref(null)
    const thatReserve = ref(null)
    const poolRatio = ref(null)
    const lpTokenAddress = ref(null)
    const liquidityTokenBalance = ref(null)
    const lpTotalSupply = ref(null)
    const factory = ref()
    const interval = ref()
    const iterations = ref(0)
    const waitingForAdding = ref(false)
    const waitingBidAsk = ref(false)

    const bidAskFormat = computed(() => {
        return bidAsk.value !== null ? bidAsk.value.map((el) => formatEther(el)) : []
    })

    async function findPool(addressA, addressB, providerArg) {
        console.log("findPool")
        const provider = new BrowserProvider(providerArg)
        const router = new Contract(routerAddress, RouterABI, provider)
        const factoryAdd = await router.factory()
        const factory = new Contract(factoryAdd, FactoryABI, provider)
        const poolAdd = await factory.getPool(addressA, addressB)

        poolAddress.value = poolAdd
        return poolAdd
    }

    async function setupPool(poolAdd, tokenAddresses, providerArg) {
        console.log("setup")

        const provider = new BrowserProvider(providerArg)
        const router = new Contract(routerAddress, RouterABI, provider)

        const factoryAddress = await router.factory()
        const factory = new Contract(factoryAddress, FactoryABI, provider)

        const pool = new Contract(poolAdd, PoolABI, provider)

        // BID_ASK
        const bidAskVar = await router.getBidAsk(...tokenAddresses)
        bidAsk.value = bidAskVar

        // BASE TOKEN
        const thisToken = await pool.thisToken()
        baseTokenAddress.value = thisToken

        // RESERVES & RATIO
        const thisAmount = formatEther(await pool.thisRegisteredBalance())
        const thatAmount = formatEther(await pool.thatRegisteredBalance())

        thisReserve.value = Number(thisAmount)
        thatReserve.value = Number(thatAmount)

        poolRatio.value = Number(thatAmount) / Number(thisAmount)

        // LIQUIDITY TOKEN
        const lpToken = await pool.lpToken()
        lpTokenAddress.value = lpToken

        // LQ TOKEN BALANCE
        const { getBalance, getTotalSupply } = useBalances(providerArg)
        const bal = await getBalance({ address: lpToken, decimals: 18 })
        liquidityTokenBalance.value = bal

        // LQ TOKEN SUPPLY
        lpTotalSupply.value = await getTotalSupply(lpToken)
    }

    async function getBidAsk(addressA, addressB, providerArg) {
        const provider = new BrowserProvider(providerArg)
        const router = new Contract(routerAddress, RouterABI, provider)
        await router
            .getBidAsk(addressA, addressB)
            .then((res) => {
                // console.log("found!", res)
                console.log("found!")
                bidAsk.value = [res[0], res[1]]
                findPool(addressA, addressB, providerArg)
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
    }

    async function addLiquidity(addressA, addressB, amountA, amountB, slippage, deadline, recipient, providerArg) {
        const provider = new BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const router = new Contract(routerAddress, RouterABI, signer)
        // check allowance if its enought
        // do
        const parsedAmountA = parseEther(amountA)
        const parsedAmountB = parseEther(amountB)
        const parsedMinAmountA = parseEther(String(amountA - (amountA * slippage) / 100))
        const parsedMinAmountB = parseEther(String(amountB - (amountB * slippage) / 100))

        const blockTimestamp = (await provider.getBlock("latest")).timestamp
        const deadlineStamp = blockTimestamp + deadline * 60

        await router
            .addLiquidity(
                addressA,
                addressB,
                parsedMinAmountA,
                parsedAmountA,
                parsedMinAmountB,
                parsedAmountB,
                recipient,
                deadlineStamp
            )
            .then(async (res) => {
                //listen for liquidity change
                // setPoolCreationListener(addressA, addressB, providerArg)
            })
            .catch((err) => {
                console.log(" - pool - couldnt create pool - ")
                console.log(err)
            })
    }

    async function setPoolCreationListener(providerArg, active = true) {
        const provider = new BrowserProvider(providerArg)
        const router = new Contract(routerAddress, RouterABI, provider)
        const factoryAdd = await router.factory()
        const factory = new Contract(factoryAdd, FactoryABI, provider)
        return new Promise((resolve, reject) => {
            if (active === false) {
                console.log("NOT listening for pool")
                factory.off("PoolCreated", creationHandler)
                return
            }
            console.log("listening for pool")
            factory.once("PoolCreated", creationHandler)

            function creationHandler(thisToken, thatToken, newPoolAddress, extras, extras2, extras3) {
                console.log("extras:", extras)
                console.log("extras2:", extras2)
                console.log("extras3:", extras3)
                console.log("pool created:", newPoolAddress)
                factory.off("PoolCreated", creationHandler)
                resolve([thisToken, thatToken, newPoolAddress])
            }
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

    function resetPool() {
        bidAsk.value = null
        baseTokenAddress.value = ""
        thisReserve.value = null
        thatReserve.value = null
        poolRatio.value = null
        lpTokenAddress.value = null
        liquidityTokenBalance.value = null
        lpTotalSupply.value = null
    }

    async function redeemLiquidity(redeemProcent, providerArg) {
        if (lpTokenAddress.value && liquidityTokenBalance.value) {
            const provider = new BrowserProvider(providerArg)
            const signer = await provider.getSigner()
            const router = new Contract(routerAddress, RouterABI, signer)
            const amount = parseEther(liquidityTokenBalance.value)
            const amountFraction = `${(amount * BigInt(redeemProcent)) / BigInt(100)}`
            const blockTimestamp = (await provider.getBlock("latest")).timestamp
            const deadline = blockTimestamp + 360

            try {
                await approveSpending(lpTokenAddress.value, amountFraction, provider)
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

    // async function approveSpending(tokenAddress, provider) {
    async function approveSpending(tokenAddress, provider, amount, callback = false) {
        const signer = await provider.getSigner()
        const erc20 = new Contract(tokenAddress, TokenABI, signer)
        const maxUint = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
        const tx = await erc20.approve(routerAddress, maxUint)
        // const tx = await erc20.approve(routerAddress, amount)
        const receipt = await tx.wait(1)
        await listenForTransactionMine(tx, provider)
        if (callback !== false) {
            callback()
        }
        console.log("Done!")

        function listenForTransactionMine(txRes, provider) {
            console.log(`Mining ${txRes.hash}...`)
            return new Promise((resolve, reject) => {
                provider.once(txRes.hash, async (txReciept) => {
                    resolve()
                })
            })
        }
        return
    }

    return {
        bidAsk,
        getBidAsk,
        poolAddress,
        thisReserve,
        thatReserve,
        baseTokenAddress,
        poolRatio,
        findPool,
        setupPool,
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
        setPoolCreationListener,
        factory,
    }
}
