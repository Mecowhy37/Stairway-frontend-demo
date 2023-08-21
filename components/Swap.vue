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
                <div
                    class="tips"
                    v-if="connectedChainId !== 137"
                >
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
                                    @input="amountInputHandler($event, x)"
                                    :value="userAmounts[amountsLabelOrder[x]]"
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
                <!-- <div
                    v-if="bothTokensThere && pool && !poolPending && BigInt(pool.depth) < fullAmounts.base"
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
                        <p>you will only receive {{ prettyDepth }} {{ Tokens[tkEnum.BASE].symbol }} at this price</p>
                    </div>
                </div> -->
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
                <!-- <div
                    v-if="price && bothTokensThere"
                    class="sum-up grey-text caption"
                >
                    <p>1 {{ Tokens[tkEnum.BASE].symbol }} = {{ prettyPrice }} {{ Tokens[tkEnum.QUOTE].symbol }}</p>
                    <div class="row space-between">
                        <p>Volume available at this price ({{ prettyPrice }} {{ Tokens[tkEnum.BASE].symbol }})</p>
                        <p>{{ prettyDepth }} {{ Tokens[tkEnum.BASE].symbol }}</p>
                    </div>
                </div> -->
            </template>
        </Widget>
        <Widget no-return>
            <template #widget-title>temporary display</template>
            <template #widget-content>
                <div class="contents temp-display">
                    <div>
                        <h4>token A</h4>
                        <p><span class="grey-text">symbol: </span> {{ tokenA?.symbol }}</p>
                        <p><span class="grey-text">user amount: </span> {{ userAmounts.quote }}</p>
                        <p><span class="grey-text">full amount: </span> {{ fullAmounts.quote }}</p>
                        <!-- <p><span class="grey-text">quote_reserves: </span>{{ pool?.quote_reserves }}</p> -->
                    </div>
                    <div>
                        <h4>token B</h4>
                        <p><span class="grey-text">symbol: </span> {{ tokenB?.symbol }}</p>
                        <p><span class="grey-text">user amount: </span> {{ userAmounts.base }}</p>
                        <p><span class="grey-text">full amount: </span> {{ fullAmounts.base }}</p>
                        <!-- <p><span class="grey-text">base_reserves: </span>{{ pool?.base_reserves }}</p> -->
                    </div>
                    <div>
                        <p><span class="grey-text">price: </span> {{ pool?.price }}</p>
                    </div>
                </div>
            </template>
        </Widget>
    </div>
</template>

<script setup>
import { storeToRefs } from "pinia"
import { useStepStore } from "@/stores/step"
import { formatUnits, parseUnits } from "ethers"

import {
    useTokens,
    useBalances,
    usePools,
    useAmounts,
    isSupportedChain,
    widgetTypeObj,
    tkEnum,
    precision,
} from "~/helpers/index"

const unhandled = "0x0000000000000000000000000000000000000000"

const stepStore = useStepStore()

const { featuredTokens, connectedAccount, connectedChainId, routerAddress } = storeToRefs(stepStore)

// TOKENS ------------------
const { tokenA, tokenB, Tokens, bothTokensThere, selectTokenIndex, setToken } = useTokens()
// TOKENS ------------------

// POOL -----------------
const { pool, refreshPool, poolPending, price, depth, swap } = usePools(
    routerAddress,
    Tokens,
    connectedAccount,
    connectedChainId
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
    Balances.value = Balances.value.reverse()
}
function callSwap() {
    swap(
        ...Tokens.value,
        fullAmounts.quote,
        fullAmounts.base,
        BigInt(price.value),
        connectedAccount.value,
        settings.value.deadline,
        stepStore.connectedWallet.provider
    )
}
// WIDGET ------------------

// AMOUNTS -----------------
const {
    userAmounts,
    fullAmounts,
    lastChangedAmount,
    amountsLabelOrder,
    switchAmounts,
    getInputLabel,
    oppositeInput,
    amountInputHandler,
    setFromUserToFullAmount,
    calcAndSetOpposingInput,
    resetAmounts,
    bothAmountsIn,
    roundCeiling,
} = useAmounts(Tokens, pool, widgetTypeObj.swap)

function Round(amt) {
    let amount = Number(amt)
    amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
    if (amount == 0) {
        return ""
    }
    return Number(amount) < 0.00001 ? "<0.00001" : String(parseFloat(amount))
}
// BALANCES ----------------
const { getTokenBalance } = useBalances()

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

        // setting full amount
        const newTokenIndex = selectTokenIndex.value
        const newAmountIndex = lastChangedAmount.value
        console.log("watch(Tokens) - new token:", getInputLabel(newTokenIndex))
        console.log("watch(Tokens) - new amount:", getInputLabel(newAmountIndex))
        if (newTokenIndex === newAmountIndex && Tokens.value[newTokenIndex]) {
            setFromUserToFullAmount(
                userAmounts[amountsLabelOrder.value[newAmountIndex]],
                Tokens.value[newTokenIndex].decimals,
                newAmountIndex
            )
        }

        // fetching pool
        if (bothTokensThere.value) {
            resetAmounts(oppositeInput(newAmountIndex))
            await refreshPool()
            console.log("watch(Tokens) - pool.value: ", pool.value?.name)
            if (pool.value) {
                calcAndSetOpposingInput(
                    fullAmounts[getInputLabel(newAmountIndex)],
                    newAmountIndex,
                    BigInt(pool.value.base_reserves),
                    BigInt(pool.value.quote_reserves),
                    BigInt(pool.value.price)
                )
            }
        }
        getBothBalances()
    },
    {
        immediate: true,
    }
)

async function getBothBalances() {
    if (connectedAccount.value && isSupportedChain(connectedChainId.value)) {
        state.balanceA = await getTokenBalance(Tokens.value[0], connectedAccount.value, connectedChainId.value)
        state.balanceB = await getTokenBalance(Tokens.value[1], connectedAccount.value, connectedChainId.value)
    }
}

//GETS BALANCES BY TOKENS AND WALLET
watch(
    () => [connectedAccount.value, connectedChainId.value],
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
