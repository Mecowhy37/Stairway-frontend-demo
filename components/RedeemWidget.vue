<template>
    <div class="redeem base-box">
        <div class="top-bar row">
            <h3>Remove Liquidity</h3>
            <Dropdown
                :settings-ref="settingsRedeem"
                no-padding
            >
                <template #dropdown-activator="{ on }">
                    <Btn
                        transparent
                        tiny
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
                        :default-slippage="0.5"
                        :default-deadline="30"
                        :toggle-dropdown="toggleDropdown"
                    ></Settings>
                </template>
            </Dropdown>
        </div>
        <div>
            <!-- <p>{{ ABTokens[0].symbol }} / {{ ABTokens[1].symbol }}</p> -->
            <p>fBTC / fUSD</p>
        </div>
        <div class="amount">
            <p class="grey-text">Amount</p>
            <div class="percents row">
                <h1>{{ state.redeemPercent }}%</h1>
                <div
                    class="options row"
                    ref="options"
                >
                    <Btn
                        plain
                        opaque
                        outline
                        compact
                        @click="setRedeemProc($event, 25)"
                        >25%</Btn
                    >
                    <Btn
                        plain
                        opaque
                        outline
                        compact
                        @click="setRedeemProc($event, 50)"
                        >50%</Btn
                    >
                    <Btn
                        plain
                        opaque
                        outline
                        compact
                        @click="setRedeemProc($event, 75)"
                        >75%</Btn
                    >
                    <Btn
                        plain
                        opaque
                        outline
                        compact
                        @click="setRedeemProc($event, 100)"
                        >Max</Btn
                    >
                </div>
            </div>
        </div>
        <div class="slider">
            <input
                type="range"
                min="0"
                max="100"
                step="1"
                v-model="state.redeemPercent"
                @input="removeSelected()"
            />
        </div>
        <!-- <p>your pool share: {{ poolShare }}%</p> -->
        <!-- <p>procent to redeem: {{ state.redeemPercent }}%</p> -->
        <div class="summary">
            <div class="row">
                <!-- <p class="grey-text">pooled {{ ABTokens[0]?.symbol }}:</p> -->
                <p class="grey-text">pooled fUSD:</p>
                <!-- <p>
                {{
                    ABTokens[0]?.address === thisTokenAddress
                        ? (((thisReserve * poolShare) / 100) * state.redeemPercent) / 100
                        : (((thatReserve * poolShare) / 100) * state.redeemPercent) / 100
                }}
            </p> -->
                7593
            </div>
            <div class="row">
                <!-- <p class="grey-text">pooled {{ ABTokens[1]?.symbol }}:</p> -->
                <p class="grey-text">pooled fBTC:</p>
                <!-- <p>
                {{
                    ABTokens[1]?.address === thisTokenAddress
                        ? (((thisReserve * poolShare) / 100) * state.redeemPercent) / 100
                        : (((thatReserve * poolShare) / 100) * state.redeemPercent) / 100
                }}
            </p> -->
                7593
            </div>
        </div>
        <div class="buttons">
            <Btn
                is="h4"
                wide
                bulky
                @click="redeemLiquidityCall()"
            >
                Remove Liquidity
            </Btn>
        </div>
    </div>
</template>

<script setup>
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
    console.log("redeemLiquidityCall()")

    // redeemLiquidity(
    //     ...bothTokenAddresses.value,
    //     state.redeemPercent,
    //     stepStore.connectedAccount,
    //     settingsRedeem.value.deadline,
    //     stepStore.connectedWallet.provider
    // )
}

//SETTINGS--------------
const settingsRedeem = ref()
//SETTINGS--------------
</script>

<style lang="scss">
.redeem {
    width: 450px;
    flex-grow: 0;
    color: var(--text-color-reverse);
    border-radius: var(--outer-wdg-radius);
    filter: var(--drop-shadow);
    padding: 0 20px;
    & > div {
        margin-bottom: 20px;
    }
    .amount {
        .percents {
            align-items: center;
            justify-content: space-between;
            .options {
                justify-content: flex-end;
                gap: 5px;
            }
        }
    }
    .slider {
        position: relative;
        ::before {
            content: "";
            position: absolute;
            top: 50%;
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
                background: var(--primary-disabled-bg);
                border-radius: 500px;
                height: 6px;
            }
            &::-moz-range-track {
                background: var(--primary-disabled-bg);
                border-radius: 500px;
                height: 6px;
            }
            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                height: 36px;
                width: 36px;
                background-color: var(--primary-btn-bg);
                margin-top: calc(3px - 18px);
                border-radius: 5000px;
            }
            &::-moz-range-thumb {
                -webkit-appearance: none;
                height: 36px;
                width: 36px;
                background-color: var(--primary-btn-bg);
                margin-top: calc(3px - 18px);
                border-radius: 5000px;
            }
            &::-webkit-progress-bar {
                background-color: var(--primary-btn-bg);
            }
        }
    }
    .summary {
        .row {
            justify-content: space-between;
        }
    }
}
</style>
