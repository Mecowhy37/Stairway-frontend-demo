<template>
    <div class="settings">
        <div class="topbar row space-between">
            <h3>Settings</h3>
            <h3
                class="topbar__close"
                @click="toggleDropdown"
            >
                <mdicon name="close" />
            </h3>
        </div>
        <div
            class="setting"
            v-if="!noSlippage"
        >
            <p class="grey-text caption">slippage tolerance</p>
            <div class="row">
                <Btn
                    @click="resetSlippage"
                    opaque
                    small
                    >Auto</Btn
                >
                <input
                    class="grow"
                    type="number"
                    v-model="state.slippage"
                    step="0.1"
                    min="0"
                    max="100"
                />
                <p class="offset">%</p>
            </div>
            <p
                class="warn caption"
                :class="{ error: state.slippageError }"
            >
                {{ state.slippageWarn }}
            </p>
        </div>
        <div class="setting">
            <p class="grey-text caption">transaction deadline</p>
            <div class="row">
                <input
                    v-model="state.deadline"
                    step="1"
                    type="number"
                    :class="{ error: state.deadlineError }"
                />
                <p class="offset">minutes</p>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    defaultSlippage: Number,
    defaultDeadline: Number,
    noSlippage: Boolean,
    toggleDropdown: Function,
})

const state = reactive({
    slippage: props.defaultSlippage,
    deadline: props.defaultDeadline,
    slippageWarn: null,
    slippageError: true,
    invalidSLippage: false,
    deadlineError: false,
    invalidDeadline: false,
    lastValidDealine: null,
})

function resetSlippage() {
    state.slippage = props.defaultSlippage
}
function validateSlippage(val, closing = false) {
    if (val === "") {
        state.slippageError = false
        state.slippageWarn = null
        state.invalidSLippage = true
        if (closing) {
            state.slippageError = true
            state.slippageWarn = "Missing slippage"
            return false
        }
        return
    }
    if (val < 0.05) {
        state.slippageError = false
        state.slippageWarn = "Your transaction may fail"
        state.invalidSLippage = false
        return
    }
    if (val > 50) {
        state.slippageError = true
        state.slippageWarn = "Enter a valid slippage percentage"
        state.invalidSLippage = true
        return
    }
    state.slippageError = false
    state.slippageWarn = null
    state.invalidSLippage = false
}
function validateDeadline(val, closing = false) {
    if (val === "") {
        state.deadlineError = false
        state.invalidDeadline = true
        if (closing) {
            state.deadline = props.defaultDeadline
        }
        return false
    }
    if (val < 1 || val > 4320) {
        state.deadlineError = true
        state.invalidDeadline = true
        if (closing) {
            if (val === 0) {
                state.deadline = props.defaultDeadline
            }
            state.deadline = state.lastValidDealine
        }
        return false
    }
    state.invalidDeadline = false
    state.deadlineError = false
    return true
}

const isValidSettings = computed(() => {
    if (props.noSlippage) {
        return !state.invalidDeadline
    } else {
        return !state.invalidDeadline && !state.invalidSLippage
    }
})
watch(
    () => state.slippage,
    (newVal) => {
        validateSlippage(newVal)
    }
)
watch(
    () => state.deadline,
    (newVal) => {
        const isValid = validateDeadline(newVal)
        if (isValid) {
            state.lastValidDealine = newVal
        }
    }
)
defineExpose({
    slippage: toRefs(state).slippage,
    deadline: toRefs(state).deadline,
    isValidSettings,
    validateSlippage,
    validateDeadline,
    noSlippage: props.noSlippage,
})
</script>

<style lang="scss" scoped>
.settings {
    .topbar {
        padding: 12px;
        border-bottom: 1px solid var(--text-color-reverse);
        &__close {
            cursor: pointer;
        }
    }

    .setting {
        padding: 12px;
        padding-top: 7px;
        border-bottom: 1px solid var(--primary-disabled-bg);
        &:last-of-type {
            border-bottom: none;
        }
        p {
            &.warn {
                color: orange;
            }
            &.error {
                color: red;
            }
            &.offset {
                padding-top: 3px;
            }
        }
        .row {
            margin: 4px 0;
            gap: 12px;
            & > :first-child {
                /* margin-right: 12px; */
            }
            input {
                width: 30%;
                border-radius: var(--small-wdg-radius);
                border: 1px solid transparent;
                outline: none;
                padding: 5px;
                color: var(--text-color-reverse);
                background-color: var(--swap-windows);
                &.grow {
                    flex-grow: 1;
                }
                &.error {
                    color: red;
                    border: 1px solid red;
                }
            }
        }
    }
}
</style>
