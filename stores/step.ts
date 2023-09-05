import type { Ref } from "vue"
import { defineStore } from "pinia"
import { init, useOnboard } from "@web3-onboard/vue"
import injectedModule, { ProviderLabel } from "@web3-onboard/injected-wallets"

import ledgerModule from '@web3-onboard/ledger'
import walletConnectModule from '@web3-onboard/walletconnect'
import gnosisModule from '@web3-onboard/gnosis'

const ledger = ledgerModule({
  projectId: 'Stairway',
  requiredChains: [137, 80001],
  walletConnectVersion: 2,
})
const walletConnect = walletConnectModule({
    projectId: 'Stairway',
    requiredChains: [137, 80001],
    dappUrl: 'https://app.stairway.fi/'
})
const regex = new RegExp("^https://app\\.stairway\\.fi/.*$");
const localhostRegex = new RegExp("^http://localhost:3000/.*$");
const gnosis = gnosisModule()
// const gnosis = gnosisModule({
//     whitelistedDomains: [regex, localhostRegex]
// })
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
    const isMobile: Ref<boolean> = ref(false)
    const isDark: Ref<boolean> = ref(false)
    const activeWallet: Ref<string | null> = ref(null)
    const connectingWallet: Ref<boolean> = ref(false)
    const isConnectingText = computed((): string => (connectingWallet.value ? "connecting . . ." : "connect wallet"))
    
    const POLYGON_MAIN = "https://polygon.llamarpc.com"
    const MUMBAI_RPC_URL = "https://polygon-mumbai.blockpi.network/v1/rpc/public"
    const LOCAL_ANVIL: string = "https://127.0.0.1:8545/"

    // const MUMBAI_RPC_URL = "https://rpc.ankr.com/polygon_mumbai"
    const landingPageUrl: Ref<string> = ref("https://stairway.fi/")

    const injected = injectedModule({
        displayUnavailable: [ProviderLabel.MetaMask, ProviderLabel.Coinbase],
    })

    const onboard = init({
        wallets: [injected, ledger, walletConnect, gnosis],
        chains: [
            {
                id: 137,
                token: "MATIC",
                label: "Polygon Mainnet",
                rpcUrl: POLYGON_MAIN,
                icon: "~/assets/img/polygon_mainnet.webp"
            },
            {
                id: 80001,
                token: "MATIC",
                label: "Polygon Mumbai",
                rpcUrl: MUMBAI_RPC_URL,
                icon: "~/assets/img/polygon_mainnet.webp"
            }
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
    const { wallets, connectWallet, connectedChain, setChain, disconnectConnectedWallet, connectedWallet, alreadyConnectedWallets } = useOnboard()

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

    function connectWalletAction() {
        connectingWallet.value = true
        connectWallet().then(() => {
            connectingWallet.value = false
        })
    }

    // TOKENS ---------------
    const featuredTokens = ref(null)
    // TOKENS ---------------
    
    
    // POSITIONS ----------------
    const positions = ref(null) 
    const refreshPositions = ref(null)
    const positionsStatus = ref(null)
    // POSITIONS ----------------
    
    // ADDRESSES ----------------
    const addresses = ref(null)
    
    const routerAddress = computed(() => {
        if (addresses.value === null) {
            return null
        }
        return addresses.value.DEX
    })
    // ADDRESSES ----------------

    // CHAINS ----------------
    const chains = ref(null)
    
    const connectedChainId = computed(() => {
        if (!connectedChain.value) {
            return parseInt("0x13881", 16)
        }
        return parseInt(connectedChain.value.id, 16)
    })
    // CHAINS ----------------

    return {
        onboard,
        landingPageUrl,

        routerAddress,
        isDark,
        isMobile,
        
        featuredTokens,
        
        positions,
        refreshPositions,
        positionsStatus,
        
        addresses,
        
        chains,
        setChain,
        connectedChainId,
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
