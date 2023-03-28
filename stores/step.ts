import type { Ref } from "vue"
import { defineStore } from "pinia"
import { ethers } from "ethers"
import { init, useOnboard } from "@web3-onboard/vue"
import injectedModule from "@web3-onboard/injected-wallets"
// import { tryOnBeforeMount } from '@vueuse/core'
// import * as FactoryABI from "../ABIs/factoryAbi.json"
// import * as Token from "../ABIs/tokenAbi.json"

// temporary fix
// import { MetaMaskInpageProvider } from "@metamask/providers";
declare global {
    interface Window {
        ethereum?: any
    }
}

// type AppState = {
//     wallets: WalletState[]
//     chains: Chain[]
//     accountCenter: AccountCenter
//     walletModules: WalletModule[]
//     locale: Locale
//     notify: Notify
//     notifications: Notification[]
//   }

export const useStepStore = defineStore("step", (): any => {
    const isDark: Ref<boolean> = ref(false)
    const chainId: Ref<number | null> = ref(31337)
    const factoryAddress: Ref<string | null> = ref(null)
    const activeWallet: Ref<string | null> = ref(null)
    const connectingWallet: Ref<boolean> = ref(false)
    const isConnectingText = computed((): string => (connectingWallet.value ? "connecting . . ." : "connect wallet"))

    const MAINNET_RPC_URL: string = "https://cloudflare-eth.com/"
    const LOCAL_ANVIL: string = "https://127.0.0.1:8545/"

    const injected = injectedModule()
    const onboard = init({
        wallets: [injected],
        chains: [
            {
                id: "0x1",
                token: "ETH",
                label: "Ethereum Mainnet",
                rpcUrl: MAINNET_RPC_URL,
            },
            {
                id: "0x7a69",
                token: "ETH",
                label: "Local ANvil",
                rpcUrl: MAINNET_RPC_URL,
            },
        ],
        accountCenter: {
            desktop: {
                enabled: false,
            },
            mobile: {
                enabled: false,
            },
        },
        connect: {
            autoConnectLastWallet: true,
        },
    })
    const { wallets, connectWallet, connectedChain, disconnectConnectedWallet, connectedWallet, alreadyConnectedWallets } = useOnboard()

    const getConnectedAccount = computed(() => connectedWallet.value?.accounts[0].address || null)
    const getTruncatedWalletAddress = computed(() => {
        if (getConnectedAccount.value !== null) {
            const toTruncate = getConnectedAccount.value.split("")
            const start = toTruncate.splice(0, 5).join("")
            const end = toTruncate.splice(-4).join("")
            return start + "..." + end
        } else {
            return null
        }
    })

    function connectWalletAction() {
        connectingWallet.value = true
        connectWallet().then(() => {
            connectingWallet.value = false
        })
    }

    async function tryWallet() {
        
        console.log(connectedWallet.value?.accounts)

        // let eth
        // let account
        // if (window.ethereum) {
        //   eth = window.ethereum;
        //   account = await eth.request({ method: "eth_accounts" })
        //   console.log(connectedWallet.value)
        //   console.log(account)
        // }
    }

    // const state = onboard.state.select()
    // const {unsubscribe} = state.subscribe(update =>
    //     console.log('state update: ', update)
    // )

    // remember to unsubscribe when updates are no longer needed
    // unsubscribe()

    // async function initialize() {
    //     const eth = window.ethereum
    //     if (!eth) {
    //       console.log("Please install MetaMask extension to your browser")
    //     }

    //     const provider = new ethers.providers.Web3Provider(window.ethereum)
    //     // console.log("MetaMask is installed!")
    //     console.log(provider)

    //     const eth = window.ethereum
    //     const account = await eth.request({ method: "eth_accounts" })
    //     activeWallet.value = account.length !== 0 ? account[0] : null
    // }

    return {
        chainId,
        factoryAddress,
        isDark,

        connectedChain,
        isConnectingText,
        activeWallet,
        connectWallet,
        connectWalletAction,
        connectedWallet,
        connectingWallet,
        disconnectConnectedWallet,
        alreadyConnectedWallets,

        getConnectedAccount,
        getTruncatedWalletAddress,
        tryWallet,
    }
})
// tokenList,

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
