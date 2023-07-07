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
            <h3>Your positions <span>3</span></h3>
            <div class="pools">
                <div
                    v-for="(position, i) in positions"
                    class="pool"
                >
                    <div>
                        <div class="pool__heading row space-between">
                            <h4>ETH / SUSHI</h4>
                            <Btn
                                opaque
                                @click="toggle(i)"
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
                            v-if="openedIndex === i"
                            class="pool__heading_ext"
                        ></div>
                    </div>
                    <div class="pool__stats prices-share">
                        <div class="table row">
                            <div>
                                <p>{{ formatUnits(position.this_amount, position.pool.this_token.decimalas) }}</p>
                                <p class="caption grey-text">{{ position.pool.this_token.symbol }} pooled</p>
                            </div>
                            <div>
                                <p>{{ formatUnits(position.that_amount, position.pool.that_token.decimalas) }}</p>
                                <p class="caption grey-text">{{ position.pool.that_token.symbol }} pooled</p>
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

import { formatUnits } from "ethers"

import { useStepStore } from "@/stores/step"

const stepStore = useStepStore()
const { getUrl } = stepStore

const openedIndex: Ref<number | null> = ref(null)

function toggle(index: number) {
    if (openedIndex.value === index) {
        openedIndex.value = null
        return
    }
    openedIndex.value = index
}

const { data: positions } = useFetch(getUrl("/chain/80001/user/12345/positions"))
</script>

<style lang="scss" scoped>
.positions {
    width: 80vw;
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
