<template>
    <!-- <div class="row"> -->
    <Widget no-return>
        <template #widget-title>Swap</template>
        <template #right-icon>
            <Dropdown
                :settings-ref="settings"
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
                        ref="settings"
                        :default-slippage="0.5"
                        :default-deadline="30"
                        :toggle-dropdown="toggleDropdown"
                        no-slippage
                    ></Settings>
                </template>
            </Dropdown>
        </template>
        <template #widget-content>
            <div class="tips">
                <!-- <FaucetTrigger
                    :closing-callback="() => getBothBalances(false, false)"
                    :connected-chain-id="connectedChainId"
                ></FaucetTrigger> -->
                <FaucetTriggerII :callback="() => getBothBalances(false, false)"></FaucetTriggerII>
            </div>
            <div class="windows">
                <div
                    class="contents"
                    v-for="(i, x) in new Array(2)"
                >
                    <div class="window layer-wdg-box">
                        <div class="window__upper">
                            <Btn
                                @click="openTokenSelectModal(x)"
                                :disabled="swappingDisabled"
                                opaque
                                selectable
                                custom
                            >
                                {{ Tokens[x] !== null ? Tokens[x]?.symbol : "Select token" }}
                                <template #icon>
                                    <Icon
                                        name="chevron"
                                        :size="16"
                                    />
                                </template>
                            </Btn>
                            <input
                                :class="{
                                    error: insufficientBalanceIndexes.includes(tkEnum.QUOTE) && x === tkEnum.QUOTE,
                                }"
                                type="text"
                                placeholder="0"
                                spellcheck="false"
                                autocomplete="off"
                                autocorrect="off"
                                :disabled="swappingDisabled"
                                @input="amountInputHandler($event, x)"
                                :value="userAmounts[amountsLabelOrder[x]]"
                            />
                        </div>
                        <div
                            class="window__lower row flex-end align-center"
                            @click="!swappingDisabled && fillInBalance(Balances[x], x)"
                            :class="{ disabled: !Tokens[x] || Balances[x] === 0n }"
                        >
                            <p class="caption">
                                {{ formatedBalances[x] }}
                            </p>
                            <Icon
                                name="wallet"
                                :size="13"
                            />
                        </div>
                    </div>
                    <div
                        v-if="x === 0"
                        class="mid-symbol arrow"
                    >
                        <Btn
                            circle
                            plain
                            active
                            @click="switchOrder()"
                        >
                            <template #icon>
                                <Icon
                                    name="arrow"
                                    :size="11"
                                />
                            </template>
                        </Btn>
                    </div>
                </div>
            </div>
            <div
                v-if="
                    (bothTokensThere && pool && !poolPending && BigInt(pool.depth) < fullAmounts.base) ||
                    insufficientBalanceIndexes.includes(tkEnum.QUOTE) ||
                    poolError
                "
                class="infos"
            >
                <div
                    v-if="poolError"
                    class="info row"
                >
                    <div>
                        <Icon
                            class="icon"
                            name="warning"
                            :size="25"
                        />
                    </div>
                    <p>
                        Pool not found. You can create it
                        <span
                            @click="addRedirect"
                            class="text-highlight--underlined"
                            >here</span
                        >.
                    </p>
                </div>
                <div
                    v-if="insufficientBalanceIndexes.includes(tkEnum.QUOTE)"
                    class="info info--warn row"
                >
                    <div>
                        <Icon
                            class="icon"
                            name="warning"
                            :size="25"
                        />
                    </div>
                    <p>Insufficient {{ Tokens[tkEnum.QUOTE].symbol }} funds</p>
                </div>
                <div
                    v-if="bothTokensThere && pool && !poolPending && BigInt(pool.depth) < fullAmounts.base"
                    class="info row"
                >
                    <div>
                        <Icon
                            class="icon"
                            name="warning"
                            :size="25"
                        />
                    </div>
                    <p>
                        <!-- There's currently
                        {{ roundFloor(formatUnits(pool.depth, Tokens[tkEnum.BASE].decimals)) }}
                        {{ Tokens[tkEnum.BASE].symbol }}
                        available for
                        {{
                            roundFloor(
                                formatUnits(calcQuote(BigInt(pool.depth), BigInt(price)), Tokens[tkEnum.QUOTE].decimals)
                            )
                        }}
                        {{ Tokens[tkEnum.QUOTE].symbol }}. You might still receive up to a desired amount at a fixed
                        price visible below. <br />
                        <span
                            class="text-highlight--underlined"
                            @click="fillInDepth(pool.depth)"
                            >Adjust my swap</span
                        > -->

                        Currently, only
                        {{ roundFloor(formatUnits(pool.depth, Tokens[tkEnum.BASE].decimals)) }}
                        {{ Tokens[tkEnum.BASE].symbol }}
                        is available at this fixed price. You'll pay solely for what you receive. Availability may
                        change in real-time.
                        <br />
                        <span
                            class="text-highlight--underlined"
                            @click="fillInDepth(pool.depth)"
                            >Adjust my swap</span
                        >

                        <!-- {{ roundCeiling(formatUnits(price, Tokens[tkEnum.QUOTE].decimals)) }} -->
                        <!-- {{ Tokens[tkEnum.QUOTE].symbol }} / {{ Tokens[tkEnum.BASE].symbol }} -->
                    </p>
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
                    v-else
                    @click="callSwap"
                    is="h4"
                    wide
                    bulky
                    :disabled="!canSwap || swappingDisabled || insufficientBalanceIndexes.includes(tkEnum.QUOTE)"
                >
                    Swap
                </Btn>
            </div>
            <div
                v-if="price && bothTokensThere"
                class="sum-up grey-text caption"
            >
                <p>
                    1 {{ Tokens[tkEnum.BASE].symbol }} =
                    {{ roundCeiling(formatUnits(price, Tokens[tkEnum.QUOTE].decimals)) }}
                    {{ Tokens[tkEnum.QUOTE].symbol }}
                </p>
                <div class="row space-between">
                    <p>
                        Volume available at this price ({{
                            roundCeiling(formatUnits(price, Tokens[tkEnum.QUOTE].decimals))
                        }}
                        {{ Tokens[tkEnum.QUOTE].symbol }})
                    </p>
                    <p>
                        {{ roundFloor(formatUnits(depth, Tokens[tkEnum.BASE].decimals)) }}
                        {{ Tokens[tkEnum.BASE].symbol }}
                    </p>
                </div>
            </div>
        </template>
    </Widget>
    <!-- <Widget no-return>
            <template #widget-title>temporary display</template>
            <template #widget-content>
                <div class="contents temp-display">
                    <div>
                        <h4>token A</h4>
                        <p><span class="grey-text">symbol: </span> {{ tokenA?.symbol }}</p>
                        <p><span class="grey-text">user amount: </span> {{ userAmounts.quote }}</p>
                        <p><span class="grey-text">full amount: </span> {{ fullAmounts.quote }}</p>
                    </div>
                    <div>
                        <h4>token B</h4>
                        <p><span class="grey-text">symbol: </span> {{ tokenB?.symbol }}</p>
                        <p><span class="grey-text">user amount: </span> {{ userAmounts.base }}</p>
                        <p><span class="grey-text">full amount: </span> {{ fullAmounts.base }}</p>
                    </div>
                    <div>
                        <p><span class="grey-text">price: </span> {{ pool?.price }}</p>
                    </div>
                </div>
            </template>
        </Widget> -->
    <!-- </div> -->
</template>

<script setup>
import { formatUnits } from "ethers"

import { storeToRefs } from "pinia"
import { useStepStore } from "@/stores/step"

import {
    useTokens,
    useBalances,
    usePools,
    useAmounts,
    isSupportedChain,
    widgetTypeObj,
    tkEnum,
    precision,
    roundCeiling,
    roundFloor,
} from "~/helpers/index"

const unhandled = "0x0000000000000000000000000000000000000000"

const stepStore = useStepStore()

const { featuredTokens, connectedAccount, connectedChainId, routerAddress } = storeToRefs(stepStore)

// TOKENS ------------------
const { tokenA, tokenB, Tokens, bothTokensThere, selectTokenIndex, setToken } = useTokens()
// TOKENS ------------------

// BALANCES ----------------
const { Balances, formatedBalances, getBothBalances, reverseBalances } = useBalances(
    Tokens,
    connectedAccount,
    connectedChainId
)
// BALANCES ----------------

// ROUTES ----------------
const router = useRouter()
const route = useRoute()
function findTokenByAddress(address) {
    const token = featuredTokens.value.find((el) => el.address === address)
    if (!token) {
        return null
    }
    return token
}
watch(
    featuredTokens,
    (newTokens) => {
        if (newTokens && newTokens.length > 0) {
            // Fetch tokenA and tokenB from route.query and update the values
            if (route.query.tk1) {
                tokenA.value = findTokenByAddress(route.query.tk1)
            }
            if (route.query.tk2) {
                tokenB.value = findTokenByAddress(route.query.tk2)
            }
        }
    },
    {
        immediate: true,
    }
)
// ROUTES ----------------

// POOL -----------------
const { pool, refreshPool, poolPending, poolError, price, depth, swap } = usePools(
    routerAddress,
    Tokens,
    connectedAccount,
    connectedChainId,
    route
)
// POOL -----------------

// WIDGET ------------------
const state = reactive({
    amountA: "",
    amountB: "",
    balanceA: "",
    balanceB: "",
    showRate: false,
    noSlippage: false,
    alreadyMounted: false,
})

const canSwap = computed(() => {
    return pool.value && bothAmountsIn.value
})
function switchOrder() {
    lastChangedAmount.value = oppositeInput(lastChangedAmount.value)
    selectTokenIndex.value = oppositeInput(selectTokenIndex.value)
    Tokens.value = Tokens.value.reverse()
    switchAmounts()
    reverseBalances()
}

const swappingDisabled = ref(false)
function callSwap() {
    swappingDisabled.value = true
    swap(
        pool.value.path,
        fullAmounts.quote,
        fullAmounts.base,
        BigInt(price.value),
        connectedAccount.value,
        settings.value.deadline,
        stepStore.connectedWallet.provider,
        refresh,
        stepStore.notify
    ).then(() => {
        swappingDisabled.value = false
    })
}
// const refreshEvents = inject("refreshEvents")
function refresh() {
    console.log("refresh() - swap")
    resetAmounts(tkEnum.QUOTE)
    resetAmounts(tkEnum.BASE)
    getBothBalances(false, false)
    refreshPool()
}
function fillInBalance(amount, inputIndex) {
    if (Tokens.value[inputIndex] && Number(Balances.value[inputIndex]) !== 0) {
        const formatedAmount = formatUnits(amount, Tokens.value[inputIndex].decimals)
        console.log("fillInBalance(amount, inputIndex)", formatedAmount, inputIndex)
        lastChangedAmount.value = inputIndex
        setUserAmount(formatedAmount, inputIndex)
        setFromUserToFullAmount(formatedAmount, Tokens.value[inputIndex].decimals, inputIndex)
    }
}
function fillInDepth(depth) {
    console.log("fillInDepth()")
    const formatedDepth = formatUnits(depth, Tokens.value[tkEnum.BASE].decimals)
    lastChangedAmount.value = tkEnum.BASE
    setUserAmount(formatedDepth, tkEnum.BASE)
    setFromUserToFullAmount(formatedDepth, Tokens.value[tkEnum.BASE].decimals, tkEnum.BASE)
}

const insufficientBalanceIndexes = computed(() => {
    let balanceIndexes = []
    if (connectedAccount.value) {
        Tokens.value.forEach((token, idx) => {
            if (!token) {
                return
            }
            if (Balances.value[idx] < fullAmountsMap.value[idx]) {
                balanceIndexes.push(idx)
            }
        })
    }
    return balanceIndexes
})
function addRedirect() {
    router.push({
        path: "/add-liquidity",
        query: {
            tk1: Tokens.value[tkEnum.QUOTE].address,
            tk2: Tokens.value[tkEnum.BASE].address,
        },
    })
}
// WIDGET ------------------

// AMOUNTS -----------------
const {
    userAmounts,
    fullAmounts,
    fullAmountsMap,
    lastChangedAmount,
    amountsLabelOrder,
    switchAmounts,
    getInputLabel,
    oppositeInput,
    amountInputHandler,
    setUserAmount,
    setFromUserToFullAmount,
    setFromFullToUserAmount,
    calcAndSetOpposingInput,
    calcQuote,
    resetAmounts,
    bothAmountsIn,
} = useAmounts(Tokens, pool, widgetTypeObj.swap)

function Round(amt) {
    let amount = Number(amt)
    amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
    if (amount == 0) {
        return ""
    }
    return Number(amount) < 0.00001 ? "<0.00001" : String(parseFloat(amount))
}

// MODAL STUFF -------------
const toggleSelectTokenModal = inject("selectTokenModal")
function openTokenSelectModal(index) {
    toggleSelectTokenModal(Tokens.value, (arg) => setToken(arg, reverseBalances), index)
    selectTokenIndex.value = index
}
// MODAL STUFF -------------

//SETTINGS--------------
const settings = ref()
//SETTINGS--------------

watch(
    Tokens,
    async (tokens, oldTokens) => {
        console.log("- - - - - - - - - - - - - - -\nwatch(Tokens)")

        // adding query params to url
        if (featuredTokens.value && featuredTokens.value.length > 0) {
            const obj = {}
            tokens.forEach((el, index) => (el ? (obj["tk" + (index + 1)] = el.address) : false))
            router.replace({
                query: {
                    ...obj,
                },
            })
        }

        //getting balance
        const oldTokensAddresses = oldTokens?.map((oldTkn) => oldTkn?.address)
        const areNewOldReversered = tokens?.every((tkn) => oldTokensAddresses?.includes(tkn?.address))
        console.log("areNewTokensOldReversered:", areNewOldReversered)
        const selectIndex = selectTokenIndex.value
        if (!areNewOldReversered && tokens[selectIndex]) {
            getBothBalances(selectIndex)
        }

        // setting full amount
        const newTokenIndex = selectTokenIndex.value
        const lastChangedAmountIndex = lastChangedAmount.value
        console.log("watch(Tokens) - new token:", getInputLabel(newTokenIndex))
        console.log("watch(Tokens) - last changed amount:", getInputLabel(lastChangedAmountIndex))
        if (newTokenIndex === lastChangedAmountIndex && Tokens.value[newTokenIndex]) {
            setFromUserToFullAmount(
                userAmounts[amountsLabelOrder.value[lastChangedAmountIndex]],
                Tokens.value[newTokenIndex].decimals,
                lastChangedAmountIndex
            )
        }

        // fetching pool
        if (bothTokensThere.value) {
            resetAmounts(oppositeInput(lastChangedAmountIndex))
            await refreshPool()
            console.log("watch(Tokens) - pool.value: ", pool.value?.name)
            if (pool.value) {
                calcAndSetOpposingInput(
                    fullAmounts[getInputLabel(lastChangedAmountIndex)],
                    lastChangedAmountIndex,
                    BigInt(pool.value.base_reserves),
                    BigInt(pool.value.quote_reserves),
                    BigInt(pool.value.price)
                )
            }
        }
    },
    {
        immediate: true,
    }
)
</script>
