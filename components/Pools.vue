<template>
    <div class="positions">
        <div class="positions__top row">
            <h1>Pools</h1>
            <NuxtLink
                class="link"
                to="/add"
            >
                <Btn
                    is="h4"
                    reverse
                    cta
                >
                    New postition
                    <template #icon>
                        <Icon
                            name="plus"
                            :size="16"
                        />
                    </template>
                </Btn>
            </NuxtLink>
        </div>
        <div class="positions__list">
            <h3 v-if="positions">
                Your positions <span>{{ positions.length }}</span>
            </h3>
            <div class="pools">
                <div
                    v-for="(position, i) in positions"
                    class="pool"
                >
                    <div>
                        <div class="pool__heading row space-between">
                            <h4>{{ position.pool.base_token.symbol }} / {{ position.pool.quote_token.symbol }}</h4>
                            <Dropdown
                                solid
                                no-padding
                            >
                                <template #dropdown-activator="{ on }">
                                    <Btn
                                        opaque
                                        selectable
                                        @click="toggle(i)"
                                    >
                                        Manage
                                        <template #icon>
                                            <Icon
                                                name="chevron"
                                                :size="16"
                                                :rotate="on ? 180 : 0"
                                            />
                                            <!-- :rotate="openedIndex === i" -->
                                        </template>
                                    </Btn>
                                </template>
                                <template #dropdown>
                                    <p
                                        @click="addRedirect(position.pool)"
                                        class="list-item list-item--centered"
                                    >
                                        Add liquidity
                                    </p>
                                    <p
                                        @click="removeRedirect(position.pool)"
                                        class="list-item list-item--centered"
                                    >
                                        Redeem liquidity
                                    </p>
                                </template>
                            </Dropdown>
                        </div>
                        <!-- <div
                            v-if="openedIndex === i"
                            class="pool__heading_ext row align-center center"
                        >
                            <Btn>Add liquidity</Btn>
                            <Btn>Redeem liquidity</Btn>
                        </div> -->
                    </div>
                    <div class="pool__stats">
                        <div class="columns row">
                            <div>
                                <p>
                                    {{ Round(formatUnits(position.base_amount, position.pool.base_token.decimals)) }}
                                </p>
                                <p class="caption grey-text">{{ position.pool.base_token.symbol }} pooled</p>
                            </div>
                            <div>
                                <p>
                                    {{ Round(formatUnits(position.quote_amount, position.pool.quote_token.decimals)) }}
                                </p>
                                <p class="caption grey-text">{{ position.pool.quote_token.symbol }} pooled</p>
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

<script setup>
import { formatUnits } from "ethers"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"

const stepStore = useStepStore()
const { positions } = storeToRefs(stepStore)

const openedIndex = ref(null)

function toggle(index) {
    if (openedIndex.value === index) {
        openedIndex.value = null
        return
    }
    openedIndex.value = index
}
const router = useRouter()
function addRedirect(pool) {
    router.push({
        path: "/add",
        query: {
            tk1: pool.base_token.address,
            tk2: pool.quote_token.address,
        },
    })
}

function removeRedirect(pool) {
    router.push({
        path: `/remove/${pool.address}`,
    })
}

function Round(amt) {
    let amount = Number(amt)
    amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
    return String(parseFloat(amount))
}
</script>

<style lang="scss" scoped>
.positions {
    width: var(--list-width);
    &__top {
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid var(--swap-windows);
        padding-bottom: 25px;
        .link {
            text-decoration: none;
        }
    }
    &__list {
        h3 {
            padding: 25px 0;
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
                margin-bottom: 20px;
                &__heading {
                    padding: 10px 20px;
                    align-items: center;
                    white-space: nowrap;
                    div.row {
                        gap: 1rem;
                    }
                    .list-item {
                        padding: 1rem;
                        &:first-of-type {
                            border-top-left-radius: inherit;
                            border-top-right-radius: inherit;
                        }
                        &:last-of-type {
                            border-bottom-left-radius: inherit;
                            border-bottom-right-radius: inherit;
                        }
                    }
                }
                &__heading_ext {
                    height: 4rem;
                }
                &__stats {
                    padding: 10px;
                    background-color: var(--swap-windows);
                    border-radius: 0 0 var(--semi-wdg-radius) var(--semi-wdg-radius);
                    .columns {
                        justify-content: space-between;
                        & > div {
                            text-align: center;
                            flex-basis: 25%;
                            p {
                                white-space: nowrap;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
