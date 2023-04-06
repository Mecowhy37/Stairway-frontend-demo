import { ref } from "vue"
import { ethers } from "ethers"

import * as Tokens from "../constants/tokenList.json"
const TokenList = Tokens.default

import * as Factory from "../ABIs/IFactory.json"
const FactoryABI = Factory.default

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

export function usePools(factoryAddress) {
    const poolAddress = ref(null)
    const waitingForPool = ref(false)

    async function getPool(addressA: string, addressB: string, providerArg, acceptUnhandled = true) {
        console.log("looking for pool...")
        const provider = new ethers.BrowserProvider(providerArg)
        const factory = new ethers.Contract(factoryAddress, FactoryABI, provider)
        const pool = await factory.getPool(addressA, addressB)
        if (pool === unhandled) {
            poolAddress.value = null
            return null
        }
        console.log("found! ", pool)
        poolAddress.value = pool
        return pool
    }
    
    const interval = ref()
    const iterations = ref(0)
    async function createPool(addressA: string, addressB: string, providerArg) {
        const provider = new ethers.BrowserProvider(providerArg)
        const signer = await provider.getSigner()
        const factory = new ethers.Contract(factoryAddress, FactoryABI, signer)
        await factory.createPool(addressA, addressB).then(async (created) => {
                console.log(" - pool - successfully created pool - ")
                waitingForPool.value = true
                getPool(addressA, addressB, providerArg).then(() => {
                    if (poolAddress.value === null) {
                        interval.value = setInterval(() => {
                            if (poolAddress.value === null) {
                                iterations.value++
                                getPool(addressA, addressB, providerArg, false)
                            } else {
                            clearInterval(interval.value)
                            waitingForPool.value = false
                            console.log('pool is found after ' + iterations.value/2 + ' seconds')
                        }
                    }, 500)
                }
            })
        }).catch(err =>  {
            console.log(" - pool - couldnt create pool - ")
            console.log(err)
            return null
        })
    }
   
    return { poolAddress, waitingForPool, getPool, createPool, iterations }
}
