<template>
    <div class="dropdown-wrapper">
        <div class="activators">
            <button class="btn btn--secondary thin">
                <div @click="toggleDropdown()" ref="openner" class="dd-activator">
                    <slot name="dd-activator">
                        <h3>{{ isDropdownActive ? "close" : "open" }}</h3>
                    </slot>
                </div>
                <slot name="option-activator">
                    <h3 v-if="stepStore.connectedWallet === null" @click="stepStore.connectWallet()">connect</h3>
                    <h3 v-else @click="toggleDropdown">{{ stepStore.getTruncatedWalletAddress }}</h3>
                </slot>
            </button>
        </div>
        <div v-show="isDropdownActive" class="dropdown" ref="toActivate">
            <Btn compact wide @click="stepStore.disconnectConnectedWallet()">
                <span>disconnect</span>
            </Btn>
        </div>
    </div>
</template>

<script setup>
import { useStepStore } from "@/stores/step"
import { useSlots } from "vue"
import { onClickOutside } from "@vueuse/core"

const stepStore = useStepStore()
const slots = useSlots()

const toActivate = ref(null)
const openner = ref(null)
const isDropdownActive = ref(false)
function toggleDropdown() {
    isDropdownActive.value = !isDropdownActive.value
}
onClickOutside(toActivate, (event) => {
    if (isDropdownActive.value === true) {
        toggleDropdown()
        if (openner.value === event.target) {
            event.stopPropagation()
        }
    }
})
</script>

<style scoped lang="scss">
.dropdown-wrapper {
    position: relative;
    .activators {
        button {
            display: flex;
            flex-direction: row-reverse;
            gap: 1rem;
        }
        .dd-activator {
            height: 100%;
            h3 {
                pointer-events: none;
            }
        }
    }
    .dropdown {
        position: absolute;
        right: 0%;
        margin-top: 1.6rem;
        width: 250px;
        padding: 1rem;
        background-color: transparent;
        border-radius: 8px;
        border: 1px solid var(--swap-main-btn-bg);
    }
}
</style>
