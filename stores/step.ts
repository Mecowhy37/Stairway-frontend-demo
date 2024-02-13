import type { Ref } from "vue"
import { ref } from "vue"
import { defineStore } from "pinia"
import { init, useOnboard } from "@web3-onboard/vue"
import injectedModule, { ProviderLabel } from "@web3-onboard/injected-wallets"

import ledgerModule from '@web3-onboard/ledger'
import gnosisModule from '@web3-onboard/gnosis'

const ledger = ledgerModule({
  projectId: 'Stairway',
  requiredChains: [137, 80001],
  walletConnectVersion: 2,
})
// const walletConnect = walletConnectModule({
//     projectId: 'Stairway',
//     requiredChains: [137, 80001],
//     dappUrl: 'https://app.stairway.fi/'
// })
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

export const useStepStore = defineStore("step", (): any => {
    const isMobile: Ref<boolean> = ref(false)
    const isDark: Ref<boolean> = ref(false)
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


    // CHAINS ----------------
    const chains = ref(null)
    const noWalletChain = ref(80001)
    
    const connectedChainId = computed(() => {
        if (!connectedChain.value && noWalletChain.value) {
            return noWalletChain.value
        }
        if( connectedChain.value) {
            return parseInt(connectedChain.value.id, 16)
        }
    })

    function setTheChain(id) {
        if (connectedAccount.value) {
            setChain({ chainId: id })
        } else {
            noWalletChain.value = id
        }
    }
    
    // CHAINS ----------------

    const onboardInit = ref([{
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
    }])

    // all onboard logic needs to be moved out to default layout
    const onboard = init({
        wallets: [injected, ledger, gnosis],
        // wallets: [injected, ledger, walletConnect, gnosis],
        chains: onboardInit.value,
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

    // NOTIFICATIONS ---------
    const notify = null
    // NOTIFICATIONS ---------

    // BALANCES --------------
    const allBalances = ref({})
    // BALANCES --------------


    return {
        onboard, 

        landingPageUrl,

        isDark,
        isMobile,
        
        chains,
        setTheChain,
        connectedChainId,
        noWalletChain,
        connectedChain,
        isConnectingText,
        connectWallet,
        connectedWallet,
        connectingWallet,
        disconnectConnectedWallet,
        alreadyConnectedWallets,

        allBalances,

        notify,

        connectedAccount,
        getTruncatedWalletAddress,
    }
})