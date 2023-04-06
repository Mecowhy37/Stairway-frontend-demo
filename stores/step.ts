import type { Ref } from "vue"
import { defineStore } from "pinia"
import { ethers } from "ethers"
import { init, useOnboard } from "@web3-onboard/vue"
import { getToken, useBalances, usePools } from "~/helpers/index"

import * as Factory from "../ABIs/IFactory.json"
const FactoryABI = Factory.default

import injectedModule from "@web3-onboard/injected-wallets"
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
    const activeWallet: Ref<string | null> = ref(null)
    const connectingWallet: Ref<boolean> = ref(false)
    const isConnectingText = computed((): string => (connectingWallet.value ? "connecting . . ." : "connect wallet"))
    
    const MAINNET_RPC_URL: string = "https://cloudflare-eth.com/"
    const LOCAL_ANVIL: string = "https://127.0.0.1:8545/"
    const factoryAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    const unhandled = "0x0000000000000000000000000000000000000000"

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
                rpcUrl: LOCAL_ANVIL,
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
        // apiKey: "df032d43-e68f-4e04-8fc8-a30d5ba8d157",
        // notify: {
        //     desktop: {
        //       enabled: true,
        //       transactionHandler: transaction => {
        //         console.log('tx: ',{ transaction })
        //         // if (transaction.eventCode === 'txPool') {
        //           return {
        //             type: 'success',
        //             message: 'Your transaction from #1 DApp is in the mempool',
        //           }
        //         // }
        //       },
        //       position: 'bottomLeft'
        //     },
        //     mobile: {
        //       enabled: true,
        //       transactionHandler: transaction => {
        //         console.log({ transaction })
        //     //     if (transaction.eventCode === 'txPool') {
        //     //       return {
        //     //         type: 'success',
        //     //         message: 'Your transaction from #1 DApp is in the mempool',
        //     //       }
        //     //     }
        //       },
        //       position: 'topRight'
        //     }
        //   },
        connect: {
            autoConnectLastWallet: true,
        },
    })
    const { wallets, connectWallet, connectedChain, disconnectConnectedWallet, connectedWallet, alreadyConnectedWallets } = useOnboard()
    // const walletsNotifs = onboard.state.select('notifications')
    // const { unsubscribe } = walletsNotifs.subscribe((update) =>
    //     console.log('transaction notifications: ', update)
    // )

    const swapTokens = reactive({
        A: getToken('fUSD'),
        B: null
    })
    const poolTokens = reactive({
        A: getToken('fBTC'),
        B: getToken('fUSD'),
        // B: null
    })

    const allTokens = computed(() => {
        return [swapTokens.A, swapTokens.B, poolTokens.A, poolTokens.B]
    })
    const poolTokensCmp = computed(() => {
        return [poolTokens.A, poolTokens.B]
    })
    const swapTokensCmp = computed(() => {
        return [poolTokens.A, poolTokens.B]
    })

    const bothSwapTokensThere = computed(() => {
        if (!swapTokensCmp.value.some(el => el === null)) {
            return true
        }
        return false
    })
    const bothPoolTokensThere = computed(() => {
        if (!poolTokensCmp.value.some(el => el === null)) {
            return true
        }
        return false
    })


    const bothSwapTokenAddresses = computed(() => {
        return bothSwapTokensThere.value ? swapTokensCmp.value.map(el => el.address) : null
    })
    const bothPoolTokenAddresses = computed(() => {
        return bothPoolTokensThere.value ? poolTokensCmp.value.map(el => el.address) : null
    })
    


    const { updateBalance } = useBalances()
    const { getPool } = usePools(factoryAddress)

    watch(allTokens, (newValue, oldValue) => {
        updateBalance(newValue, oldValue)
    })


    // const swapAddress = ref(null)
    // watch(swapTokensCmp, async (newValue) => {
    //     if (bothSwapTokensThere && connectedWallet){
    //         swapAddress.value = getPool(...bothSwapTokenAddresses.value, connectedWallet.value.provider)
    //     }
    // })



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
        onboard,

        chainId,
        factoryAddress,
        isDark,
        swapTokens,
        poolTokens,
        allTokens,

        // poolAddress,
        poolTokensCmp,
        bothPoolTokensThere,
        bothPoolTokenAddresses,

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
