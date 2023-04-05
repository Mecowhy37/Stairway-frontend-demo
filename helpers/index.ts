import { ref } from "vue"
import { ethers } from "ethers"

import * as Tokens from "../constants/tokenList.json"
const TokenList = Tokens.default

import * as Factory from "../ABIs/IFactory.json"
const FactoryABI = Factory.default

const factoryAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
const unhandled = "0x0000000000000000000000000000000000000000"

export function getToken(symb: string) {
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

export function usePools() {
    async function getPool(addressA: string, addressB: string, providerArg) {
        console.log("looking for pool")
        const provider = new ethers.BrowserProvider(providerArg)
        const factory = new ethers.Contract(factoryAddress, FactoryABI, provider)
        const pool = await factory.getPool(addressA, addressB)
        if (pool === unhandled) {
            return null
            // return "xxxx"
        }
        return pool
    }
    return { getPool }
}
