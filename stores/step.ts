import { defineStore } from "pinia"
import { ethers } from "ethers"
import type { Ref } from 'vue'
// import * as FactoryABI from "../ABIs/factoryAbi.json"
// import * as Token from "../ABIs/tokenAbi.json"

// temporary fix
// import { MetaMaskInpageProvider } from "@metamask/providers";
declare global {
  interface Window{
    ethereum?:any
  }
}

export const useStepStore = defineStore("step", () => {
    const isDark: Ref<boolean> = ref(false)
    const chainId: Ref<number | null> = ref(31337)
    const factoryAddress: Ref<string | null> = ref(null)
    const activeWallet: Ref<string | null> = ref(null)
    const connectingWallet: Ref<boolean> = ref(false)
    const isConnectingText = computed(():string => (connectingWallet.value ? "connecting . . ." : "connect wallet"))

    async function initialize() {
        const eth = window.ethereum
        if (!eth) {
            // console.log("Please install MetaMask extension to your browser")
        }

        // const provider = new ethers.providers.Web3Provider(window.ethereum)
        // console.log("MetaMask is installed!")
        // console.log(provider)

        const account = await eth.request({ method: "eth_accounts" })
        activeWallet.value = account.length !== 0 ? account[0] : null
    }

    async function connectToMetamask() {
        toggleConnecting()
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        try {
            const gotAccount = await provider.send("eth_requestAccounts", [])

            // console.log("successfuly connected wallet")
            activeWallet.value = gotAccount[0]
        } catch (err) {
            // console.log("failed to connect wallet")
            console.log(err)
        } finally {
            toggleConnecting()
        }
    }

    function toggleConnecting() {
        connectingWallet.value = !connectingWallet.value
    }

    return {
        chainId,
        isDark,
        factoryAddress,
        activeWallet,
        connectingWallet,
        isConnectingText,
        initialize,
        connectToMetamask,
        toggleConnecting,
    }
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
