<template>
    <div class="positions">
        <div class="positions__top row">
            <h1>Pools</h1>
            <Btn
                is="h4"
                reverse
                cta
                @click="start()"
            >
                New postition
                <template #icon>
                    <Icon
                        name="plus"
                        :size="25"
                    />
                </template>
            </Btn>
        </div>
        <div class="positions__list">
            <h3>Your positions <span>3</span></h3>
            <div class="pools">
                <div
                    v-for="(i, x) in new Array(8)"
                    class="pool"
                >
                    <div>
                        <div class="pool__heading row space-between">
                            <h4>ETH / SUSHI</h4>
                            <Btn
                                opaque
                                @click="toggle(x)"
                            >
                                Manage
                                <template #icon>
                                    <Icon
                                        name="chevron"
                                        :size="16"
                                    />
                                </template>
                            </Btn>
                        </div>
                        <div
                            v-if="openedIndex === x"
                            class="pool__heading_ext"
                        ></div>
                    </div>
                    <div class="pool__stats prices-share">
                        <div class="table row">
                            <div>
                                <p>akdshfkajsh</p>
                                <p class="caption grey-text">ETH per BTC (bid/ask)</p>
                            </div>
                            <div>
                                <p>akdshfkajsh</p>
                                <p class="caption grey-text">ETH per BTC (bid/ask)</p>
                            </div>
                            <div>
                                <p>100%</p>
                                <p class="caption grey-text">pool share</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Ref } from "vue"

import { BrowserProvider, Contract, parseEther } from "ethers"
import { useStepStore } from "@/stores/step"
import { useBalances, usePools } from "../helpers/index"

import * as Router from "../ABIs/DEX.json"
const RouterABI = Router.default

import * as Factory from "../ABIs/Factory.json"
const FactoryABI = Factory.default

import * as Pool from "../ABIs/Pool.json"
const PoolABI = Pool.default

const stepStore = useStepStore()
const { getTokenBalance, getTotalSupply } = useBalances()
const { setPoolCreationListener } = usePools(stepStore.routerAddress)

// const activePositions: Ref<>
// {
//     "address": {
//         data
//     }
// }

const openedIndex: Ref<number | null> = ref(null)
function toggle(index: number) {
    if (openedIndex.value === index) {
        openedIndex.value = null
        return
    }
    openedIndex.value = index
}

async function getAllPositions(providerArg) {
    const provider = new BrowserProvider(providerArg)
    const router = new Contract(stepStore.routerAddress, RouterABI, provider)
    const factoryAdd = await router.factory()
    const factory = new Contract(factoryAdd, FactoryABI, provider)
    const allPools = await factory.getAllPools()

    let allLpTokens = []
    await Promise.all(
        allPools.map(async (poolAdd) => {
            const pool = new Contract(poolAdd, PoolABI, provider)
            const lpToken = await pool.lpToken()
            console.log("lpToken:", lpToken)
            allLpTokens.push(lpToken)
        })
    )
    console.log("allLpTokens:", allLpTokens)

    let allPositions = []
    await Promise.all(
        allLpTokens.map(async (lp) => {
            const lpBalance = await getTokenBalance(
                { address: lp, decimals: 18 },
                stepStore.connectedAccount,
                providerArg
            )
            console.log("lpBalance:", lpBalance)
        })
    )
}
function setupPoolCreated(providerArg) {
    if (providerArg === false) {
        setPoolCreationListener(false)
        return
    }
    setPoolCreationListener(providerArg).then(([thisToken, thatToken, newPoolAddress]) => {
        // working with store and ready addresses
        setupPoolCreated(stepStore.connectedWallet.provider)
    })
}

watch(
    () => stepStore.connectedAccount,
    (wallet, prevWallet) => {
        if (wallet !== prevWallet && wallet) {
            setupPoolCreated(stepStore.connectedWallet.provider)
            getAllPositions(stepStore.connectedWallet.provider)
            return
        }
        if (!wallet) {
            setPoolCreationListener(false)
        }
    },
    {
        immediate: true,
    }
)
</script>

<style lang="scss" scoped>
.positions {
    width: 40vw;
    &__top {
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid var(--swap-windows);
        padding-bottom: 16px;
    }
    &__list {
        h3 {
            padding: 20px 0;
            span {
                color: var(--text-color-reverse);
                background-color: var(--swap-windows);
                border-radius: 50px;
                padding: 0 10px;
            }
        }
        .pools {
            height: 50vh;
            overflow: auto;
            &::-webkit-scrollbar {
                display: none;
            }
            .pool {
                color: var(--text-color-reverse);
                background-color: var(--widget-bg);
                border-radius: var(--semi-wdg-radius);
                background-color: var(--widget-bg);
                overflow: hidden;
                margin-bottom: 20px;
                /* .wrapper {
                    overflow: hidden;
                } */
                &__heading {
                    padding: 10px 20px;
                    align-items: center;
                }
                &__heading_ext {
                    height: 4rem;
                }
                &__stats {
                    padding: 10px 0;
                    background-color: var(--swap-windows);
                }
            }
        }
    }
}
</style>
