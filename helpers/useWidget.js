import { isAddress } from "ethers"
import { tkEnum, getOutsiderToken, isSupportedChain } from "~/helpers/index"

export function useWidget(featuredTokens, Tokens, chainId, router, route) {
    let waiting = ref(false)
    async function findTokenByAddress(featuredList, address) {
        const token = featuredList.find((el) => el.address === address)
        if (!token && isAddress(address)) {
            // this need to be updated to useFetch to block clearing the url below
            waiting.value = true
            const outsideToken = await getOutsiderToken(chainId.value, address)
            waiting.value = false

            console.log("outsideToken:", outsideToken)
            return outsideToken.name && outsideToken.symbol ? outsideToken : null
        }
        return token ? token : null
    }
    watch(
        featuredTokens,
        async (newFeatured) => {
            if (newFeatured && newFeatured.length > 0) {
                console.log("watcher called")
                if (route.query.tk1) {
                    Tokens.value[tkEnum.QUOTE] = await findTokenByAddress(newFeatured, route.query.tk1)
                }
                if (route.query.tk2) {
                    Tokens.value[tkEnum.BASE] = await findTokenByAddress(newFeatured, route.query.tk2)
                }
            }
        },
        {
            immediate: true,
        }
    )
    // ISSUE - select two token in the Add liquidity and then switch a network
    watch(
        () => [waiting.value, Tokens.value],
        ([newWaiting, newTokens]) => {
            if (newWaiting === false) {
                console.log("updating url")
                const obj = {}
                newTokens.forEach((el, index) => (el ? (obj["tk" + (index + 1)] = el.address) : false))
                router.replace({
                    query: {
                        ...obj,
                    },
                })
            }
        }
    )
}
