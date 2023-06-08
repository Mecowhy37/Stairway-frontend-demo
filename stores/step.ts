import type { Ref } from "vue"
import { defineStore } from "pinia"
import { BrowserProvider, Contract } from "ethers"
import { init, useOnboard } from "@web3-onboard/vue"
import { getToken, useBalances, usePools } from "~/helpers/index"

import * as Router from "../ABIs/DEX.json"
const RouterABI = Router.default

import * as Factory from "../ABIs/Factory.json"
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
    const tokenList = ref([])
    const isDark: Ref<boolean> = ref(false)
    const chainId: Ref<number | null> = ref(31337)
    const activeWallet: Ref<string | null> = ref(null)
    const connectingWallet: Ref<boolean> = ref(false)
    const isConnectingText = computed((): string => (connectingWallet.value ? "connecting . . ." : "connect wallet"))
    
    const MAINNET_RPC_URL: string = "https://cloudflare-eth.com/"
    const LOCAL_ANVIL: string = "https://127.0.0.1:8545/"
    const routerAddress = "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F"
    const foundryAddress = "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d"

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
        A: null,
        B: null
    })
    const poolTokens = reactive({
        A: null,
        B: null
    })

    const allTokens = computed(() => {
        return [swapTokens.A, swapTokens.B, poolTokens.A, poolTokens.B]
    })
    const poolTokensCmp = computed(() => {
        return [poolTokens.A, poolTokens.B]
    })

    const swapTokensCmp = computed(() => {
        return [swapTokens.A, swapTokens.B]
    })

    const bothSwapTokensThere = computed(() => !swapTokensCmp.value.some(el => el === null) ? true : false)
    const bothPoolTokensThere = computed(() => !poolTokensCmp.value.some(el => el === null) ? true : false)


    const bothSwapTokenAddresses = computed(() => bothSwapTokensThere.value ? swapTokensCmp.value.map(el => el.address) : null)
    const bothPoolTokenAddresses = computed(() => bothPoolTokensThere.value ? poolTokensCmp.value.map(el => el.address) : null)
    

    // const { updateBalance } = useBalances()
    // const { getBidAsk } = usePools(routerAddress)

    // watch(allTokens, (newValue, oldValue) => {
    //     updateBalance(newValue, oldValue)
    // })


    const connectedAccount = computed(() => connectedWallet.value?.accounts[0].address || null)
    const getTruncatedWalletAddress = computed(() => {
        if (connectedAccount.value !== null) {
            const toTruncate = connectedAccount.value.split("")
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

    // const state = onboard.state.select()
    // const {unsubscribe} = state.subscribe(update =>
    //     console.log('state update: ', update)
    // )

    // remember to unsubscribe when updates are no longer needed
    // unsubscribe()

    return {
        onboard,

        chainId,
        routerAddress,
        foundryAddress,
        isDark,
        swapTokens,
        poolTokens,
        allTokens,
        tokenList,

        poolTokensCmp,
        bothPoolTokensThere,
        bothPoolTokenAddresses,

        bothSwapTokensThere,
        bothSwapTokenAddresses,

        connectedChain,
        isConnectingText,
        connectWallet,
        connectWalletAction,
        connectedWallet,
        connectingWallet,
        disconnectConnectedWallet,
        alreadyConnectedWallets,

        connectedAccount,
        getTruncatedWalletAddress,
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
