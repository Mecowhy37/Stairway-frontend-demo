import { Interface } from "ethers"

import router from "@/ABIs/IDEX.json"
const RouterABI = router.abi
export const errorABI = new Interface(RouterABI).fragments

import token from "@/ABIs/IERC20.json"
const TokenABI = token.abi

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

export function roundCeiling(stringAmount) {
    return parseFloat(parseFloat(stringAmount).toPrecision(5)).toString()
}
export function roundFloor(stringAmount) {
    return parseFloat(toFixedFloor(stringAmount, 4)).toString()
}
export function toFixedFloor(stringAmount, fixed) {
    let re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?")
    return stringAmount.match(re)[0]
}

export function isSupportedChain(id) {
    return id === 31337 || id === 80001 || id === 137
}

export function getOutsiderToken(chainId, tkAddress) {
    return $fetch(getUrl(`/chain/${chainId}/tokens/${tkAddress}`))
}

export function decodeCustomError(errorData) {
    for (const abiEntry of errorABI) {
        if (abiEntry.type === "error") {
            try {
                const iface = new Interface([abiEntry])
                console.log("iface:", iface)
                const decodedData = iface.decodeErrorResult(abiEntry, errorData)
                return abiEntry.name
            } catch (e) {}
        }
    }
    console.log("Unknown error data.", errorData)
    return false
}

export function listenForTransactionMine(txRes, provider, callback = null) {
    console.log(`waiting for tx mine: ${txRes.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(txRes.hash, async (txReciept) => {
            resolve()
            console.log("tx mined txReciept.hash:", txReciept)
            if (typeof callback === "function") {
                callback()
            }
            console.log("- - - - - - - - - - - - - - - - -")
        })
    })
}

export const widgetTypeObj = {
    swap: "swap",
    add: "add",
}
