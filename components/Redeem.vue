<template>
    <Widget>
        <template #widget-title>Redeem liquidity</template>
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
                        no-slippage
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
            <div v-if="pool && ownedPosition">
                <div class="row space-between">
                    <p class="grey-text">Pooled {{ pool.base_token.symbol }}:</p>
                    <p>
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
                <div class="row space-between">
                    <p class="grey-text">Pooled {{ pool.quote_token.symbol }}:</p>
                    <p>
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
                v-else-if="status === 'pending' || !ownedPosition"
                class="placeholder"
            >
                <p>placeholder</p>
                <p>text</p>
            </div>
            <div class="infos contents">
                <div
                    v-if="pool && ownedPosition === false"
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
                    v-if="status === 'success' && !pool"
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
                    v-else-if="isSupportedChain(chainId)"
                    is="h4"
                    wide
                    bulky
                    :disabled="!ownedPosition"
                    @click="redeemLiquidityCall()"
                >
                    Remove Liquidity
                </Btn>
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
const { connectAccount, positions, chainId } = storeToRefs(stepStore)

const { redeemLiquidity } = usePools(stepStore.routerAddress)

const state = reactive({
    redeemPercent: 100,
})

const options = ref()
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
function redeemLiquidityCall() {
    redeemLiquidity(
        pool.value.base_token,
        pool.value.quote_token,
        ownedPosition.value.base_amount,
        ownedPosition.value.quote_amount,
        state.redeemPercent,
        pool.value.lp_token,
        ownedPosition.value.lp_amount,
        stepStore.connectedAccount,
        settingsRedeem.value.deadline,
        stepStore.connectedWallet.provider
    )
}

const ownedPosition = computed(() => {
    if (!pool.value || !positions.value) {
        return null
    }
    const matchedPosition = positions.value.find((el) => el.pool.pool_index === pool.value.pool_index)
    if (!matchedPosition) {
        return false
    }
    return matchedPosition
})

//SETTINGS--------------
const settingsRedeem = ref()
//SETTINGS--------------

// ROUTES ----------------
const route = useRoute()
const {
    data: pool,
    error,
    status,
    pending,
} = useAsyncData(
    "pool",
    () => {
        if (isSupportedChain(chainId.value)) {
            console.log("fetching")
            return $fetch(getUrl(`/chain/${chainId.value}/pool/${route.params.address}`))
        }
    },
    {
        watch: [chainId],
    }
)

// ROUTES ----------------
</script>

<style lang="scss" scoped>
.icons-tokens {
    p {
        margin-left: 12px;
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
