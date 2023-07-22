<template>
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
            <div
                v-if="true"
                class="tips"
            >
                <p>
                    <span class="text-highlight">Tip: </span>To try out the interface you'll need some tokens, you can
                    get them
                    <span
                        @click="openNewTokenModal"
                        class="activator-link text-highlight"
                        >here</span
                    >.
                </p>
                <p>
                    <span class="text-highlight">Tip:</span> Pool with these tokens doesnt exist yet,
                    <span class="text-highlight">create it.</span>
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
                                :value="Amounts[x]"
                                @input="setTokenAmount($event, x)"
                            />
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
                v-if="bothTokensThere && pool && Number(displayDepth) < Number(Amounts[1])"
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
                <p>1 {{ Tokens[1].symbol }} = {{ rate }} {{ Tokens[0].symbol }}</p>
                <div class="row space-between">
                    <p>Volume available at this price ({{ rate }} {{ Tokens[0].symbol }})</p>
                    <p>{{ Round(displayDepth) }} {{ Tokens[1].symbol }}</p>
                </div>
                <!-- <div class="row space-between">
                    <p>Gas price</p>
                    <p>$0.00021</p>
                </div> -->
            </div>
        </template>
    </Widget>
</template>

<script setup>
import { storeToRefs } from "pinia"
import { useStepStore } from "@/stores/step"
import { BrowserProvider, Contract, formatUnits, parseEther, formatEther, parseUnits } from "ethers"

import { useTokens, useBalances, usePools, isSupportedChain } from "~/helpers/index"
import { isNoSubstitutionTemplateLiteral } from "typescript"

const unhandled = "0x0000000000000000000000000000000000000000"

const stepStore = useStepStore()

const { featuredTokens, connectedAccount, chainId } = storeToRefs(stepStore)

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
const { pool, bidAsk, bidAskFormat, displayDepth, swap } = usePools(
    stepStore.routerAddress,
    Tokens,
    connectedAccount,
    chainId
)
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
}
function callSwap() {
    swap(
        ...Tokens.value,
        AmountsUint.value,
        bidAsk.value[1],
        connectedAccount.value,
        settings.value.deadline,
        stepStore.connectedWallet.provider
    )
}
// WIDGET ------------------

// AMOUNTS -----------------
const Amounts = computed({
    get() {
        const list = [state.amountA, state.amountB]
        if (bidAsk.value) {
            if (list[state.lastChangedToken] === "") {
                list[Number(!Boolean(state.lastChangedToken))] = ""
                return list
            }
            if (state.lastChangedToken === 0) {
                // list[1] = Round(calcQuote(list[0]))
                list[1] = calcQuote(list[0])
            } else if (state.lastChangedToken === 1) {
                // list[0] = Round(calcBase(list[1]))
                list[0] = calcBase(list[1])
            }
        }
        return list
    },
    set(newVal) {
        state.amountA = newVal[0]
        state.amountB = newVal[1]
    },
})
const AmountsUint = computed(() => {
    return Amounts.value.map((el, index) => {
        if (!el || !Tokens.value[index]) {
            return "0"
        }

        let elem = el
        const regex = /[<>]/
        if (regex.test(elem)) {
            elem = "0.00001"
        }
        return parseUnits(elem, Tokens.value[index].decimals)
    })
})
const rate = computed(() => {
    return bidAskFormat.value ? Round(String(1 * bidAskFormat.value[1])) : null
})
function setTokenAmount(event, inputIndex) {
    state.lastChangedToken = inputIndex
    Amounts.value = Amounts.value.map((el, i) => (inputIndex === i ? event.target.value : el))
}

function calcBase(value) {
    return String(Number(value) * bidAskFormat.value[1])
}
function calcQuote(value) {
    return String(Number(value) / bidAskFormat.value[1])
}
function Round(amt) {
    let amount = Number(amt)
    amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
    if (amount == 0) {
        return ""
    }
    return Number(amount) < 0.00001 ? "<0.00001" : String(parseFloat(amount))
}
function cleanInput(value, oldValue) {
    value = value.replace(/[^\d.,]/g, "").replace(/,/g, ".")
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
if (route.query.tk1) {
    tokenA.value = findTokenByAddress(route.query.tk1)
}
if (route.query.tk2) {
    tokenB.value = findTokenByAddress(route.query.tk2)
}
// ROUTES ----------------

watch(
    Tokens,
    async (tokens) => {
        // adding query params to url
        const obj = {}
        tokens.map((el, index) => (el ? (obj["tk" + (index + 1)] = el.address) : false))
        router.replace({
            query: {
                ...obj,
            },
        })

        //getting balance
        if (connectedAccount.value && isSupportedChain(chainId.value)) {
            if (selectTokenIndex.value === 0) {
                state.balanceA = await getTokenBalance(tokens[0], connectedAccount.value, chainId.value)
            } else {
                state.balanceB = await getTokenBalance(tokens[1], connectedAccount.value, chainId.value)
            }
        }
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
