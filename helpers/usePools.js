import { BrowserProvider, Contract, parseUnits, getAddress } from "ethers"
import {
    decodeCustomError,
    isSupportedChain,
    getUrl,
    listenForTransactionMine,
    tkEnum,
    precision,
} from "~/helpers/index"

import { dummyPools } from "~/helpers/DummyData"

import router from "@/ABIs/IDEX.json"
const RouterABI = router.abi

import token from "@/ABIs/IERC20.json"
const TokenABI = token.abi

export async function usePools(routerAddress, Tokens, connectedAccount, connectedChainId, route) {
    const {
        data: pool,
        error: poolError,
        status: poolStatus,
        pending: poolPending,
        refresh: refreshPool,
    } = await useAsyncData(
        "pool" + Tokens.value[tkEnum.BASE],
        async () => {
            const bothThere = Tokens.value.every((el) => el !== null)
            if (Tokens.value[tkEnum.BASE].address === Tokens.value[tkEnum.QUOTE].address) {
                return
            }
            if (isSupportedChain(connectedChainId.value) && bothThere) {
                // return $fetch(
                //     getUrl(
                //         `/chain/${connectedChainId.value}/pool/${Tokens.value[tkEnum.BASE].address}/${
                //             Tokens.value[tkEnum.QUOTE].address
                //         }`
                //     )
                // )
                const pool = await poolObtainer()
                const returnPool = { ...pool }
                if (Tokens.value[tkEnum.QUOTE].symbol === "WMATIC") {
                    returnPool.price = "4017000000000000000"
                    // returnPool.price = "186563184260000000"
                }

                return returnPool
            } else {
                return null
            }
        },
        {
            lazy: true,
            watch: [Tokens, connectedChainId],
            immediate: true,
            default: () => null,
        }
    )

    async function poolObtainer() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject("pool failed")
                return
                resolve(dummyPools)
            }, 1000)
        })
    }

    const poolRatio = computed(() => {
        if (!pool.value) {
            return null
        }

        return (BigInt(pool.value.base_reserves) * precision) / BigInt(pool.value.quote_reserves)
    })
    const price = computed(() => {
        if (!pool.value) {
            return null
        }

        return pool.value.price
    })
    const depth = computed(() => {
        if (!pool.value) {
            return null
        }

        return pool.value.depth
    })

    function addLiquidity(
        tokenQuote,
        tokenBase,
        amountQuote,
        amountBase,
        slippage,
        deadline,
        recipient,
        providerArg,
        transactionErrorHandler,
        eventReceivedHandler,
        notify,
        widgetLocker,
        successData = null,
        notifId = null
    ) {
        return new Promise(async (resolve, reject) => {
            let notifHolder = { id: notifId }
            const provider = new BrowserProvider(providerArg)
            const signer = await provider.getSigner()
            const router = new Contract(routerAddress.value, RouterABI, signer)

            const parsedSlippage = (parseUnits(slippage.toString(), 18) / BigInt(100)).toString()
            const blockTimestamp = (await provider.getBlock("latest")).timestamp
            const deadlineStamp = blockTimestamp + deadline * 60

            // approvals try catch
            try {
                const tokens = [
                    { token: tokenQuote, amount: amountQuote },
                    { token: tokenBase, amount: amountBase },
                ]
                let errorOccured = false
                for (const { token, amount } of tokens) {
                    if (await checkAllowance(token.address, amount, signer.address)) {
                        try {
                            await approveSpending(token, amount, providerArg, false, notify, notifHolder)
                        } catch (error) {
                            errorOccured = true
                            break
                        }
                    }
                }
                if (errorOccured) {
                    throw new Error("An error occurred inside the loop.")
                }
            } catch (error) {
                notify(notifHolder, "error")
                reject(error)
                return
            }

            // adding tx try catch
            try {
                console.log(" - - - - -a d d L Q- - - - - - ")
                console.log("tokenQuote.address:", getAddress(tokenQuote.address))
                console.log("tokenBase.address:", getAddress(tokenBase.address))
                console.log("amountQuote:", amountQuote.toString())
                console.log("amountBase:", amountBase.toString())
                console.log("parsedSlippage:", parsedSlippage)
                console.log("recipient:", recipient)
                console.log("deadlineStamp:", deadlineStamp)

                notify(notifHolder, "sign")

                const tx = await router.addLiquidity(
                    getAddress(tokenQuote.address),
                    getAddress(tokenBase.address),
                    amountQuote,
                    amountBase,
                    parsedSlippage,
                    getAddress(recipient),
                    deadlineStamp
                )

                // unlock the widget
                widgetLocker(false)
                notify(notifHolder, "pending")

                // console.log("sent AddLQ tx:", tx, "...waiting 1 block")
                console.log("sent AddLQ tx:", tx)

                const originalCall = {
                    tokenQuote,
                    tokenBase,
                    amountQuote,
                    amountBase,
                    slippage,
                    deadline,
                    recipient,
                    providerArg,
                    transactionErrorHandler,
                    eventReceivedHandler,
                    notify,
                    widgetLocker,
                    successData,
                    notifId,
                }

                waitForLiquidityEvent(tx, deadlineStamp, provider)
                    .then((lqEvent) => {
                        resolve()
                        eventReceivedHandler(lqEvent, originalCall, notifHolder)
                    })
                    .catch((error) => {
                        notify(notifHolder, "error", error)
                        reject("Failed to add liquidity " + error)
                    })
            } catch (error) {
                if (error.data) {
                    const failCause = decodeCustomError(error.data)
                    console.log("Failed to add lq:", failCause)
                    notify(notifHolder, "error", failCause)
                    return
                }
                notify(notifHolder, "error")
                reject("Failed to add liquidity " + error)
            }
        }).catch((error) => {
            transactionErrorHandler(error)
        })
    }

    function redeemLiquidity(
        tokenQuote,
        tokenBase,
        lpToken,
        amountQuote,
        amountBase,
        lpAmount,
        slippage,
        deadline,
        providerArg,
        transactionErrorHandler,
        eventReceivedHandler,
        notify,
        widgetLocker,
        successData = null,
        notifId = null
    ) {
        return new Promise(async (resolve, reject) => {
            let notifHolder = { id: notifId }
            const provider = new BrowserProvider(providerArg)
            const signer = await provider.getSigner()
            const router = new Contract(routerAddress.value, RouterABI, signer)

            const parsedSlippage = (parseUnits(slippage.toString(), 18) / BigInt(100)).toString()
            const blockTimestamp = (await provider.getBlock("latest")).timestamp
            const deadlineStamp = blockTimestamp + deadline * 60

            try {
                if (await checkAllowance(lpToken.address, lpAmount, signer.address)) {
                    try {
                        await approveSpending(lpToken, lpAmount, providerArg, false, notify, notifHolder)
                    } catch (error) {
                        throw new Error("failed to approve spending")
                    }
                }
            } catch (error) {
                notify(notifHolder, "error")
                reject(error)
                return
            }

            try {
                console.log(" - - - - -r e m o v e L Q- - - - - - ")
                console.log("qoute token:", tokenQuote.symbol, tokenQuote.address)
                console.log("base token:", tokenBase.symbol, tokenBase.address)
                console.log("amount Quote:", amountQuote.toString())
                console.log("amount Base:", amountBase.toString())
                console.log("lpAmount:", lpAmount.toString())
                console.log("connectedAccount:", connectedAccount.value)
                console.log("deadlineStamp:", deadlineStamp)
                console.log("parsedSlippage:", parsedSlippage)

                notify(notifHolder, "sign")

                const tx = await router.redeemLiquidity(
                    getAddress(tokenQuote.address),
                    getAddress(tokenBase.address),
                    amountQuote.toString(),
                    amountBase.toString(),
                    lpAmount.toString(),
                    getAddress(connectedAccount.value),
                    deadlineStamp,
                    parsedSlippage
                )
                // unlock the widget
                widgetLocker(false)
                notify(notifHolder, "pending")

                console.log("sent RemoveLQ tx:", tx)

                const originalCall = {
                    tokenQuote,
                    tokenBase,
                    lpToken,
                    amountQuote,
                    amountBase,
                    lpAmount,
                    slippage,
                    deadline,
                    providerArg,
                    transactionErrorHandler,
                    eventReceivedHandler,
                    notify,
                    widgetLocker,
                    successData,
                    notifId,
                }

                waitForLiquidityEvent(tx, deadlineStamp, provider)
                    .then((lqEvent) => {
                        resolve()
                        eventReceivedHandler(lqEvent, originalCall, notifHolder)
                    })
                    .catch((error) => {
                        notify(notifHolder, "error", error)
                        reject("Failed to redeem liquidity " + error)
                    })
            } catch (error) {
                if (error.data) {
                    const failCause = decodeCustomError(error.data)
                    console.log("failed to redeem liquidity: ", failCause)
                    notify(notifHolder, "error", failCause)
                    // reject("Failed to redeem liquidity " + failCause)
                    return
                }
                notify(notifHolder, "error")
                reject("Failed to redeem liquidity " + error)
            }
        }).catch((error) => {
            transactionErrorHandler(error)
        })
    }

    function swap(
        path,
        amountQuote,
        amountBase,
        maxPrice,
        account,
        deadline,
        providerArg,
        swapFailedHandler,
        eventReceivedHandler,
        notify,
        widgetLocker
    ) {
        return new Promise(async (resolve, reject) => {
            let notifHolder = { id: null }
            const provider = new BrowserProvider(providerArg)
            const signer = await provider.getSigner()
            const router = new Contract(routerAddress.value, RouterABI, signer)

            const blockTimestamp = (await provider.getBlock("latest")).timestamp
            const deadlineStamp = blockTimestamp + deadline * 60

            const tokenPath = path.map((el) => {
                el.address = getAddress(el.address)
                return el
            })
            const tokenPathAddresses = tokenPath.map((el) => el.address)

            try {
                console.log(" - - - - allowance - - - - - ")
                const tokenQuote = path[tkEnum.QUOTE]
                if (await checkAllowance(tokenQuote.address, amountQuote, signer.address)) {
                    try {
                        await approveSpending(tokenQuote, amountQuote, providerArg, false, notify, notifHolder)
                    } catch (error) {
                        throw new Error("Failed to approve spending" + error)
                    }
                }
            } catch (error) {
                notify(notifHolder, "error")
                reject(error)
                return
            }

            try {
                console.log(" - - - - -s w a p- - - - - - ")
                tokenPath.forEach((token, index) => {
                    console.log("path token -", index + 1, "-", token.symbol, token.address)
                })
                console.log("desiredAmountOut:", amountBase.toString())
                console.log("maxPrice:", maxPrice.toString())
                console.log("account:", account)
                console.log("deadlineStamp:", deadlineStamp)

                notify(notifHolder, "sign")

                const tx = await router.buy(
                    tokenPathAddresses,
                    amountBase.toString(),
                    maxPrice.toString(),
                    getAddress(account),
                    "0xe3a2fb3cC3A8F9ca2987cb193931544Aa72951d6",
                    deadlineStamp
                )

                widgetLocker(false)
                notify(notifHolder, "pending")

                console.log("buy tx:", tx)
                const originalCall = {
                    tokenQuote: path[tkEnum.QUOTE],
                    tokenBase: path[path.length - 1],
                }

                waitForLiquidityEvent(tx, deadlineStamp, provider)
                    .then((lqEvent) => {
                        eventReceivedHandler(lqEvent, originalCall, notifHolder)
                    })
                    .catch((error) => {
                        notify(notifHolder, "error", error)
                        reject("Failed to swap " + error)
                    })
            } catch (error) {
                if (error.data) {
                    const failCause = decodeCustomError(error.data)
                    console.log("Failed to swap:", failCause)
                    notify(notifHolder, "error", failCause)
                    reject("Failed to swap " + failCause)
                    return
                }
                notify(notifHolder, "error")
                reject("Failed to swap " + error)
            }
        }).catch((error) => {
            swapFailedHandler(error)
        })
    }

    function waitForLiquidityEvent(tx, deadline, provider) {
        return new Promise(async (resolve, reject) => {
            // ASYNC LOOP WAITING FOR EVENT
            const eventPingLoop = async () => {
                console.log("eventPingLoop()")
                // API QUERY
                const lqEvent = await $fetch(getUrl(`/chain/${connectedChainId.value}/events/${tx.hash}/liquidity`))

                try {
                    await checkForTransactionStatus(tx.hash, provider)
                } catch (error) {
                    reject(error)
                    return
                }

                if (lqEvent) {
                    console.log("lqEvent:", lqEvent)
                    resolve(lqEvent)
                } else {
                    // NO event yet
                    const currentTimestampInSeconds = Math.floor(Date.now() / 1000)
                    if (currentTimestampInSeconds < deadline) {
                        await new Promise((resolve) => setTimeout(resolve, 1000))

                        // Call the loop again
                        eventPingLoop()
                    } else {
                        reject("Deadline exceeded")
                        // return
                    }
                }
            }

            eventPingLoop()
        })
    }

    async function checkForTransactionStatus(txHash, provider) {
        return new Promise((resolve, reject) => {
            provider
                .getTransactionReceipt(txHash)
                .then((receipt) => {
                    if (receipt) {
                        console.log("receipt.status:", receipt.status)
                        if (receipt.status === 0) {
                            reject("Receipt status 0")
                            return
                        }
                    } else {
                        console.log("Transaction not mined yet")
                    }
                    resolve()
                })
                .catch((error) => {
                    console.error("error in checkForTransactionStatus", error)
                    reject("error in checkForTransactionStatus" + error)
                })
        })
    }

    async function approveSpending(token, amount, providerArg, callback = false, notify, notifHolder) {
        console.log("approve token:", token)
        const provider = new BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const erc20 = new Contract(token.address, TokenABI, signer)
        const maxUint = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
        const quantity = amount === 0 ? maxUint : amount
        notify(notifHolder, "approve", token.symbol)
        try {
            const tx = await erc20.approve(routerAddress.value, quantity)
            console.log("tx:", tx, "...waiting 1 block")
            await tx.wait(1)
            return await listenForTransactionMine(tx, provider, callback)
        } catch (error) {
            throw new Error("approveSpending():" + error)
        }
    }

    async function checkAllowance(tokenAddress, tokenAmount, owner) {
        try {
            const allowance = await $fetch(
                getUrl(`/chain/${connectedChainId.value}/user/${owner}/approved/${tokenAddress}`)
            )

            console.log("tokenAddress:", tokenAddress)
            console.log("allowance:", BigInt(allowance))
            console.log("tokenAmount:", tokenAmount)
            console.log("BigInt(allowance) < tokenAmount:", BigInt(allowance) < tokenAmount)
            return BigInt(allowance) < tokenAmount
        } catch (error) {
            throw new Error("checkAllowance(): " + error)
        }
    }

    return {
        pool,
        poolError,
        poolStatus,
        poolPending,
        poolRatio,
        refreshPool,
        price,
        depth,
        addLiquidity,
        redeemLiquidity,
        swap,
        checkAllowance,
    }
}
