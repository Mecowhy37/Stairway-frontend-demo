import { formatUnits } from "ethers"
import { isSupportedChain, tkEnum, getUrl, roundFloor } from "~/helpers/index"

export function useBalances(Tokens, connectedAccount, connectedChainId) {
    const balanceState = reactive({
        quote: 0n,
        base: 0n,
    })
    const Balances = computed({
        get() {
            return [balanceState.quote, balanceState.base]
        },
        set(newVal) {
            balanceState.quote = newVal[0]
            balanceState.base = newVal[1]
        },
    })
    const formatedBalances = computed(() => {
        return Balances.value.map((bal, idx) => {
            const token = Tokens.value[idx]
            if (!token || !connectedAccount.value) {
                return ""
            } else {
                return roundFloor(formatUnits(bal, token.decimals))
            }
        })
    })

    async function getTokenBalance(tokenIndex, clearOld) {
        const stateKey = Object.keys(balanceState)[tokenIndex]

        if (!connectedAccount.value || !isSupportedChain(connectedChainId.value)) {
            console.log("invald chain or no wallet")
            balanceState[stateKey] = 0n
            return
        }

        const token = Tokens.value[tokenIndex]
        if (token === null) {
            console.log("token === null")
            balanceState[stateKey] = 0n
            return
        }
        if (clearOld) {
            balanceState[stateKey] = 0n
        }

        console.log("getting", stateKey, "balance")
        const { data: balance, error } = await useFetch(
            getUrl(`/chain/${connectedChainId.value}/user/${connectedAccount.value}/balance/${token.address}`)
        )
        if (balance.value) {
            console.log("got balance", balance.value)
            balanceState[stateKey] = BigInt(balance.value)
            return
        }
        if (error.value) {
            console.error("failed to fetch balance", error.value)
            balanceState[stateKey] = 0n
            return
        }
        console.log("nothing returned")
        balanceState[stateKey] = 0n
        return
    }

    async function getBothBalances(tokenIndex = false, clearOld = true) {
        console.log("- - - - - - - - - - -")
        console.log("getBothBalances(), tokenIndex", tokenIndex)

        if (tokenIndex === false || tokenIndex === tkEnum.QUOTE) {
            getTokenBalance(tkEnum.QUOTE, clearOld)
        }
        if (tokenIndex === false || tokenIndex === tkEnum.BASE) {
            getTokenBalance(tkEnum.BASE, clearOld)
        }
    }
    function reverseBalances() {
        console.log("useBalances: reverseBalances()")
        Balances.value = Balances.value.reverse()
    }

    watch(
        [connectedAccount, connectedChainId],
        ([wallet, chain]) => {
            if (wallet && isSupportedChain(chain)) {
                getBothBalances(false, false)
            } else {
                console.log("reset balances")
                Balances.value = [0n, 0n]
            }
        },
        {
            immediate: true,
        }
    )

    // watch(
    //     () => Tokens.value[tkEnum.QUOTE],
    //     (newToken) => {
    //         if (newToken) {
    //             getBothBalances(tkEnum.QUOTE)
    //         }
    //     }
    // )
    // watch(
    //     () => Tokens.value[tkEnum.BASE],
    //     (newToken) => {
    //         if (newToken) {
    //             getBothBalances(tkEnum.BASE)
    //         }
    //     }
    // )
    // watch(
    //     Tokens,
    //     (newTokens) => {
    //         console.log("NEWTOKENS:", newTokens)
    //     },
    //     {
    //         immediate: true,
    //     }
    // )

    return { Balances, formatedBalances, getTokenBalance, getBothBalances, reverseBalances }
}
