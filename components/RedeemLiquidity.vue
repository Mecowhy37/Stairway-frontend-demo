<template>
    <Widget>
        <template #widget-title>Remove liquidity</template>
        <template #right-icon>
            <Dropdown
                :settings-ref="settingsRedeem"
                no-padding
                solid
            >
                <template #dropdown-activator="{ on }">
                    <Btn
                        transparent
                        circle
                        icon-contrast
                        class="grey-text"
                    >
                        <template #icon>
                            <Icon
                                name="cog"
                                :size="20"
                            />
                        </template>
                    </Btn>
                </template>
                <template #dropdown="{ toggleDropdown }">
                    <Settings
                        ref="settingsRedeem"
                        :default-slippage="0.5"
                        :default-deadline="30"
                        :toggle-dropdown="toggleDropdown"
                    ></Settings>
                </template>
            </Dropdown>
        </template>
        <template #widget-content>
            <div
                v-if="pool"
                class="icons-tokens row align-center"
            >
                <img
                    class="token-icon"
                    :src="pool.base_token.logo_uri"
                />
                <img
                    class="token-icon"
                    :src="pool.quote_token.logo_uri"
                />
                <p>{{ pool.base_token.symbol }} / {{ pool.quote_token.symbol }}</p>
            </div>
            <div
                v-else
                class="icons-tokens row align-center"
            >
                <div class="placeholder row">
                    <div class="token-icon"></div>
                    <div class="token-icon"></div>
                </div>
                <p class="placeholder">FETH / FBTC</p>
            </div>
            <div class="amount">
                <p class="grey-text">Amount</p>
                <div class="percents row">
                    <h1>{{ !pool || !ownedPosition ? 0 : state.redeemPercent }}%</h1>
                    <div
                        class="options row"
                        ref="options"
                    >
                        <Btn
                            opaque
                            selectable
                            outline
                            radio
                            :disabled="!pool || !ownedPosition"
                            @click="setRedeemProc($event, 25)"
                            >25%</Btn
                        >
                        <Btn
                            opaque
                            selectable
                            outline
                            radio
                            :disabled="!pool || !ownedPosition"
                            @click="setRedeemProc($event, 50)"
                            >50%</Btn
                        >
                        <Btn
                            opaque
                            selectable
                            outline
                            radio
                            :disabled="!pool || !ownedPosition"
                            @click="setRedeemProc($event, 75)"
                            >75%</Btn
                        >
                        <Btn
                            opaque
                            selectable
                            outline
                            radio
                            :disabled="!pool || !ownedPosition"
                            @click="setRedeemProc($event, 100)"
                            >Max</Btn
                        >
                    </div>
                </div>
            </div>
            <div
                class="slider"
                :class="{ 'slider--disabled': !pool || !ownedPosition }"
            >
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    :disabled="!pool || !ownedPosition"
                    v-model="state.redeemPercent"
                    @input="removeSelected()"
                />
            </div>
            <div
                v-if="pool && ownedPosition"
                class="pooled"
            >
                <div class="pooled__item row align-center">
                    <img
                        class="token-icon token-icon--sm"
                        :src="pool.base_token.logo_uri"
                    />
                    <p class="pooled__item__symbol grey-text">Pooled {{ pool.base_token.symbol }}:</p>
                    <p class="pooled__item__amount">
                        {{
                            ownedPosition
                                ? basicRound(
                                      (Number(
                                          formatUnits(ownedPosition.base_amount, ownedPosition.pool.base_token.decimals)
                                      ) *
                                          state.redeemPercent) /
                                          100
                                  )
                                : 0
                        }}
                    </p>
                </div>
                <div class="pooled__item row align-center">
                    <img
                        class="token-icon token-icon--sm"
                        :src="pool.quote_token.logo_uri"
                    />
                    <p class="pooled__item__symbol grey-text">Pooled {{ pool.quote_token.symbol }}:</p>
                    <p class="pooled__item__amount">
                        {{
                            ownedPosition
                                ? basicRound(
                                      (Number(
                                          formatUnits(
                                              ownedPosition.quote_amount,
                                              ownedPosition.pool.quote_token.decimals
                                          )
                                      ) *
                                          state.redeemPercent) /
                                          100
                                  )
                                : 0
                        }}
                    </p>
                </div>
            </div>
            <div
                v-else-if="ownedPosition === false && SinglePositionPending"
                class="placeholder"
            >
                <p>placeholder</p>
                <p>text</p>
            </div>
            <div
                v-if="
                    (connectedAccount && ownedPosition === false && !SinglePositionPending && !SinglePositionError) ||
                    (SinglePositionError && !SinglePositionPending)
                "
                class="infos contents"
            >
                <div
                    v-if="connectedAccount && ownedPosition === false && !SinglePositionPending && !SinglePositionError"
                    class="info row"
                >
                    <div>
                        <Icon
                            class="icon"
                            name="warning"
                            :size="25"
                        />
                    </div>
                    <p>You dont have any liquidity at this position.</p>
                </div>
                <div
                    v-if="SinglePositionError && !SinglePositionPending"
                    class="info row"
                >
                    <div>
                        <Icon
                            class="icon"
                            name="warning"
                            :size="25"
                        />
                    </div>
                    <p>Pool with ID: {{ route.params.address }} doesnt exist</p>
                </div>
            </div>
            <div class="buttons">
                <Btn
                    v-if="!stepStore.connectedWallet"
                    is="h4"
                    wide
                    bulky
                    @click="stepStore.connectWallet()"
                >
                    Connect wallet
                </Btn>
                <Btn
                    v-else-if="isSupportedChain(connectedChainId)"
                    is="h4"
                    wide
                    bulky
                    :disabled="!ownedPosition"
                    @click="redeemLiquidityCall()"
                >
                    Remove Liquidity
                </Btn>
                <!-- <Btn
                    @click="refresh()"
                    wide
                    bulky
                    :disabled="!connectedAccount"
                >
                    refresh data
                </Btn> -->
            </div>
        </template>
    </Widget>
</template>

<script setup>
import { formatUnits } from "ethers"
import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"
import { usePools, basicRound, isSupportedChain, getUrl } from "~/helpers/index"

const stepStore = useStepStore()
const { routerAddress, connectedAccount, positions, connectedChainId } = storeToRefs(stepStore)
const { refreshPositions, getSinglePostion, updatePositionsWithNewSingle } = stepStore

const state = reactive({
    redeemPercent: 100,
})

const options = ref(null)
function setRedeemProc(event, proc) {
    removeSelected()
    event.target.classList.add("selected")
    state.redeemPercent = proc
}
const progressPercent = computed(() => {
    return state.redeemPercent + "%"
})
function removeSelected() {
    options.value.childNodes.forEach((el) => el.classList.remove("selected"))
}
// ROUTES ----------------
const route = useRoute()
const { redeemLiquidity } = usePools(routerAddress, [], connectedAccount, connectedChainId, route)
// ROUTES ----------------

function redeemLiquidityCall() {
    if (ownedPosition.value && pool.value) {
        redeemLiquidity(
            pool.value.base_token,
            pool.value.quote_token,
            ownedPosition.value.base_amount,
            ownedPosition.value.quote_amount,
            state.redeemPercent,
            pool.value.lp_token,
            ownedPosition.value.lp_amount,
            settingsRedeem.value.slippage,
            settingsRedeem.value.deadline,
            stepStore.connectedWallet.provider,
            refresh
        )
    }
}
const {
    data: SinglePositionData,
    pending: SinglePositionPending,
    refresh: RefreshSinglePosition,
    error: SinglePositionError,
    status: SinglePositionStatus,
} = await useAsyncData(
    "SinglePosition",
    () => {
        return getSinglePostion(route.params.address)
    },
    {
        lazy: true,
        server: false,
    }
)

watch(SinglePositionData, (newSinglePosition) => {
    if (newSinglePosition) {
        updatePositionsWithNewSingle(newSinglePosition)
    }
})
const ownedPosition = computed(() => {
    if (!positions.value) {
        return null
    }
    const matchedPosition = positions.value.find((el) => el.pool.pool_index == route.params.address)
    if (!matchedPosition) {
        return false
    }
    return matchedPosition
})
const pool = computed(() => {
    return ownedPosition.value?.pool
})
function refresh() {
    console.log("refresh()")
    refreshPool()
    refreshPositions()
}

//SETTINGS--------------
const settingsRedeem = ref(null)
//SETTINGS--------------
</script>

<style lang="scss" scoped>
.icons-tokens {
    p {
        margin-left: 12px;
    }
    .token-icon:last-of-type {
        margin-left: -7px;
    }
}
.amount {
    .percents {
        align-items: center;
        justify-content: space-between;
        h1 {
            padding-right: 5px;
            @media (max-width: 447px) {
                font-size: 2.75rem;
            }
        }
        .options {
            justify-content: flex-end;
            gap: 5px;
        }
    }
}
.slider {
    position: relative;
    margin-top: 8px;
    margin-bottom: 20px;
    ::before {
        content: "";
        position: absolute;
        top: 45%;
        left: 0;
        height: 6px;
        border-radius: 500px;
        width: v-bind(progressPercent);
        background-color: var(--primary-btn-bg);
        z-index: 0;
    }
    input[type="range"] {
        width: 100%;
        appearance: none;
        background: transparent;
        cursor: pointer;

        &::-webkit-slider-runnable-track {
            -webkit-appearance: none;
            appearance: none;
            background: var(--grey-opaque);
            border-radius: 500px;
            height: 6px;
        }
        &::-moz-range-track {
            background: var(--grey-opaque);
            border-radius: 500px;
            height: 6px;
        }
        &::-webkit-slider-thumb {
            z-index: 5;
            -webkit-appearance: none;
            appearance: none;
            height: 36px;
            width: 36px;
            background-color: var(--primary-btn-bg);
            margin-top: calc(4px - 18px);
            border-radius: 5000px;
        }
        &::-moz-range-thumb {
            -webkit-appearance: none;
            height: 36px;
            width: 36px;
            background-color: var(--primary-btn-bg);
            margin-top: calc(4px - 18px);
            border-radius: 5000px;
        }
        &::-webkit-progress-bar {
            background-color: var(--primary-btn-bg);
        }

        &:disabled {
            &::-webkit-slider-thumb {
                background-color: var(--placeholder-solid);
            }
            &::-moz-range-thumb {
                background-color: var(--placeholder-solid);
            }
        }
    }
    &--disabled {
        ::before {
            background-color: var(--placeholder-solid);
        }
    }
}
</style>
