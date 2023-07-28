<template>
    <Widget>
        <template #widget-title>Add liquidity</template>
        <template #right-icon>
            <Dropdown
                :settings-ref="settingsAdd"
                no-padding
                solid
            >
                <template #dropdown-activator="{ on }">
                    <Btn
                        circle
                        transparent
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
                        ref="settingsAdd"
                        :default-slippage="0.5"
                        :default-deadline="30"
                        :toggle-dropdown="toggleDropdown"
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
                                :value="Amounts[x]"
                                @input="setTokenAmount($event, x)"
                            />
                            <!-- :value="Amounts[x]" -->
                        </div>
                        <div class="window__lower row flex-end align-center">
                            <p class="caption">{{ Number(ABBalance[x]) }}</p>
                            <Icon
                                name="wallet"
                                :size="13"
                            />
                        </div>
                    </div>
                    <div
                        v-if="x === 0"
                        class="mid-symbol plus grey-text"
                    >
                        <Icon
                            name="plus"
                            :size="16"
                        />
                    </div>
                </div>
            </div>
            <div
                v-if="ownedPosition"
                class="tables"
            >
                <div>
                    <p>Pool share</p>
                    <div class="columns row">
                        <div>
                            <p>
                                {{
                                    basicRound(
                                        formatUnits(ownedPosition.base_amount, ownedPosition.pool.base_token.decimals)
                                    )
                                }}
                            </p>
                            <p class="caption grey-text">Pooled {{ ownedPosition.pool.base_token.symbol }}</p>
                        </div>
                        <div>
                            <p>
                                {{
                                    basicRound(
                                        formatUnits(ownedPosition.quote_amount, ownedPosition.pool.quote_token.decimals)
                                    )
                                }}
                            </p>
                            <p class="caption grey-text">Pooled {{ ownedPosition.pool.quote_token.symbol }}</p>
                        </div>

                        <!-- <div>
                            <p>78%</p>
                            <p class="caption grey-text">Pool share</p>
                        </div> -->
                    </div>
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
                    @click="callAddLiquidity()"
                    is="h4"
                    wide
                    bulky
                    :disabled="!bothAmountsIn || !bothTokensThere"
                >
                    Add liquidity
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
        </template>
    </Widget>
</template>

<script setup>
import { inject } from "vue"
import { BrowserProvider, Contract, parseEther, formatUnits } from "ethers"

import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"

import { useTokens, useBalances, usePools, basicRound, isSupportedChain } from "~/helpers/index"

const unhandled = "0x0000000000000000000000000000000000000000"
const stepStore = useStepStore()

const { featuredTokens, positions, connectedAccount, chainId } = storeToRefs(stepStore)

const state = reactive({
    amountA: "",
    amountB: "",
    balanceA: "",
    balanceB: "",
    lastChangedToken: 0,
    redeemPercent: 100,
})

// TOKENS ---------------
const { tokenA, tokenB, Tokens, bothTokensThere, setToken, selectTokenIndex } = useTokens()
// TOKENS ---------------

// POOL -----------------
const { pool, poolRatio, addLiquidity } = usePools(stepStore.routerAddress, Tokens, connectedAccount, chainId)
// POOL -----------------

// WIDGET ---------------
const bothAmountsIn = computed(() => {
    return Amounts.value.every((el) => el !== "")
})
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
function callAddLiquidity() {
    addLiquidity(
        ...Tokens.value,
        ...Amounts.value,
        settingsAdd.value.slippage,
        settingsAdd.value.deadline,
        stepStore.connectedAccount,
        stepStore.connectedWallet.provider
    ).then(() => {
        // state.amountA = ""
        // state.amountB = ""
    })
}
// WIDGET ---------------

// AMOUNTS --------------
const Amounts = computed({
    get() {
        // Round function trimms down unncessary digits and adds < mark when unsignificant
        function Round(amt) {
            let amount = Number(amt)
            if (amount === 0) {
                return ""
            }
            amount = amount >= 1 ? amount.toFixed(2) : amount.toPrecision(2)
            return Number(amount) < 0.00001 ? "<0.00001" : String(parseFloat(amount))
        }
        if (poolRatio.value && bothTokensThere.value) {
            // this if() cleans up other input when prior is set to 0
            if (
                (state.lastChangedToken === 0 && String(state.amountA).length === 0) ||
                (state.lastChangedToken === 1 && String(state.amountB).length === 0)
            ) {
                return ["", ""]
            }
            if (state.lastChangedToken === 0) {
                if (state.amountA.length !== 0) {
                    // state.amountB = Round(calcThis(state.amountA))
                    state.amountB = calcThis(state.amountA)
                }
            } else {
                if (state.amountB.length !== 0) {
                    // state.amountA = Round(calcThat(state.amountB))
                    state.amountA = calcThat(state.amountB)
                }
            }
        }

        return [state.amountA, state.amountB]
    },
    set(newValue) {
        state.amountA = newValue[0]
        state.amountB = newValue[1]
    },
})
function setTokenAmount(event, inputIndex) {
    state.lastChangedToken = inputIndex
    Amounts.value = Amounts.value.map((el, i) => (inputIndex === i ? event.target.value : el))
}

function calcThat(value) {
    value = Number(value)
    if (Number.isNaN(value)) {
        return ""
    }
    return value * poolRatio.value + ""
}
function calcThis(value) {
    value = Number(value)
    if (Number.isNaN(value)) {
        return ""
    }
    return value * (1 / poolRatio.value) + ""
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
// AMOUNTS --------------

// BALANCES -------------
const { getTokenBalance } = useBalances()

const ABBalance = computed({
    get() {
        return [state.balanceA, state.balanceB]
    },
    set(newVal) {
        state.balanceA = newVal[0]
        state.balanceB = newVal[1]
    },
})
// BALANCES -------------

//MODAL STUFF----------
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
//MODAL STUFF----------

//SETTINGS--------------
const settingsAdd = ref()
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

let intervalId = null
watch(
    Tokens,
    async (tokens) => {
        // adding query params to url
        if (featuredTokens.value && featuredTokens.value.length > 0) {
            const obj = {}
            tokens.map((el, index) => (el ? (obj["tk" + (index + 1)] = el.address) : false))
            router.replace({
                query: {
                    ...obj,
                },
            })
        }

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
            ABBalance.value = ["", ""]
        }
    },
    {
        immediate: true,
    }
)
</script>
