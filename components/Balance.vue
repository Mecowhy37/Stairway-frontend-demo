<template>
    <p class="caption">{{ retrievedBalance }}</p>
</template>

<script setup lang="ts">
import { isSupportedChain, tkEnum, getUrl, roundFloor } from "~/helpers/index"

export interface Props {
    token: Token | null
    wallet: string | null
    chainId: number
    allBalances: any
    index: number
}
type Token = {
    chain_id: number
    address: string
    symbol: string
    name: string
    decimals: number
    logo_uri: string
    is_featured: boolean
    is_governance: boolean
    total_supply: string
}
const props = defineProps<Props>()

const { data: balance, pending: balancePending } = await useAsyncData(
    props.index.toString(),
    async () => {
        if (!isValidForBalanceCheck()) {
            return null
        }
        console.log("fetching balance")
        return $fetch(getUrl(`/chain/${props.chainId}/user/${props.wallet}/balance/${props.token.address}`))
    },
    {
        watch: [() => props.token, () => props.wallet, () => props.chainId],
        transform: (newBalance) => {
            if (newBalance && isValidForBalanceCheck()) {
                setGlobalBalance(props.chainId, props.wallet, props.token.address, newBalance)
            }
            return newBalance
        },
        immediate: true,
        lazy: true,
    }
)

function setGlobalBalance(chain, wallet, tokenAddress, newBalance) {
    props.allBalances[getGlobalBalanceKey([chain, wallet, tokenAddress])] = newBalance
}

const retrievedBalance = computed(() => {
    if (!isValidForBalanceCheck()) {
        return null
    }
    const retreivedBalance = props.allBalances[getGlobalBalanceKey([props.chainId, props.wallet, props.token.address])]
    if (!retreivedBalance) {
        return null
    }
    return retreivedBalance
})

function getGlobalBalanceKey(params) {
    return params.join("-")
}

function isValidForBalanceCheck() {
    return props.token && props.wallet && props.chainId
}
</script>

<style lang="scss" scoped>
p {
    margin-right: auto;
}
</style>
