<template>
    <div class="wrapper--wide-list">
        <div class="positions">
            <div class="positions__top row">
                <h1 class="scale">Liquidity</h1>
                <NuxtLink
                    v-if="PositionsData?.length > 0"
                    to="/add-liquidity"
                    class="link"
                >
                    <Btn
                        is="h4"
                        reverse
                        :compact="isMobile"
                    >
                        Add Liquidity
                        <template #icon>
                            <Icon
                                name="plus"
                                :size="16"
                            />
                        </template>
                    </Btn>
                </NuxtLink>
            </div>

            <h3
                class="positions__length"
                :class="{ hide: PositionsError }"
            >
                Your liquidity pools <span>{{ PositionsData?.length ? PositionsData.length : 0 }}</span>
            </h3>
            <div
                v-if="PositionsPending && !PositionsData?.length > 0"
                class="positions__list"
            >
                <div
                    v-for="el in new Array(3)"
                    :key="el"
                    class="pool placeholder placeholder--solid"
                >
                    <div class="pool__heading row"><Btn :compact="isMobile">Manage</Btn></div>
                    <div class="pool__stats">
                        <div class="columns">
                            <div>
                                <p>a</p>
                                <p>a</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                v-else-if="PositionsData?.length > 0 && !PositionsError"
                class="positions__list"
            >
                <div
                    v-for="(position, i) in PositionsData"
                    class="pool"
                    :key="position.pool.pool_index"
                >
                    <div>
                        <div class="pool__heading row">
                            <div class="icons-wrapper row">
                                <AccountIcon
                                    size="36"
                                    class="token-icon"
                                    :account="position.pool.base_token.address"
                                />
                                <AccountIcon
                                    size="36"
                                    class="token-icon"
                                    :account="position.pool.quote_token.address"
                                />
                            </div>
                            <p>{{ position.pool.base_token.symbol }} / {{ position.pool.quote_token.symbol }}</p>
                            <Dropdown
                                solid
                                no-padding
                                class="manage-btn"
                                :width="170"
                            >
                                <template #dropdown-activator="{ on }">
                                    <Btn
                                        opaque
                                        selectable
                                        sm-radius
                                        :compact="isMobile"
                                        @click="toggle(i)"
                                    >
                                        Manage
                                        <template #icon>
                                            <Icon
                                                name="chevron"
                                                :size="16"
                                                :rotate="on ? 180 : 0"
                                            />
                                        </template>
                                    </Btn>
                                </template>
                                <template #dropdown>
                                    <p
                                        @click="addRedirect(position.pool)"
                                        class="list-item"
                                        :class="isMobile ? 'list-item--padded-sm' : 'list-item--padded'"
                                    >
                                        Add Liquidity
                                    </p>
                                    <p
                                        @click="removeRedirect(position.pool)"
                                        class="list-item"
                                        :class="isMobile ? 'list-item--padded-sm' : 'list-item--padded'"
                                    >
                                        Remove Liquidity
                                    </p>
                                </template>
                            </Dropdown>
                        </div>
                    </div>
                    <div class="pool__stats">
                        <div class="columns row">
                            <div>
                                <p>
                                    {{
                                        basicRound(formatUnits(position.base_amount, position.pool.base_token.decimals))
                                    }}
                                </p>
                                <p class="caption grey-text">{{ position.pool.base_token.symbol }} pooled</p>
                            </div>
                            <div>
                                <p>
                                    {{
                                        basicRound(
                                            formatUnits(position.quote_amount, position.pool.quote_token.decimals)
                                        )
                                    }}
                                </p>
                                <p class="caption grey-text">{{ position.pool.quote_token.symbol }} pooled</p>
                            </div>
                            <div>
                                <p>{{ basicRound(position.pool_share_pct) }}%</p>
                                <p class="caption grey-text">Pool share</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                v-else
                class="positions__list"
            >
                <div class="empty">
                    <div class="info row">
                        <div>
                            <Icon
                                class="icon"
                                name="warning"
                                :size="25"
                            />
                        </div>
                        <p>
                            There was an error while getting positions.
                            <span
                                @click="RefreshPositions"
                                class="text-highlight--underlined"
                                >retry</span
                            >
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { formatUnits } from "ethers"

import { basicRound, isSupportedChain, getUrl } from "~/helpers/index"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"

const stepStore = useStepStore()
const { connectedAccount, isMobile } = storeToRefs(stepStore)
const { PositionsData, PositionsPending, PositionsError, RefreshPositions } = inject("PositionsAsyncData")

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
        path: "/add-liquidity",
        query: {
            tk1: pool.base_token.address,
            tk2: pool.quote_token.address,
        },
    })
}

function removeRedirect(pool) {
    router.push({
        path: `/remove/${pool.pool_index}`,
    })
}
</script>

<style lang="scss" scoped>
.positions {
    &__top {
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid var(--swap-windows);
        padding-bottom: 25px;
        .link {
            text-decoration: none;
        }
    }
    &__length {
        padding: 25px 0;
        span {
            color: var(--text-color-reverse);
            background-color: var(--swap-windows);
            border-radius: 50px;
            padding: 0 10px;
        }
    }

    &__list {
        margin: 0 -30px;
        padding: 0 30px;
        height: 50vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
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
                gap: 1rem;

                .token-icon {
                    &:last-of-type {
                        margin-left: -14px;
                    }
                }
                .manage-btn {
                    margin-left: auto;
                    .list-item {
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
        .empty {
            height: 100%;
            display: flex;
            margin: 0 auto;
            flex-direction: column;
            justify-content: center;
            /* white-space: nowrap; */
            > p {
                margin-bottom: 21px;
            }
        }
    }
}
</style>
