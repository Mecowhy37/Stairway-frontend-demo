<template>
    <div class="positions">
        <div class="positions__top row">
            <h1>Pools</h1>
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
        </div>
        <div class="positions__list">
            <h3>Your positions <span>9</span></h3>
            <div class="pools">
                <!--
                v-for="(position, i) in positions"
                -->
                <div
                    v-for="(position, i) in new Array(9)"
                    class="pool"
                >
                    <div>
                        <div class="pool__heading row space-between">
                            <h4>fUSD / fBTC</h4>
                            <!-- <h4>{{ position.pool.this_token.symbol }} / {{ position.pool.that_token.symbol }}</h4> -->
                            <div class="row">
                                <Btn opaque>Add liquidity</Btn>
                                <Btn opaque>Redeem liquidity</Btn>
                            </div>
                            <!-- <Btn
                                opaque
                                @click="toggle(i)"
                            >
                                Manage
                                <template #icon>
                                    <Icon
                                        name="chevron"
                                        :size="16"
                                        :rotate="openedIndex === i"
                                    />
                                </template>
                            </Btn> -->
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
                        <div class="table">
                            <div class="columns row">
                                <div>
                                    <p>54215.25</p>
                                    <!-- <p>
                                        {{
                                            Round(formatUnits(position.this_amount, position.pool.this_token.decimalas))
                                        }}
                                    </p> -->
                                    <!-- <p class="caption grey-text">{{ position.pool.this_token.symbol }} pooled</p> -->
                                    <p class="caption grey-text">fUSD pooled</p>
                                </div>
                                <div>
                                    <p>89765487.86</p>
                                    <!-- <p>
                                        {{
                                            Round(formatUnits(position.that_amount, position.pool.that_token.decimalas))
                                        }}
                                    </p> -->
                                    <!-- <p class="caption grey-text">{{ position.pool.that_token.symbol }} pooled</p> -->
                                    <p class="caption grey-text">fBTX pooled</p>
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
    </div>
</template>

<script setup>
import { formatUnits } from "ethers"

import { useStepStore } from "@/stores/step"

const stepStore = useStepStore()
const { getUrl } = stepStore

const openedIndex = ref(null)

function toggle(index) {
    if (openedIndex.value === index) {
        openedIndex.value = null
        return
    }
    openedIndex.value = index
}

function Round(amt) {
    let amount = Number(amt)
    amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
    return String(parseFloat(amount))
}

const { data: positions } = useFetch(getUrl("/chain/80001/user/12345/positions"))
</script>

<style lang="scss" scoped>
.positions {
    width: var(--list-width);
    &__top {
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid var(--swap-windows);
        padding-bottom: 25px;
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
                background-color: var(--widget-bg);
                overflow: hidden;
                margin-bottom: 20px;
                /* .wrapper {
                    overflow: hidden;
                } */
                &__heading {
                    padding: 10px 20px;
                    align-items: center;
                    white-space: nowrap;
                    div.row {
                        gap: 1rem;
                    }
                }
                &__heading_ext {
                    height: 4rem;
                }
                &__stats {
                    padding: 10px;
                    background-color: var(--swap-windows);
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
