import { isAddress } from "ethers"
import { tkEnum, getOutsiderToken, isSupportedChain } from "~/helpers/index"

export function useTokens(FeaturedTokensData, connectedChainId, route) {
    const tokenA = ref(null)
    const tokenB = ref(null)

    const Tokens = computed({
        get() {
            return [tokenA.value, tokenB.value]
        },
        set(newValue) {
            console.log("newValue:", newValue)
            tokenA.value = newValue[0]
            tokenB.value = newValue[1]
        },
    })

    const selectTokenIndex = ref(0)

    const bothTokensThere = computed(() => Tokens.value.every((el) => el !== null))
    const router = useRouter()

    function setToken(token) {
        if (token) {
            const sameTokenIndex = Tokens.value.findIndex((el) => el?.address === token.address)
            if (sameTokenIndex !== -1 && sameTokenIndex !== selectTokenIndex.value) {
                reverseTokens()
                return
            }
        }
        Tokens.value = Tokens.value.map((el, index) => (index === selectTokenIndex.value ? token : el))
        setTokensInUrl()
    }
    function reverseTokens() {
        Tokens.value = Tokens.value.reverse()
        setTokensInUrl()
    }

    function setTokensInUrl() {
        const obj = {}
        Tokens.value.forEach((el, index) => (el ? (obj["tk" + (index + 1)] = el.address) : false))
        router.replace({
            query: {
                ...obj,
            },
        })
    }

    async function findTokenByAddress(featuredList, address) {
        const token = featuredList.find((el) => el.address === address)
        if (!token && isAddress(address)) {
            const outsideToken = await getOutsiderToken(connectedChainId.value, address)

            console.log("outsideToken:", outsideToken)
            return outsideToken.name && outsideToken.symbol ? outsideToken : null
        }
        return token ? token : null
    }

    watch(
        FeaturedTokensData,
        async (newFeatured) => {
            if (newFeatured?.length > 0) {
                if (route.query.tk1) {
                    tokenA.value = await findTokenByAddress(newFeatured, route.query.tk1)
                } else if (!route.query.tk2 && route.name === "swap") {
                    tokenA.value = await findTokenByAddress(newFeatured, "0x9a99605865985fe4e1776baf0801d38a45237073")
                }
                if (route.query.tk2) {
                    tokenB.value = await findTokenByAddress(newFeatured, route.query.tk2)
                }
            } else {
                console.log("reset url and tokens")
                Tokens.value = [null, null]
            }
        },
        {
            immediate: true,
        }
    )
    const hasDaoToken = computed(() => {
        return Tokens.value.some((el) => el?.is_governance)
    })

    return {
        Tokens,
        bothTokensThere,
        setToken,
        selectTokenIndex,
        reverseTokens,
        hasDaoToken,
    }
}
