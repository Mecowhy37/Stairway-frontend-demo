<template>
    <div class="settings">
        <h3>settings</h3>
        <div class="setting">
            <p>slippage tolerance (%)</p>
            <div class="row">
                <Btn @click="resetSlippage">Auto</Btn>
                <input
                    class="grow"
                    type="number"
                    v-model="state.slippage"
                    step="0.1"
                    min="0"
                    max="100"
                    @input="validateSlippage($event.target.value)"
                />
            </div>
            <p
                class="warn"
                :class="{ error: state.slippageError }"
            >
                {{ state.slippageWarn }}
            </p>
        </div>
        <div class="setting">
            <p>transaction deadline</p>
            <div class="row">
                <input
                    v-model="state.deadline"
                    step="1"
                    type="number"
                    @input="validateDeadline($event.target.value)"
                />
                <p :class="{ error: state.deadlineError }">minutes</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { provide } from "vue"

const props = defineProps({
    defaultSlippage: Number,
    defaultDeadline: Number,
})

const state = reactive({
    slippage: props.defaultSlippage,
    deadline: props.defaultDeadline,
    slippageWarn: null,
    slippageError: true,
    deadlineError: false,
})

function resetSlippage() {
    state.slippage = props.defaultSlippage
}
function validateSlippage(val) {
    if (val === "") {
        state.slippageError = false
        state.slippageWarn = null
        return
    }
    if (val < 0.05) {
        state.slippageError = false
        state.slippageWarn = "Your transaction may fail"
        return
    }
    if (val > 50) {
        state.slippageError = true
        state.slippageWarn = "Enter a valid slippage percentage"
        return
    }
    state.slippageError = false
    state.slippageWarn = null
}
function validateDeadline(val) {
    if (val === "") {
        state.deadlineError = false
        return
    }
    if (val < 1 || val > 4320) {
        state.deadlineError = true
        return
    }
    state.deadlineError = false
}
defineExpose({
    slippage: toRefs(state).slippage,
    deadline: toRefs(state).deadline,
})
</script>

<style lang="scss" scoped>
.settings {
    .row {
        margin-top: 0.5rem;
        input {
            width: 30%;
            &.grow {
                flex-grow: 1;
            }
            margin-left: 0.5rem;
        }
    }
    .setting {
        margin-top: 0.5rem;
        p {
            &.warn {
                color: orange;
            }
            &.error {
                color: red;
            }
        }
    }
}
</style>
