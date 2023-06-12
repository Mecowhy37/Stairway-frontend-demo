<template>
    <header class="navbar">
        <h4 class="navbar__logo">Stairway</h4>
        <nav class="navigation">
            <NuxtLink
                to="/"
                class="navigation__link"
                ><h4>swap</h4></NuxtLink
            >
            <NuxtLink
                to="/pool"
                class="navigation__link"
                ><h4>pool</h4></NuxtLink
            >
            <!-- <NuxtLink
                to="/pools"
                class="navigation__link"
                ><h4>pools</h4></NuxtLink
            > -->
            <NuxtLink
                to="/buttons"
                class="navigation__link"
                ><h4>buttons</h4></NuxtLink
            >

            <!-- <h2 @click="update">{{ stepStore.walletAdress }}</h2> -->
            <!-- <div class="navigation__underline"></div> -->
        </nav>
        <div class="nav-actions">
            <!-- <Btn
                plain
                @click="revertTheme"
                >. . .</Btn
            > -->
            <!-- <Dropdown>
                <template #dropdown-activator="{ on }">
                    <Btn plain>
                        Ethereum
                        <template #icon>
                            <p>
                                <mdicon :name="on ? 'chevron-up' : 'chevron-down'" />
                            </p>
                        </template>
                    </Btn>
                </template>
                <template #dropdown>
                    <div class="networks-dd">
                        <p>1</p>
                        <p>3</p>
                    </div>
                </template>
            </Dropdown> -->
            <!-- <span
                v-if="!stepStore.connectedWallet"
                class="cta-dd"
                > -->
            <span
                @mouseover="showDisconnect"
                @mouseout="hideDisconnect"
            >
                <Btn
                    v-if="!stepStore.connectedWallet"
                    ref="ctaDropDown"
                    @click="stepStore.connectWallet()"
                    >connect</Btn
                >
                <!-- <div class="divider"></div> -->
                <!-- <Dropdown>
                    <template #dropdown-activator="{ on }">
                        <Btn transparent>
                            <template #icon>
                                <p>
                                    <mdicon :name="on ? 'chevron-up' : 'chevron-down'" />
                                </p>
                            </template>
                        </Btn>
                    </template>
                    <template #dropdown>
                        <Btn
                            secondary
                            thin
                        >
                            <span>some actions</span>
                        </Btn>
                    </template>
                </Dropdown> -->
                <!-- </span> -->
                <!-- <Dropdown v-else> -->
                <!-- <template #dropdown-activator="{ on }"> -->
                <Btn
                    v-else
                    plain
                    @click="stepStore.disconnectConnectedWallet()"
                >
                    {{ !disconnectText ? stepStore.getTruncatedWalletAddress : "disconnect" }}
                </Btn>
            </span>

            <!-- </template> -->
            <!-- <template #dropdown> -->
            <!-- <Btn
                        wide
                        @click="stepStore.disconnectConnectedWallet()"
                    >
                        <span>disconnect</span>
                    </Btn> -->
            <!-- </template> -->
            <!-- </Dropdown> -->
        </div>
    </header>
</template>

<script setup>
import { useStepStore } from "@/stores/step"

const stepStore = useStepStore()

function revertTheme() {
    stepStore.isDark = !stepStore.isDark
}

const disconnectText = ref(false)
function showDisconnect() {
    disconnectText.value = true
}
function hideDisconnect() {
    disconnectText.value = false
}
</script>

<style lang="scss" scoped>
/* $nav-height: 75px; */
.navbar {
    position: absolute;
    display: flex;
    align-items: center;
    width: 100%;
    /* height: $nav-height; */
    padding: 1rem 1.6rem;
    .navigation {
        display: flex;
        align-items: center;
        position: relative;
        margin-left: 8%;

        &__link {
            color: var(--text-color);
            position: relative;
            padding: 0 0.8rem;
            text-decoration: none;
            box-sizing: content-box !important;
            display: flex;
            justify-content: center;
            align-items: center;
            &::before {
                content: "";
                position: absolute;
                opacity: 0;
                bottom: -17%;
                left: 50%;
                height: 2px;
                /* padding: 0 5%; */
                border-radius: 1px;
                width: calc(100% - 1.6rem);
                background-color: var(--text-color);
                transition: opacity ease-in-out 0.15s, background-color var(--transition);
                transform: translateX(-50%);
            }

            &:hover::before {
                opacity: 0.2;
            }

            &.router-link-exact-active::before {
                opacity: 1;
            }
        }
    }

    .nav-actions {
        display: flex;
        gap: 0.8rem;
        margin-left: auto;

        .cta-dd {
            display: flex;
            background-color: var(--cta-bg);
            border-radius: 9999px;
            .divider {
                align-self: center;
                height: 70%;
                width: 1px;
                background-color: rgba(255, 255, 255, 0.7);
                /* margin-left: -0.5rem; */
                /* margin-right: -1.2rem; */
            }
        }
        .networks-dd {
            display: flex;
            flex-wrap: wrap;
            gap: 12%;
            justify-content: space-evenly;
        }
    }
}
</style>
