<template>
    <div class="row">
        <Widget no-return>
            <template #widget-title>Trade</template>
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
                    <p>
                        <span class="text-highlight">Tip: </span>
                        Get tokens for test
                        <span
                            @click="openNewTokenModal"
                            class="activator-link text-highlight"
                            >here</span
                        >
                    </p>
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
                                    type="text"
                                    placeholder="0"
                                    spellcheck="false"
                                    autocomplete="off"
                                    autocorrect="off"
                                    :value="state.lastChangedToken === x ? Amounts[x] : Round(Amounts[x])"
                                    @input="setTokenAmount($event, x)"
                                />
                                <!-- :value="Amounts[x]" -->
                            </div>
                            <div class="window__lower row flex-end align-center">
                                <p class="caption">{{ Number(Balances[x]) }}</p>
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
                    v-if="bothTokensThere && pool && !poolPending && Number(displayDepth) < Number(Amounts[1])"
                    class="infos"
                >
                    <div class="info row">
                        <div>
                            <Icon
                                class="icon"
                                name="warning"
                                :size="25"
                            />
                        </div>
                        <p>you will only receive {{ Round(displayDepth) }} {{ Tokens[1].symbol }} at this price</p>
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
                        :disabled="!canSwap"
                    >
                        Swap
                    </Btn>
                    <Btn
                        @click="getBothBalances()"
                        is="h4"
                        wide
                        bulky
                        :disabled="!connectedAccount"
                    >
                        refresh balances
                    </Btn>
                </div>
                <div
                    v-if="bidAsk && bothTokensThere"
                    class="sum-up grey-text caption"
                >
                    <p>1 {{ Tokens[1].symbol }} = {{ Round(rate) }} {{ Tokens[0].symbol }}</p>
                    <div class="row space-between">
                        <p>Volume available at this price ({{ Round(rate) }} {{ Tokens[0].symbol }})</p>
                        <p>{{ Round(displayDepth) }} {{ Tokens[1].symbol }}</p>
                    </div>
                    <!-- <div class="row space-between">
                    <p>Gas price</p>
                    <p>$0.00021</p>
                </div> -->
                </div>
            </template>
        </Widget>
        <Widget no-return>
            <template #widget-title>temporary display</template>
            <template #widget-content>
                <div class="contents temp-display">
                    <div>
                        <div class="row align-center">
                            <h4>token A</h4>
                            <p>{{ state.lastChangedToken === 0 ? "- last changed" : "- calculated" }}</p>
                        </div>
                        <p><span class="grey-text">symbol: </span> {{ tokenA?.symbol }}</p>
                        <p><span class="grey-text">full amount: </span> {{ Amounts[0] }}</p>
                        <div v-if="state.lastChangedToken === 1">
                            <p><span class="grey-text">rounded: </span> {{ Round(Amounts[0]) }}</p>
                        </div>
                    </div>
                    <div>
                        <div class="row align-center">
                            <h4>token B</h4>
                            {{ state.lastChangedToken === 1 ? "- last changed" : "- calculated" }}
                        </div>
                        <p><span class="grey-text">symbol: </span> {{ tokenB?.symbol }}</p>
                        <p><span class="grey-text">full amount: </span> {{ Amounts[1] }}</p>
                        <div v-if="state.lastChangedToken === 0">
                            <p><span class="grey-text">rounded: </span> {{ Round(Amounts[1]) }}</p>
                        </div>
                    </div>
                    <div>
                        <h4>pool data</h4>
                        <div>
                            <p><span class="grey-text">bid: </span> {{ pool?.bid }} ({{ typeof pool?.bid }})</p>
                            <p><span class="grey-text">ask: </span> {{ pool?.ask }} ({{ typeof pool?.ask }})</p>
                        </div>
                        <div>
                            <p>
                                <span class="grey-text">bid_depth: </span> {{ pool?.bid_depth }} ({{
                                    typeof pool?.bid_depth
                                }})
                            </p>
                            <p>
                                <span class="grey-text">ask_depth: </span> {{ pool?.ask_depth }} ({{
                                    typeof pool?.ask_depth
                                }})
                            </p>
                        </div>
                    </div>
                    <div>
                        <h4>widget info</h4>
                        <div>
                            <p>
                                <span class="grey-text">avail. to recieve: </span> {{ displayDepth }} ({{
                                    typeof displayDepth
                                }})
                            </p>
                            <p><span class="grey-text">formula: </span> formatUnits(bid_depth, baseTK_decimals)</p>
                        </div>
                        <p><span class="grey-text">rate: </span> {{ rate }}</p>
                        <p><span class="grey-text">formula: </span> 1/bid</p>
                        <p>{{ AmountsUint[0].toString() }}</p>
                        <p>{{ AmountsUint[1].toString() }}</p>
                    </div>
                </div>
            </template>
        </Widget>
    </div>
</template>

<script setup>
import Decimal from "decimal.js"

import { storeToRefs } from "pinia"
import { useStepStore } from "@/stores/step"
import { BrowserProvider, Contract, formatUnits, parseEther, formatEther, parseUnits } from "ethers"

import { useTokens, useBalances, usePools, isSupportedChain } from "~/helpers/index"
import { isNoSubstitutionTemplateLiteral } from "typescript"

const unhandled = "0x0000000000000000000000000000000000000000"

const stepStore = useStepStore()

const { featuredTokens, connectedAccount, chainId, routerAddress } = storeToRefs(stepStore)

const { getTokenBalance } = useBalances()

const state = reactive({
    amountA: "",
    amountB: "",
    lastChangedToken: 0,
    balanceA: "",
    balanceB: "",
    showRate: false,
    noSlippage: false,
    alreadyMounted: false,
})

// TOKENS ------------------
const { tokenA, tokenB, Tokens, bothTokensThere, selectTokenIndex, setToken } = useTokens()
// TOKENS ------------------

// POOL -----------------
const { pool, poolPending, bidAsk, displayDepth, swap } = usePools(routerAddress, Tokens, connectedAccount, chainId)
// POOL -----------------

// WIDGET ------------------
const canSwap = computed(() => {
    return pool.value && bothAmountsIn.value
})
const bothAmountsIn = computed(() => {
    return Amounts.value.every((el) => el !== "")
})
function switchOrder() {
    Tokens.value = Tokens.value.reverse()
    Amounts.value = Amounts.value.reverse()
    Balances.value = Balances.value.reverse()
    state.lastChangedToken = Number(!Boolean(state.lastChangedToken))
    selectTokenIndex.value = Number(!Boolean(selectTokenIndex.value))
}
function callSwap() {
    swap(
        ...Tokens.value,
        AmountsUint.value,
        bidAsk.value[0],
        connectedAccount.value,
        settings.value.deadline,
        stepStore.connectedWallet.provider
    )
}
// WIDGET ------------------

// AMOUNTS -----------------
function Round(amt) {
    let amount = Number(amt)
    amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
    if (amount == 0) {
        return ""
    }
    return Number(amount) < 0.00001 ? "<0.00001" : String(parseFloat(amount))
}
const Amounts = computed({
    get() {
        const list = [state.amountA, state.amountB]
        if (bidAsk.value) {
            if (list[state.lastChangedToken] === "") {
                list[Number(!Boolean(state.lastChangedToken))] = ""
                return list
            }
            if (state.lastChangedToken === 0) {
                if (list[0].length !== 0 && !Number.isNaN(Number(list[0]))) {
                    list[1] = calcQuote(list[0])
                }
            } else if (state.lastChangedToken === 1) {
                if (list[1].length !== 0 && !Number.isNaN(Number(list[1]))) {
                    list[0] = calcBase(list[1])
                }
            }
        }
        return list
    },
    set(newVal) {
        state.amountA = newVal[0]
        state.amountB = newVal[1]
    },
})
function setTokenAmount(event, inputIndex) {
    state.lastChangedToken = inputIndex
    const newVal = event.target.value
    Amounts.value = Amounts.value.map((el, i) => (inputIndex === i ? newVal : el))
}

const AmountsUint = computed(() => {
    return Amounts.value.map((el, index) => {
        if (!el || !Tokens.value[index]) {
            return "0"
        }
        return parseUnits(el.toString(), Tokens.value[index].decimals)
    })
})
const rate = computed(() => {
    if (!bidAsk.value) {
        return null
    }
    const up = new Decimal(parseUnits("1", Tokens.value[0].decimals).toString())
    const down = new Decimal(bidAsk.value[0])
    return up.div(down)
})

function calcBase(value) {
    const qouteDecim = Tokens.value[1].decimals
    const inputed = new Decimal(parseUnits(value, qouteDecim).toString())
    const bid = new Decimal(bidAsk.value[0])
    return inputed.div(bid).toFixed(18).toString()
}
function calcQuote(value) {
    const baseDecim = Tokens.value[0].decimals
    const quoteDecim = Tokens.value[1].decimals
    const inputed = new Decimal(parseUnits(value, baseDecim).toString())
    const bid = new Decimal(bidAsk.value[0])
    return inputed
        .mul(bid)
        .div(10 ** (baseDecim + quoteDecim))
        .toFixed(18)
        .toString()
}

function cleanInput(value, oldValue) {
    // Remove spaces from the input value
    value = value.replace(/\s/g, "")

    // Replace any non-digit, non-dot, non-comma characters with an empty string
    value = value.replace(/[^\d.,]/g, "")

    // Replace commas with dots to handle decimal numbers
    value = value.replace(/,/g, ".")
    let dotCount = value.split(".").length - 1
    if (dotCount === 2) {
        value = oldValue
    }
    return value
}
// CLEANS IMPUTED AMOUNT
watch(
    Amounts,
    (newVal, oldVal) => {
        const [newA, newB] = [...newVal]
        const [oldA, oldB] = oldVal ? [...oldVal] : [null, null]
        if (state.lastChangedToken === 0) {
            state.amountA = cleanInput(newA, oldA)
        } else if (state.lastChangedToken === 1) {
            state.amountB = cleanInput(newB, oldB)
        }
    },
    {
        immediate: true,
    }
)
// AMOUNTS -----------------

// BALANCES ----------------
const Balances = computed({
    get() {
        return [state.balanceA, state.balanceB]
    },
    set(newVal) {
        state.balanceA = newVal[0]
        state.balanceB = newVal[1]
    },
})
// BALANCES ----------------

// MODAL STUFF -------------
const toggleSelectTokenModal = inject("selectTokenModal")
function openTokenSelectModal(index) {
    toggleSelectTokenModal(Tokens.value, setToken)
    selectTokenIndex.value = index
}
const { toggleNewTokenModal, isNewTokenModalOpen } = inject("newTokenModal")
function openNewTokenModal() {
    toggleNewTokenModal()
}
watch(isNewTokenModalOpen, (newVal) => {
    if (!newVal) {
        getBothBalances()
    }
})
// MODAL STUFF -------------

//SETTINGS--------------
const settings = ref()
//SETTINGS--------------

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

watch(
    Tokens,
    async (tokens, oldTokens) => {
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
        getBothBalances()
    },
    {
        immediate: true,
    }
)

async function getBothBalances() {
    if (connectedAccount.value && isSupportedChain(chainId.value)) {
        state.balanceA = await getTokenBalance(Tokens.value[0], connectedAccount.value, chainId.value)
        state.balanceB = await getTokenBalance(Tokens.value[1], connectedAccount.value, chainId.value)
    }
}

//GETS BALANCES BY TOKENS AND WALLET
watch(
    () => [connectedAccount.value, chainId.value],
    async (newVal) => {
        const [wallet, chain] = newVal
        if (wallet && isSupportedChain(chain)) {
            state.balanceA = await getTokenBalance(Tokens.value[0], wallet, chain)
            state.balanceB = await getTokenBalance(Tokens.value[1], wallet, chain)
        } else {
            Balances.value = ["", ""]
        }
    },
    {
        immediate: true,
    }
)
</script>
