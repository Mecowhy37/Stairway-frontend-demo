import { parseUnits, formatUnits } from "ethers"
import { roundCeiling, roundFloor, widgetTypeObj, tkEnum, precision } from "~/helpers/index"

export function useAmounts(Tokens, pool, widgetType) {
    const userAmounts = reactive({
        quote: "",
        base: "",
    })
    const fullAmounts = reactive({
        quote: 0n,
        base: 0n,
    })

    const fullAmountsMap = computed(() => {
        return [fullAmounts.quote, fullAmounts.base]
    })
    const lastChangedAmount = ref(0)
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

        event.target.value = cleanedInput
        lastChangedAmount.value = inputIndex

        //this is potentially separate function that is used in fillInBalance
        setUserAmount(cleanedInput, inputIndex)
        if (Tokens.value[inputIndex]) {
            setFromUserToFullAmount(cleanedInput, Tokens.value[inputIndex].decimals, inputIndex)
        }
    }
    //Two following functions I will use for handling an event when token is picked
    function setFromUserToFullAmount(amount, decimals, inputIndex) {
        if (amount === "" || amount === ".") {
            amount = "0"
        }

        const fullAmount = parseUnits(amount, decimals)
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
            stringAmount = roundCeiling(formatUnits(amount, decimals))
        } else if (widgetType === widgetTypeObj.swap) {
            console.log("setFromFullToUserAmount(): ", "setting - ", getInputLabel(inputIndex))
            if (inputIndex === tkEnum.QUOTE) {
                const quoteAmount = roundCeiling(formatUnits(amount, decimals))
                stringAmount = quoteAmount
                console.log("setFromFullToUserAmount(): ", "Ceil rounding -", quoteAmount)
            } else if (inputIndex === tkEnum.BASE) {
                const baseAmount = roundFloor(formatUnits(amount, decimals))
                stringAmount = baseAmount
                console.log("setFromFullToUserAmount(): ", "Floor rounding -", baseAmount)
            }
        }
        console.log("- - - - - - - - - - - - - - - - -")
        stringAmount = stringAmount === "0" ? "" : stringAmount
        setUserAmount(stringAmount, inputIndex)
        return stringAmount
    }
    function calcAndSetOpposingInput(fullAmount, inputIndex, baseReserves, quoteReserves, price) {
        console.log("calcAndSetOpposingInput() - calculating -", getInputLabel(oppositeInput(inputIndex)))

        console.log("calcAndSetOpposingInput() - provided amount:", fullAmount)
        const calculatedInput = calculateFollowingInput(fullAmount, inputIndex, baseReserves, quoteReserves, price)
        console.log("calcAndSetOpposingInput() - calculated:", calculatedInput)
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

    function calculateFollowingInput(inputAmount, inputIndex, baseBalance, quoteBalance, price) {
        if (widgetType === widgetTypeObj.add) {
            if (inputIndex === tkEnum.QUOTE) {
                const quoteAmount = inputAmount
                return (quoteAmount * baseBalance) / quoteBalance
            } else if (inputIndex === tkEnum.BASE) {
                const baseAmount = inputAmount
                return (baseAmount * quoteBalance) / baseBalance
            }
        } else if (widgetType === widgetTypeObj.swap) {
            // these also - SWAP
            if (inputIndex === tkEnum.QUOTE) {
                return calcBase(inputAmount, price)
            } else if (inputIndex === tkEnum.BASE) {
                return calcQuote(inputAmount, price)
            }
        }
    }
    function calcBase(quoteInputed, price) {
        return (quoteInputed * precision) / price
    }
    function calcQuote(baseInputed, price) {
        return (baseInputed * price + precision - 1n) / precision
    }
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
        fullAmountsMap,
        lastChangedAmount,
        amountsLabelOrder,
        getInputLabel,
        oppositeInput,
        amountInputHandler,
        setUserAmount,
        setFromUserToFullAmount,
        setFromFullToUserAmount,
        calcAndSetOpposingInput,
        bothAmountsIn,
        calcQuote,
        resetAmounts,
        cleanInput,
        switchAmounts,
        prettyPrint,
        isCleanInput,
    }
}
