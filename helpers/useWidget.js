import { isAddress } from "ethers"
import { tkEnum, getOutsiderToken } from "~/helpers/index"

export function useWidget(featuredTokens, Tokens, chainId, router, route) {
    let waiting = ref(false)

    function findTokenByAddress(featuredList, address) {
        const token = featuredList.find((el) => el.address === address)
        // if (!token && isAddress(address)) {
        //     // this need to be updated to useFetch to block clearing the url below
        //     const outsideToken = await getOutsiderToken(chainId.value, address)

        //     console.log("outsideToken:", outsideToken)
        //     return outsideToken.name && outsideToken.symbol ? outsideToken : null
        // }
        return token ? token : null
    }
    watch(
        featuredTokens,
        (newFeatured) => {
            // if (newFeatured && newFeatured.length > 0) {
            if (route.query.tk1) {
                console.log("Tokens.value[tkEnum.QUOTE]")
                Tokens.value[tkEnum.QUOTE] = findTokenByAddress(newFeatured, route.query.tk1)
            }
            if (route.query.tk2) {
                console.log("Tokens.value[tkEnum.BASE]")
                Tokens.value[tkEnum.BASE] = findTokenByAddress(newFeatured, route.query.tk2)
            }
            // }
        },
        {
            immediate: true,
        }
    )
    // ISSUE - select two token in the Add liquidity and then switch a network
    watch(
        Tokens,
        (newTokens) => {
            // () => [waiting.value, Tokens.value],
            // ([newWaiting, newTokens]) => {
            // if (newWaiting === false) {
            console.log("updating url")
            const obj = {}
            newTokens.forEach((el, index) => (el ? (obj["tk" + (index + 1)] = el.address) : false))
            router.replace({
                query: {
                    ...obj,
                },
            })
        }
        // }
    )
}
