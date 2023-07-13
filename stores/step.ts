import type { Ref } from "vue"
import { defineStore } from "pinia"
import { BrowserProvider, Contract } from "ethers"
import { init, useOnboard } from "@web3-onboard/vue"
import { getToken, useBalances, usePools } from "~/helpers/index"

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
    const MUMBAI_RPC_URL = "https://rpc.ankr.com/polygon_mumbai"

    const unhandled = "0x0000000000000000000000000000000000000000"

    const injected = injectedModule()
    const onboard = init({
        wallets: [injected],
        chains: [
            {
                id: "0x13881",
                token: "MATIC",
                label: "Polygon Mumbai",
                rpcUrl: MUMBAI_RPC_URL,
            },
            {
                id: "0x7a69",
                token: "ETH",
                label: "Local Anvil",
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

    const swapTokensCmp = computed(() => {
        return [swapTokens.A, swapTokens.B]
    })

    const bothSwapTokensThere = computed(() => !swapTokensCmp.value.some(el => el === null) ? true : false)


    const bothSwapTokenAddresses = computed(() => bothSwapTokensThere.value ? swapTokensCmp.value.map(el => el.address) : null)
    

    // const { updateBalance } = useBalances()
    // const { getBidAsk } = usePools(routerAddress)



    const connectedAccount = computed(() => connectedWallet.value?.accounts[0].address || null)
    const getTruncatedWalletAddress = computed(() => {
        if (connectedAccount.value === null) { 
            return null
        }
        const toTruncate = connectedAccount.value.split("")
        const start = toTruncate.splice(0, 5).join("")
        const end = toTruncate.splice(-4).join("")
        return start + "..." + end
    })


    const isSupportedChain = computed(() => {
        if (connectedChain.value) {
            return connectedChain.value?.id === "0x7a69" || connectedChain.value?.id === "0x13881" 
        } else {
            return false
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
    const api = "https://api.stairway.fi"
    function getUrl(endpoint: string) {
        return api + endpoint
    }
    // TOKENS ---------------
    const featuredTokens = ref(null)

    async function fetchTokens() {
        const { data, error } = await useFetch(getUrl("/chain/80001/tokens/featured"))
        if (data.value) {
            // console.log('featuredTokens: ', data.value)
            featuredTokens.value = data.value
        }
        if (error.value) {
            featuredTokens.value = null
            console.error("failed fetching tokens", error.value)
        }
    }
    // TOKENS ---------------
    
    
    // POSITIONS ----------------
    const positions = ref(null)

    async function fetchPositions(account) {
        const { data, error } = await useFetch(getUrl(`/chain/80001/user/${account}/positions`))
        if (data.value) {
            positions.value = data.value 
        }
        if (error.value) {
            console.error("failed fetching positions: ", error.value)
        }
    }   
    // POSITIONS ----------------
    
    // ADDRESSES ----------------
    const addresses = ref(null)
    
    async function fetchAddresses() {
        const { data, error } = await useFetch(getUrl("/chain/80001/addresses/local"))
        if (data.value) {
            console.log('data.value:', data.value)
        }
        if (error.value) {
            console.error("failed fetching addresses: ", error.value)
        }
    }
    
    const routerAddress = computed(() => {
        if (!addresses.value) {
            return null
        }
        return addresses.value.DEX
    })

    
    // ADDRESSES ----------------

    return {
        onboard,

        routerAddress,
        isDark,
        swapTokens,

        getUrl,
        
        featuredTokens,
        fetchTokens,

        positions,
        fetchPositions,

        addresses,
        fetchAddresses,

        bothSwapTokensThere,
        bothSwapTokenAddresses,

        isSupportedChain,
        
        chainId,
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
// featuredTokens,

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
