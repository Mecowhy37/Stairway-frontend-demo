import { ref } from "vue"
import { BrowserProvider, Contract, parseUnits, formatUnits, formatEther, parseEther } from "ethers"
import Web3 from "web3"

import router from "@/ABIs/IDEX.json"
const RouterABI = router.abi

import token from "@/ABIs/IERC20.json"
const TokenABI = token.abi

import poolmanager from "@/ABIs/IPoolManager.json"
const PoolManagerABI = poolmanager.abi

const unhandled = "0x0000000000000000000000000000000000000000"

export const tkEnum = {
    QUOTE: 0,
    BASE: 1,
}

export const precision = BigInt(10) ** BigInt(18)

export function getToken(symb) {
    return TokenList.find((el) => el.symbol === symb)
}

export function getUrl(endpoint) {
    const api = "https://api.stairway.fi"
    return api + endpoint
}
export function basicRound(amt) {
    let amount = Number(amt)
    amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
    return String(parseFloat(amount))
}

export function isSupportedChain(id) {
    return id === 31337 || id === 80001 || id === 137
}

export function listenForTransactionMine(txRes, provider, callback = null) {
    console.log(`Mining ${txRes.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(txRes.hash, async (txReciept) => {
            if (typeof callback === "function") {
                callback()
            }
            resolve()
            console.log("Done!")
        })
    })
}

export function usePools(routerAddress, Tokens, connectedAccount, connectedChainId) {
    const {
        data: pool,
        error: poolError,
        status: poolStatus,
        pending: poolPending,
        refresh: refreshPool,
    } = useAsyncData(
        "pool",
        () => {
            const bothThere = Tokens.value.every((el) => el !== null)

            if (bothThere && connectedAccount.value && isSupportedChain(connectedChainId.value)) {
                console.log("usePools - fetchingPool()")
                return $fetch(
                    getUrl(
                        `/chain/${connectedChainId.value}/pool/${Tokens.value[0].address}/${Tokens.value[1].address}`
                    )
                )
            }
        },
        {
            watch: [connectedChainId],
        }
    )

    // watch: [Tokens, connectedChainId],

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

    async function addLiquidity(
        tokenQuote,
        tokenBase,
        amountQuote,
        amountBase,
        slippage,
        deadline,
        recipient,
        providerArg
    ) {
        const provider = new BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const router = new Contract(routerAddress.value, RouterABI, signer)

        const parsedSlippage = (parseUnits(slippage.toString(), 18) / BigInt(100)).toString()
        const blockTimestamp = (await provider.getBlock("latest")).timestamp
        const deadlineStamp = blockTimestamp + deadline * 60

        try {
            const allowanceQuote = await checkAllowance(
                tokenQuote.address,
                signer.address,
                routerAddress.value,
                providerArg
            )
            const quoteNeedsApproval = allowanceQuote < amountQuote

            const allowanceBase = await checkAllowance(
                tokenBase.address,
                signer.address,
                routerAddress.value,
                providerArg
            )
            const baseNeedsApproval = allowanceBase < amountBase

            if (quoteNeedsApproval || baseNeedsApproval) {
                const approvalPromises = []

                if (quoteNeedsApproval) {
                    approvalPromises.unshift(approveSpending(tokenQuote.address, providerArg, 0))
                    // approvalPromises.unshift(approveSpending(addressA, providerArg, parsedAmountQuote))
                }

                if (baseNeedsApproval) {
                    approvalPromises.unshift(approveSpending(tokenBase.address, providerArg, 0))
                    // approvalPromises.unshift(approveSpending(addressB, providerArg, parsedAmountBase))
                }

                await Promise.all(approvalPromises)
            }
        } catch (error) {
            console.log("Failed to get approvals:", error)
        }
        try {
            console.log("VALUES")
            console.log("---------------------------------")
            console.log("tokenQuote.address:", Web3.utils.toChecksumAddress(tokenQuote.address))
            console.log("tokenBase.address:", Web3.utils.toChecksumAddress(tokenBase.address))
            console.log("amountQuote:", amountQuote.toString())
            console.log("amountBase:", amountBase.toString())
            console.log("parsedSlippage:", parsedSlippage)
            console.log("recipient:", recipient)
            console.log("deadlineStamp:", deadlineStamp)
            await router.addLiquidity(
                Web3.utils.toChecksumAddress(tokenQuote.address),
                Web3.utils.toChecksumAddress(tokenBase.address),
                amountQuote.toString(),
                amountBase.toString(),
                parsedSlippage,
                Web3.utils.toChecksumAddress(recipient),
                deadlineStamp
            )
        } catch (error) {
            console.log("Failed to add lq:", error)
        }
    }

    async function redeemLiquidity(
        tokenA,
        tokenB,
        pooledA,
        pooledB,
        redeemPercent,
        lpToken,
        lpAmount,
        deadline,
        providerArg
    ) {
        try {
            const provider = new BrowserProvider(providerArg)
            const signer = await provider.getSigner()
            const router = new Contract(routerAddress.value, RouterABI, signer)

            const tokenList = [tokenA, tokenB].map((el) => el.address)

            const amount0 = calcPercentage(pooledA)
            const amount1 = calcPercentage(pooledB)
            const lpAmountParsed = calcPercentage(lpAmount)

            function calcPercentage(amount) {
                // temporary fix - bad browser support
                return String((BigInt(amount) * BigInt(redeemPercent)) / BigInt(100))
            }

            const blockTimestamp = (await provider.getBlock("latest")).timestamp
            const deadlineStamp = blockTimestamp + deadline * 60

            const allowance = await checkAllowance(lpToken.address, signer.address, routerAddress.value, providerArg)
            const needApproval = allowance < lpAmountParsed
            if (needApproval) {
                await approveSpending(lpToken.address, providerArg, lpAmountParsed)
            }

            console.log("REDEEMING")
            console.log(tokenList)
            console.log(amount0)
            console.log(amount1)
            console.log(lpAmountParsed)
            console.log(connectedAccount.value)
            console.log(deadlineStamp)
            await router.redeemLiquidity(
                Web3.utils.toChecksumAddress(tokenList[0]),
                Web3.utils.toChecksumAddress(tokenList[1]),
                amount0,
                amount1,
                lpAmountParsed,
                Web3.utils.toChecksumAddress(connectedAccount.value),
                deadlineStamp,
                "100000000000000000"
            )
        } catch (err) {
            console.log("failed to redeem liquidity: ", err)
        }
    }

    async function swap(tokenQuote, tokenBase, amountQuote, amountBase, maxPrice, account, deadline, providerArg) {
        const provider = new BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const router = new Contract(routerAddress.value, RouterABI, signer)

        const blockTimestamp = (await provider.getBlock("latest")).timestamp
        const deadlineStamp = blockTimestamp + deadline * 60

        const allowance = await checkAllowance(tokenQuote.address, signer.address, routerAddress.value, providerArg)
        const needApproval = allowance < amountQuote
        if (needApproval) {
            await approveSpending(tokenQuote.address, providerArg, amountQuote)
        }

        console.log(" - - - - -s w a p- - - - - - ")
        console.log("base token:", tokenBase.symbol, tokenBase.address)
        console.log("qoute token:", tokenQuote.symbol, tokenQuote.address)
        console.log("desired_base_amount:", amountBase.toString())
        console.log("max-price:", maxPrice.toString())
        console.log("account:", account)
        console.log("deadlineStamp:", deadlineStamp)
        await router.buy(
            tokenBase.address,
            tokenQuote.address,
            amountBase.toString(),
            maxPrice.toString(),
            account,
            deadlineStamp
        )
    }

    async function approveSpending(tokenAddress, providerArg, amount, callback = false) {
        const provider = new BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const erc20 = new Contract(tokenAddress, TokenABI, signer)
        const maxUint = "115792089237316195423570985008687907853269984665640564039457584007913129639935"
        const quantity = amount === 0 ? maxUint : amount
        const tx = await erc20.approve(routerAddress.value, quantity)
        await tx.wait(1)
        return await listenForTransactionMine(tx, provider, callback)
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

        // approveSpending,
        // listenForTransactionMine,
        // checkAllowance,
    }
}

export function useTokens() {
    const tokenA = ref(null)
    const tokenB = ref(null)
    const selectTokenIndex = ref(0)

    const Tokens = computed({
        get() {
            return [tokenA.value, tokenB.value]
        },
        set(newValue) {
            tokenA.value = newValue[0]
            tokenB.value = newValue[1]
        },
    })

    const bothTokensThere = computed(() => Tokens.value.every((el) => el !== null))

    function setToken(token) {
        if (token) {
            const sameTokenIndex = Tokens.value.findIndex((el) => el?.address === token.address)
            if (sameTokenIndex !== -1 && sameTokenIndex !== selectTokenIndex.value) {
                Tokens.value = Tokens.value.reverse()
                return
            }
        }
        Tokens.value = Tokens.value.map((el, index) => (index === selectTokenIndex.value ? token : el))
    }

    return {
        tokenA,
        tokenB,
        Tokens,
        bothTokensThere,
        setToken,
        selectTokenIndex,
    }
}

export function useBalances() {
    async function getTokenBalance(token, account, connectedChainId) {
        if (token === null) {
            return ""
        }
        const { data: balance, error } = await useFetch(
            getUrl(`/chain/${connectedChainId}/user/${account}/balance/${token.address}`)
        )
        if (balance.value) {
            return formatUnits(balance.value, token.decimals)
        }
        if (error.value) {
            console.error("failed to fetch balance", error.value)
            return ""
        }
    }

    return { getTokenBalance }
}
export const widgetTypeObj = {
    swap: "swap",
    add: "add",
}

export function useAmounts(Tokens, pool, lastChangedAmount, widgetType) {
    const userAmounts = reactive({
        quote: "",
        base: "",
    })
    const fullAmounts = reactive({
        quote: 0n,
        base: 0n,
    })
    const amountsLabelOrder = ref(["quote", "base"])
    function getInputLabel(index) {
        return amountsLabelOrder.value[index]
    }
    function oppositeInput(inputIndex) {
        return 1 - inputIndex
    }
    const bothAmountsIn = computed(() => {
        return amountsLabelOrder.value.every((el) => userAmounts[el] !== "")
    })
    function switchAmounts() {
        // Swap userAmounts
        const tempUserQuote = userAmounts.quote
        userAmounts.quote = userAmounts.base
        userAmounts.base = tempUserQuote

        // Swap fullAmounts
        const tempFullQuote = fullAmounts.quote
        fullAmounts.quote = fullAmounts.base
        fullAmounts.base = tempFullQuote
    }
    function amountInputHandler(event, inputIndex) {
        const currentValue = userAmounts[getInputLabel(inputIndex)]
        const newValue = event.target.value

        const cleanedInput = cleanInput(newValue, currentValue)

        setUserAmount(cleanedInput, inputIndex)
        event.target.value = cleanedInput
        lastChangedAmount = inputIndex

        let fullAmount = null
        if (Tokens.value[inputIndex]) {
            fullAmount = setFromUserToFullAmount(cleanedInput, Tokens.value[inputIndex].decimals, inputIndex)
        }
    }
    //Two following functions I will use for handling an event when token is picked
    function setFromUserToFullAmount(amount, decimals, inputIndex) {
        if (amount === "" || amount === ".") {
            amount = "0"
        }

        const fullAmount = parseInputAmount(amount, decimals)
        setFullAmount(fullAmount, inputIndex)

        if (pool.value) {
            calcAndSetOpposingInput(
                fullAmount,
                inputIndex,
                BigInt(pool.value.base_reserves),
                BigInt(pool.value.quote_reserves),
                BigInt(pool.value.price)
            )
        }
        return fullAmount
    }
    function setFromFullToUserAmount(amount, decimals, inputIndex) {
        let stringAmount
        if (widgetType === widgetTypeObj.add) {
            stringAmount = roundCeiling(formatInputAmount(amount, decimals))
        } else if (widgetType === widgetTypeObj.swap) {
            console.log("setFromFullToUserAmount(): ", "setting - ", getInputLabel(inputIndex))
            if (inputIndex === tkEnum.QUOTE) {
                console.log("setFromFullToUserAmount(): ", "rounding - Ceil")
                stringAmount = roundCeiling(formatInputAmount(amount, decimals))
            } else if (inputIndex === tkEnum.BASE) {
                console.log("setFromFullToUserAmount(): ", "rounding - Floor")
                stringAmount = roundFloor(formatInputAmount(amount, decimals))
            }
        }
        stringAmount = stringAmount === "0" ? "" : stringAmount
        setUserAmount(stringAmount, inputIndex)
        return stringAmount
    }
    function calcAndSetOpposingInput(fullAmount, inputIndex, baseReserves, quoteReserves, price) {
        console.log("calcAndSetOpposingInput() - calculating -", getInputLabel(oppositeInput(inputIndex)))

        const calculatedInput = calculateFollowingInput(fullAmount, inputIndex, baseReserves, quoteReserves, price)
        const calculatedInputIndex = oppositeInput(inputIndex)

        setFullAmount(calculatedInput, calculatedInputIndex)
        setFromFullToUserAmount(calculatedInput, Tokens.value[calculatedInputIndex].decimals, calculatedInputIndex)
    }

    function setUserAmount(amount, inputIndex) {
        userAmounts[getInputLabel(inputIndex)] = amount
    }
    function setFullAmount(amount, inputIndex) {
        fullAmounts[getInputLabel(inputIndex)] = amount
    }
    function resetAmounts(inputIndex) {
        console.log("resetAmounts(): ", getInputLabel(inputIndex))
        setUserAmount("", inputIndex)
        setFullAmount(0n, inputIndex)
    }
    function parseInputAmount(amount, decimals) {
        return parseUnits(amount, decimals)
        // return BigInt(parseUnits(amount, decimals))
    }
    function formatInputAmount(amount, decimals) {
        return formatUnits(amount, decimals)
    }
    function calculateFollowingInput(inputAmount, inputIndex, baseBalance, quoteBalance, price) {
        if (widgetType === widgetTypeObj.add) {
            if (inputIndex === tkEnum.QUOTE) {
                return (inputAmount * quoteBalance) / baseBalance
            } else if (inputIndex === tkEnum.BASE) {
                return (inputAmount * baseBalance) / quoteBalance
            }
        } else if (widgetType === widgetTypeObj.swap) {
            if (inputIndex === tkEnum.QUOTE) {
                return calcBase(inputAmount, price)
            } else if (inputIndex === tkEnum.BASE) {
                return calcQuote(inputAmount, price)
            }
        }
    }
    function calcQuote(baseInputed, price) {
        return (baseInputed * price + precision - 1n) / precision
    }
    function calcBase(quoteInputed, price) {
        return (quoteInputed * precision) / price
    }
    // function calcQuote(baseInputed) {
    //     const baseDecim = Tokens.value[tkEnum.BASE].decimals
    //     const baseParsed = BigInt(parseUnits(baseInputed, baseDecim))
    //     const ask = BigInt(price.value)
    //     const quoteAmount = (baseParsed * ask + precision - 1n) / precision
    //     return quoteAmount.toString()
    // }
    // function calcBase(quoteInputed) {
    //     const quoteDecim = Tokens.value[tkEnum.QUOTE].decimals
    //     const quoteParsed = BigInt(parseUnits(quoteInputed, quoteDecim))
    //     const ask = BigInt(price.value)
    //     const baseAmount = (quoteParsed * precision) / ask
    //     return baseAmount.toString()
    // }
    function cleanInput(value, oldValue) {
        // Remove spaces from the input value
        value = value.replace(/\s/g, "")

        // Replace any non-digit, non-dot, non-comma characters with an empty string
        value = value.replace(/[^\d.,]/g, "")

        // Replace commas with dots to handle decimal numbers
        value = value.replace(/,/g, ".")

        let dotCount = value.split(".").length - 1
        // if (dotCount === 2) {

        //bounds for ethers library not to over/under-flow, 2**53 its max uit53 value that JS accepts
        if (dotCount === 2 || value >= 2 ** 53 || (value > 0 && value < 1e-18)) {
            value = oldValue
        }
        // const decimalParts = value.split(".")
        // if (decimalParts.length === 2 && decimalParts[1].length > 18) {
        //     value = oldValue // revert to old value if it has more than 18 decimal points
        // }
        return value
    }
    function roundCeiling(stringAmount) {
        return parseFloat(parseFloat(stringAmount).toPrecision(5)).toString()
    }
    function roundFloor(stringAmount) {
        return parseFloat(toFixedFloor(stringAmount, 4)).toString()
    }
    function toFixedFloor(stringAmount, fixed) {
        let re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?")
        return stringAmount.match(re)[0]
    }
    function isCleanInput(value) {
        // Match any character that's not a digit, dot, or comma, or more than one dot
        if (value.match(/[^\d.,]/) || (value.match(/\./g) || []).length > 1 || value === ".") {
            return false
        }
        return true
    }
    function prettyPrint(amount, tkIndex) {
        if (Tokens.value[tkIndex] === null) {
            return amount
        }
        if (amount === "") {
            return ""
        }
        const decimals =
            tkIndex === tkEnum.BASE ? Tokens.value[tkEnum.BASE].decimals : Tokens.value[tkEnum.QUOTE].decimals

        const fullResult = formatUnits(amount.toString(), decimals)

        if (tkIndex === tkEnum.QUOTE) {
            return roundCeiling(fullResult)
        } else if (tkIndex === tkEnum.BASE) {
            return roundFloor(fullResult)
        }
    }

    return {
        userAmounts,
        fullAmounts,
        amountsLabelOrder,
        getInputLabel,
        oppositeInput,
        amountInputHandler,
        setFromUserToFullAmount,
        calcAndSetOpposingInput,
        bothAmountsIn,
        resetAmounts,
        cleanInput,
        roundCeiling,
        roundFloor,
        switchAmounts,
        prettyPrint,
        isCleanInput,
    }
}
