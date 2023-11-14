<template>
    <Widget>
        <template #widget-title>Remove Liquidity</template>
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
                <div class="placeholder placeholder--in-widget row">
                    <div class="token-icon"></div>
                    <div class="token-icon"></div>
                </div>
                <p class="placeholder placeholder--in-widget">FETH / FBTC</p>
            </div>
            <div class="amount">
                <p class="grey-text">Amount</p>
                <div class="percents row">
                    <h1>{{ !ownedPosition ? 0 : redeemPercent }}%</h1>
                    <div
                        class="options row"
                        ref="options"
                    >
                        <Btn
                            opaque
                            selectable
                            outline
                            radio
                            :disabled="removingDisabled || !ownedPosition"
                            @click="setRedeemProc($event, 25)"
                            >25%</Btn
                        >
                        <Btn
                            opaque
                            selectable
                            outline
                            radio
                            :disabled="removingDisabled || !ownedPosition"
                            @click="setRedeemProc($event, 50)"
                            >50%</Btn
                        >
                        <Btn
                            opaque
                            selectable
                            outline
                            radio
                            :disabled="removingDisabled || !ownedPosition"
                            @click="setRedeemProc($event, 75)"
                            >75%</Btn
                        >
                        <Btn
                            opaque
                            selectable
                            outline
                            radio
                            :disabled="removingDisabled || !ownedPosition"
                            @click="setRedeemProc($event, 100)"
                            >Max</Btn
                        >
                    </div>
                </div>
            </div>
            <div
                class="slider"
                :class="{ 'slider--disabled': !ownedPosition || removingDisabled }"
            >
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    :disabled="removingDisabled || !ownedPosition"
                    v-model="redeemPercent"
                    @input="removeSelected()"
                />
            </div>

            <div
                v-if="
                    (connectedAccount && ownedPosition === false && !SinglePositionPending && !SinglePositionError) ||
                    SinglePositionError ||
                    !isSupportedChain(connectedChainId)
                "
                class="infos caption"
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
                    v-if="SinglePositionError"
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
                <div
                    v-if="!isSupportedChain(connectedChainId)"
                    class="info info--warn row"
                >
                    <div>
                        <Icon
                            class="icon"
                            name="warning"
                            :size="25"
                        />
                    </div>
                    <p>
                        You're on an unsupported network, please change to
                        <span
                            @click="setTheChain(80001)"
                            class="text-highlight--underlined"
                            >Polygon Mumbai</span
                        >.
                    </p>
                </div>
            </div>
            <div
                v-if="ownedPosition && isSupportedChain(connectedChainId)"
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
                                          redeemPercent) /
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
                                          redeemPercent) /
                                          100
                                  )
                                : 0
                        }}
                    </p>
                </div>
            </div>
            <div
                v-else-if="ownedPosition === false && SinglePositionPending && !SinglePositionError"
                class="placeholder placeholder--in-widget"
            >
                <p>placeholder</p>
                <p>text</p>
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
                    is="h4"
                    wide
                    bulky
                    :disabled="
                        !ownedPosition || removingDisabled || redeemPercent == 0 || !isSupportedChain(connectedChainId)
                    "
                    @click="redeemLiquidityCall()"
                >
                    Remove Liquidity
                </Btn>
            </div>
        </template>
    </Widget>
</template>

<script setup>
import { formatUnits, getAddress } from "ethers"
import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"
import { usePools } from "~/helpers/usePools"
import { basicRound, isSupportedChain, errorABI } from "~/helpers/index"

const stepStore = useStepStore()
const { routerAddress, connectedAccount, positions, connectedChainId } = storeToRefs(stepStore)
const { getSinglePostion, updatePositionsWithNewSingle, setTheChain } = stepStore

const redeemPercent = ref(100)

const options = ref(null)
function setRedeemProc(event, proc) {
    removeSelected()
    event.target.classList.add("selected")
    redeemPercent.value = proc
}
const progressPercent = computed(() => {
    return redeemPercent.value + "%"
})
function removeSelected() {
    options.value.childNodes.forEach((el) => el.classList.remove("selected"))
}
// ROUTES ----------------
const route = useRoute()
const { redeemLiquidity } = await usePools(routerAddress, [], connectedAccount, connectedChainId, route)
// ROUTES ----------------

function redeemLiquidityCall() {
    if (ownedPosition.value) {
        widgetLocker(true)
        // calculate percentages
        const amountQuote = calcPercentage(ownedPosition.value.quote_amount)
        const amountBase = calcPercentage(ownedPosition.value.base_amount)
        const lpAmount = calcPercentage(ownedPosition.value.lp_amount)

        function calcPercentage(amount) {
            return (BigInt(amount) * BigInt(redeemPercent.value)) / BigInt(100)
        }

        redeemLiquidity(
            pool.value.quote_token,
            pool.value.base_token,
            pool.value.lp_token,
            amountQuote,
            amountBase,
            lpAmount,
            settingsRedeem.value.slippage,
            settingsRedeem.value.deadline,
            stepStore.connectedWallet.provider,
            redeemLiquidityFailedHandler,
            eventReceivedHandler,
            stepStore.notify,
            widgetLocker
        )
    }
}

const removingDisabled = ref(false)

function widgetLocker(lock) {
    removingDisabled.value = lock
}

watch(
    connectedChainId,
    (newChain) => {
        widgetLocker(!isSupportedChain(newChain))
    },
    {
        immediate: true,
    }
)

function redeemLiquidityFailedHandler(error) {
    console.log("redeemLiquidityFailedHandler()", error)
    widgetLocker(false)
}

function eventReceivedHandler(lqEvent, originalCall, notifHolder) {
    console.log("eventReceivedHandler()", lqEvent)

    const {
        tokenQuote,
        tokenBase,
        amountQuote: originQuoteAmount,
        amountBase: originBaseAmount,
        lpAmount: originLpAmount,
    } = originalCall

    let eventQuoteToken
    let eventBaseToken
    if (getAddress(tokenQuote.address) === getAddress(lqEvent.this_token)) {
        eventQuoteToken = "this_out"
        eventBaseToken = "that_out"
    } else {
        eventQuoteToken = "that_out"
        eventBaseToken = "this_out"
    }

    const quoteAmountRedeemed = BigInt(lqEvent[eventQuoteToken])
    const quoteAmountDelta = originQuoteAmount - quoteAmountRedeemed

    const baseAmountRedeemed = BigInt(lqEvent[eventBaseToken])
    const baseAmountDelta = originBaseAmount - baseAmountRedeemed

    const lpAmountRedeemed = BigInt(lqEvent.lp_tokens_redeemed)
    const lpAmountDelta = originLpAmount - lpAmountRedeemed

    const fullRequiredLpIsRemoved = originLpAmount - lpAmountRedeemed === 0n

    console.log("originQuoteAmount:", originQuoteAmount)
    console.log("quoteAmountRedeemed:", quoteAmountRedeemed)
    console.log("quoteAmountDelta:", quoteAmountDelta)
    console.log("-----------------------")
    console.log("originBaseAmount:", originBaseAmount)
    console.log("baseAmountRedeemed:", baseAmountRedeemed)
    console.log("baseAmountDelta:", baseAmountDelta)
    console.log("-----------------------")
    console.log("originLpAmount:", originLpAmount)
    console.log("lpAmountRedeemed:", lpAmountRedeemed)
    console.log("lpAmountDelta:", lpAmountDelta)
    console.log("-----------------------")
    console.log("fullRequiredLpIsRemoved:", fullRequiredLpIsRemoved)

    const successData = {
        action: "redeemed",
        quote: {
            token: tokenQuote,
            amount: quoteAmountRedeemed.toString(),
        },
        base: {
            token: tokenBase,
            amount: baseAmountRedeemed.toString(),
        },
    }

    function sumTwoSuccessObejects(current, previous) {
        if (previous === null) {
            return current
        }
        const quoteSumAmount = BigInt(current.quote.amount) + BigInt(previous.quote.amount)
        const baseSumAmount = BigInt(current.base.amount) + BigInt(previous.base.amount)
        return {
            action: current.action,
            quote: {
                token: current.quote.token,
                amount: quoteSumAmount.toString(),
            },
            base: {
                token: current.base.token,
                amount: baseSumAmount.toString(),
            },
        }
    }

    const fullSuccessData = sumTwoSuccessObejects(successData, originalCall.successData)
    console.log("fullSuccessData:", fullSuccessData)

    const keepNotification = !fullRequiredLpIsRemoved
    stepStore.notify(notifHolder, "success", false, fullSuccessData, keepNotification)

    if (fullRequiredLpIsRemoved) {
        // all lpTokens redeemed
        setTimeout(() => {
            navigateTo({ path: "/liquidity" })
        }, 1000)
    } else {
        // NOT all lpTokens redeemed
        RefreshSinglePosition()
        if (!(baseAmountDelta < 0) || !(quoteAmountDelta < 0)) {
            originalCall.amountQuote = quoteAmountDelta
            originalCall.amountBase = baseAmountDelta
            originalCall.lpAmount = lpAmountDelta
            originalCall.successData = fullSuccessData
            originalCall.notifId = notifHolder.id
            setTimeout(() => {
                redeemLiquidity(...Object.values(originalCall))
            }, 1000)
        }
    }
}

const {
    pending: SinglePositionPending,
    refresh: RefreshSinglePosition,
    error: SinglePositionError,
} = await useAsyncData(
    "SinglePosition",
    () => {
        return getSinglePostion(route.params.address)
    },
    {
        lazy: true,
        server: false,
        transform: (newSinglePosition) => {
            if (newSinglePosition) {
                updatePositionsWithNewSingle(newSinglePosition)
            }
            return newSinglePosition
        },
    }
)

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
//SETTINGS--------------
const settingsRedeem = ref(null)
//SETTINGS--------------

const router = useRouter()

let positionRefreshInterval = null
const poolIsRemaining = ref(false)

startPositionRefresh()
//would be nice if this was a promise so that it cannot be called over again
function startPositionRefresh(poolRemaining = false) {
    const randomTimeout = Math.floor(Math.random() * (7000 - 4000 + 1)) + 4000

    if (positionRefreshInterval !== null) {
        stopPositionRefresh(positionRefreshInterval)
    }

    poolIsRemaining.value = poolRemaining
    positionRefreshInterval = setInterval(async () => {
        console.log("L o O p", positionRefreshInterval, randomTimeout / 1000 + "s")
        await RefreshSinglePosition()

        startPositionRefresh(poolRemaining)
    }, randomTimeout)
}

function stopPositionRefresh(intervalId = null) {
    console.log("clear loop", positionRefreshInterval)
    poolIsRemaining.value = false

    if (intervalId) {
        clearInterval(intervalId)
    } else {
        clearInterval(positionRefreshInterval)
    }

    positionRefreshInterval = null
}

const remover = router.beforeEach((to, from) => {
    if (to.name !== "remove") {
        console.log("EXITING REMOVE")
        stopPositionRefresh()
        remover()
    }
})
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
        background-color: var(--primary);
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
            background: var(--grey-stroke-sm);
            border-radius: 500px;
            height: 6px;
        }
        &::-moz-range-track {
            background: var(--grey-stroke-sm);
            border-radius: 500px;
            height: 6px;
        }
        &::-webkit-slider-thumb {
            z-index: 5;
            -webkit-appearance: none;
            appearance: none;
            height: 36px;
            width: 36px;
            background-color: var(--primary);
            margin-top: calc(4px - 18px);
            border-radius: 5000px;
        }
        &::-moz-range-thumb {
            -webkit-appearance: none;
            height: 36px;
            width: 36px;
            background-color: var(--primary);
            margin-top: calc(4px - 18px);
            border-radius: 5000px;
        }
        &::-webkit-progress-bar {
            background-color: var(--primary);
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
