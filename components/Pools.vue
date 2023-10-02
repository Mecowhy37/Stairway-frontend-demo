<template>
    <div class="wrapper--wide-list">
        <div class="positions">
            <div class="positions__top row">
                <h1 class="scale">Liquidity</h1>
                <!-- <Btn @click="stepStore.refreshPositions()">refresh positions - {{ positionsStatus }}</Btn> -->
                <NuxtLink
                    v-if="positions.length > 0"
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

            <h3 class="positions__length">
                Your liquidity pools <span>{{ positions.length }}</span>
            </h3>
            <div
                v-if="positionsPending && !positions.length > 0"
                class="positions__list"
            >
                <div class="pools">
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
            </div>

            <div
                v-else-if="positions.length > 0"
                class="positions__list"
            >
                <div class="pools">
                    <div
                        v-for="(position, i) in positions"
                        class="pool"
                        :key="position.pool.pool_index"
                    >
                        <div>
                            <div class="pool__heading row">
                                <div class="icons-wrapper row">
                                    <img
                                        class="token-icon"
                                        :src="position.pool.base_token.logo_uri"
                                    />
                                    <img
                                        class="token-icon"
                                        :src="position.pool.quote_token.logo_uri"
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
                                            Add liquidity
                                        </p>
                                        <p
                                            @click="removeRedirect(position.pool)"
                                            class="list-item"
                                            :class="isMobile ? 'list-item--padded-sm' : 'list-item--padded'"
                                        >
                                            Remove liquidity
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
                                            basicRound(
                                                formatUnits(position.base_amount, position.pool.base_token.decimals)
                                            )
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
            </div>

            <div
                v-else
                class="positions__list"
            >
                <div class="pools">
                    <div class="empty">
                        <p>Your active liquidity will be listed here</p>
                        <NuxtLink
                            v-if="connectedAccount"
                            class="link"
                            to="/add-liquidity"
                        >
                            <Btn
                                is="h4"
                                reverse
                                wide
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
                        <Btn
                            v-else
                            is="h4"
                            bulky
                            @click="stepStore.connectWallet()"
                        >
                            Connect wallet
                        </Btn>
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
// const { connectedAccount, connectedChainId, isMobile } = storeToRefs(stepStore)
const { positions, positionsPending, connectedAccount, connectedChainId, isMobile } = storeToRefs(stepStore)
const { refreshPositions } = stepStore

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

// const positions = ref([])
// const PositionsPending = ref(true)
const {
    data: PositionsData,
    pending: PositionsPending,
    refresh: RefreshPositions,
    error: PositionsError,
    status: PositionsStatus,
} = await useAsyncData(
    "positions",
    () => {
        if (connectedAccount.value && isSupportedChain(connectedChainId.value)) {
            console.log("fetching positions on chain:", connectedChainId.value)
            return $fetch(getUrl(`/chain/${connectedChainId.value}/user/${connectedAccount.value}/positions`))
        }
    },
    {
        default: () => [...positions.value],
        lazy: true,
        server: false,
        watch: [connectedChainId, connectedAccount],
    }
)

watch(
    () => [PositionsData.value, PositionsStatus.value, PositionsPending.value],
    ([newPositions, newStatus, newPending]) => {
        if (newPositions) {
            stepStore.positions = newPositions
        }
        stepStore.positionsStatus = newStatus
        stepStore.positionsPending = newPending
    },
    {
        immediate: true,
    }
)
// stepStore.refreshPositions = RefreshPositions
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
        .pools {
            height: 50vh;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            /* align-items: center; */
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
                            margin-left: -7px;
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
                width: min-content;
                height: 100%;
                display: flex;
                margin: 0 auto;
                flex-direction: column;
                justify-content: center;
                white-space: nowrap;
                p {
                    margin-bottom: 21px;
                }
            }
        }
    }
}
</style>
