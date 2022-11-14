import { defineStore } from "pinia"
import { ethers } from "ethers"
import * as Factory from "../contractABIs/GapswapV2Factory.json"
import * as Token from "../contractABIs/ERC20.json"
import * as Pair from "../contractABIs/GapswapV2Pair.json"

const FactoryABI = Factory.abi
const PoolABI = Pair.abi
const TokenABI = Token.abi

export const useStepStore = defineStore("step", {
    state: () => {
        return {
            activeWallet: null,
            connecting: false,
            isDark: false,
            factoryAddress: null,
        }
    },
    actions: {
        async initialize() {
            const eth = window.ethereum
            if (!eth) {
                console.log("Please install MetaMask extension to your browser")
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum)
            console.log("MetaMask is installed!")
            // console.log(provider)

            const account = await eth.request({ method: "eth_accounts" })
            if (account.length !== 0) {
                this.activeWallet = account[0]
            } else {
                this.activeWallet = null
            }
        },
        async connectToMetamask() {
            this.toggleConnecting()
            const provider = new ethers.providers.Web3Provider(window.ethereum)

            try {
                const gotAccount = await provider.send("eth_requestAccounts", [])

                console.log("successfuly connected wallet")
                this.activeWallet = gotAccount[0]
            } catch (err) {
                console.log("failed to connect wallet")
                console.log(err)
            } finally {
                this.toggleConnecting()
            }
        },
        toggleConnecting() {
            this.connecting = !this.connecting
        },
        async getBalance(wallet) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const poolAdd = await this.getPairAddress
            const poolContract = new ethers.Contract(poolAdd, PoolABI, provider)
            const tk1add = await poolContract.token0()
            const tk2add = await poolContract.token1()
            console.log("tk1add: ", tk1add, "\ntk2add: ", tk2add)
            const token0Contract = new ethers.Contract(tk1add, TokenABI, provider)
            const token1Contract = new ethers.Contract(tk2add, TokenABI, provider)

            const bal0 = await token0Contract.balanceOf(wallet)
            const bal1 = await token1Contract.balanceOf(wallet)

            console.log("TK1 (usd): ", ethers.utils.formatEther(bal0), "\nTK2 (btc): ", ethers.utils.formatEther(bal1))
        },
        switch() {
            this.tokens.reverse()
        },
    },
    getters: {
        isConnectingText() {
            return this.connecting ? "connecting . . ." : "connect wallet"
        },
    },
})

// logic of a wallet
//
//  user lands on a client:
//    A. Hasn't metamask installed
//    B. Has metamask installed
//        -B1. Doesn't have a conncected wallet
//        -B2. Have account(s) connected
//
//
//
//
//
//
//
//
//
//
//
//
//
//
