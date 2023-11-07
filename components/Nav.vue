<template>
    <nav class="navbar">
        <div class="navbar__wrapper row space-between align-center">
            <div class="row align-center">
                <Dropdown
                    no-padding
                    to-right
                    burger
                    :width="140"
                    class="navbar__burger"
                >
                    <template #dropdown-activator="{ on }">
                        <Btn
                            circle
                            transparent
                        >
                            <template #icon>
                                <Icon
                                    name="burger"
                                    :size="16"
                                />
                            </template>
                        </Btn>
                    </template>
                    <template #dropdown="{ toggleDropdown }">
                        <NuxtLink
                            to="/swap"
                            @click="toggleDropdown()"
                            class="link list-item list-item--padded-sm"
                            ><p>Swap</p></NuxtLink
                        >
                        <NuxtLink
                            to="/liquidity"
                            @click="toggleDropdown()"
                            class="link list-item list-item--padded-sm"
                            ><p>Liquidity</p></NuxtLink
                        >
                        <NuxtLink
                            to=""
                            @click="toggleDropdown()"
                            class="link list-item list-item--padded-sm"
                            ><p>Governance</p></NuxtLink
                        >
                    </template>
                </Dropdown>
                <NuxtLink :to="landingPageUrl">
                    <img
                        class="navbar__logo"
                        src="/logox2.png"
                    />
                </NuxtLink>
            </div>
            <div class="navbar__navigation">
                <div class="desktop contents">
                    <NuxtLink
                        to="/swap"
                        class="link link--underlined"
                        ><p>Swap</p></NuxtLink
                    >
                    <NuxtLink
                        to="/liquidity"
                        class="link link--underlined"
                        ><p>Liquidity</p></NuxtLink
                    >
                    <NuxtLink
                        to="https://vote.stairway.fi/"
                        class="link link--underlined"
                        ><p>Governance</p></NuxtLink
                    >
                </div>
                <Btn
                    v-if="!stepStore.connectedWallet"
                    plain
                    :compact="isMobile"
                    @click="stepStore.connectWallet()"
                >
                    Connect
                    <template #icon>
                        <Icon
                            name="chevron"
                            :size="16"
                        />
                    </template>
                </Btn>

                <Dropdown
                    v-else
                    :width="isMobile ? 180 : 210"
                >
                    <template #dropdown-activator="{ on }">
                        <Btn
                            plain
                            active
                            :compact="isMobile"
                        >
                            <div class="row">
                                <AccountIcon :account="stepStore.connectedAccount" />

                                {{ getTruncatedWalletAddress }}
                            </div>
                            <template #icon>
                                <Icon
                                    name="chevron"
                                    :size="16"
                                    :rotate="on ? 180 : 0"
                                />
                            </template>
                        </Btn>
                    </template>
                    <template #dropdown>
                        <p
                            @click="copyAddress()"
                            class="list-item list-item--padded-xs list-item--all-rounded list-item--separate"
                        >
                            Copy address
                        </p>
                        <p
                            @click="viewInExplorer()"
                            class="list-item list-item--padded-xs list-item--all-rounded list-item--separate"
                        >
                            View in explorer
                        </p>
                        <Btn
                            wide
                            opaque
                            active
                            :compact="isMobile"
                            @click="stepStore.disconnectConnectedWallet()"
                        >
                            Disconnect
                        </Btn>
                    </template>
                </Dropdown>
                <Dropdown
                    class="chain-dropdown"
                    :width="270"
                    no-padding
                >
                    <template #dropdown-activator="{ on }">
                        <Btn
                            transparent
                            circle
                        >
                            <template #icon>
                                <img
                                    v-if="isSupportedChain(connectedChainId)"
                                    class="token-icon"
                                    :src="connectedChainFullObj.logo_url"
                                />
                                <Icon
                                    v-else
                                    name="warning"
                                    style="color: var(--error-color); margin: 0; padding: -1px"
                                    :size="36"
                                />
                            </template>
                        </Btn>
                    </template>
                    <template #dropdown>
                        <div
                            v-for="chain in chains"
                            class="list-item list-item--padded-xs row align-center"
                            @click="setTheChain(chain.chain_id)"
                        >
                            <img
                                class="token-icon token-icon--sm"
                                :src="chain.logo_url"
                            />
                            <p>{{ chain.chain_name }}</p>
                            <Icon
                                v-if="chain.chain_id === connectedChainId"
                                class="tick-icon"
                                name="tick"
                                :size="9"
                            ></Icon>
                        </div>
                    </template>
                </Dropdown>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { useStepStore } from "@/stores/step"
import { storeToRefs } from "pinia"
import { isSupportedChain } from "~/helpers/index"

const stepStore = useStepStore()
const { setTheChain } = stepStore

const {
    connectedAccount,
    getTruncatedWalletAddress,
    landingPageUrl,
    isMobile,
    chains,
    connectedChain,
    noWalletChain,
    connectedChainId,
} = storeToRefs(stepStore)

// function revertTheme() {
//     stepStore.isDark = !stepStore.isDark
// }

function copyAddress() {
    navigator.clipboard.writeText(stepStore.connectedAccount)
}
function viewInExplorer() {
    navigateTo(`https://mumbai.polygonscan.com/address/${stepStore.connectedAccount}`, {
        external: true,
        open: {
            target: "_blank",
        },
    })
}

const connectedChainFullObj = computed(() => {
    if (chains.value) {
        if (connectedChain.value) {
            return chains.value.find((el) => el.chain_id === connectedChainId.value)
        } else {
            return chains.value.find((el) => el.chain_id === noWalletChain.value)
        }
    }
})
</script>

<style lang="scss" scoped>
.navbar {
    position: sticky;
    top: 0;
    left: 0;
    height: var(--nav-height);
    width: 100%;
    display: flex;
    white-space: nowrap;
    z-index: 5;
    /* margin-bottom: calc(var(--nav-height) - var(--logo-height)); */

    &__wrapper {
        width: 100%;
        margin: auto 0;
        padding: 0 70px;
    }
    &__logo {
        height: var(--logo-height);
    }
    &__burger {
        display: none;
        margin-right: 10px;
        .btn {
            &:hover {
                background-color: rgba(0, 0, 0, 0.04);
            }
            .icon {
                margin: 10px !important;
            }
        }
    }
    &__navigation {
        display: flex;
        align-items: center;
        gap: 30px;
    }

    .link {
        color: var(--text-color-reverse);
        position: relative;
        text-decoration: none;
        box-sizing: content-box !important;
        display: flex;
        align-items: center;
        &--underlined {
            color: var(--text-color);
            /* &::before {
                    content: "";
                    position: absolute;
                    opacity: 0;
                    bottom: -30%;
                    left: 50%;
                    height: 2px;
                    border-radius: 1px;
                    width: 100%;
                    background-color: var(--text-color);
                    transition: opacity ease-in-out 0.15s, background-color var(--transition);
                    transform: translateX(-50%);
                } */

            &:hover::before {
                opacity: 0.2;
            }

            &.router-link-exact-active::before {
                opacity: 1;
            }
        }
        .chain-dropdown {
            .icon {
                color: var(--info-bg);
            }
            .dropdown__box {
                .list-item {
                    p {
                        margin-left: 5px;
                    }
                }
            }
        }
    }
    @media (max-width: 900px) {
        &__wrapper {
            padding: 0 30px;
        }
        &__burger {
            display: block;
        }
        .desktop {
            display: none;
        }
    }
    @media (max-width: 750px) {
        height: var(--nav-md-height);
        &__logo {
            height: var(--logo-md-height);
        }
    }
    @media (max-width: 600px) {
        height: var(--nav-sm-height);
        &__wrapper {
            padding: 0 20px;
        }
        &__logo {
            height: var(--logo-sm-height);
        }
        &__navigation {
            gap: 20px;
        }
    }
    @media (max-width: 400px) {
        &__wrapper {
            padding: 0 5px;
        }
        &__burger {
            margin-right: 5px;
        }
        &__navigation {
            gap: 10px;
        }
    }
}
</style>
