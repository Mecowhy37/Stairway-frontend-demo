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
                    <template #dropdown>
                        <NuxtLink
                            to="/"
                            class="link list-item list-item--padded-sm"
                            ><p>Swap</p></NuxtLink
                        >
                        <NuxtLink
                            to="/pools"
                            class="link list-item list-item--padded-sm"
                            ><p>Liquidity</p></NuxtLink
                        >
                    </template>
                </Dropdown>
                <img
                    class="navbar__logo"
                    src="/logox2.png"
                />
            </div>
            <div class="navbar__navigation">
                <div class="desktop contents">
                    <NuxtLink
                        to="/"
                        class="link link--underlined"
                        ><p>Swap</p></NuxtLink
                    >
                    <NuxtLink
                        to="/pools"
                        class="link link--underlined"
                        ><p>Liquidity</p></NuxtLink
                    >
                </div>
                <Btn
                    v-if="!stepStore.connectedWallet"
                    plain
                    active
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
                            {{ stepStore.getTruncatedWalletAddress }}
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
                        <p class="list-item list-item--padded-xs list-item--all-rounded list-item--separate">Copy</p>
                        <p class="list-item list-item--padded-xs list-item--all-rounded list-item--separate">
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
                                    class="token-icon"
                                    :src="
                                        connectedChainFullObj
                                            ? connectedChainFullObj.logo_url
                                            : '/_nuxt/assets/img/polygon_mainnet.webp'
                                    "
                                />
                            </template>
                        </Btn>
                    </template>
                    <template #dropdown>
                        <div
                            v-for="chain in chains"
                            class="list-item list-item--padded-xs row align-center"
                            @click="setChain(chain.chain_id)"
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

const stepStore = useStepStore()
const { isMobile, chains, connectedChain, connectedChainId } = storeToRefs(stepStore)

function revertTheme() {
    stepStore.isDark = !stepStore.isDark
}

function setChain(id) {
    stepStore.setChain({ chainId: id })
}

const connectedChainFullObj = computed(() => {
    if (chains.value && connectedChain.value) {
        return chains.value.find((el) => el.chain_id === connectedChainId.value)
    }
})
</script>

<style lang="scss" scoped>
.navbar {
    position: sticky;
    top: 0px;
    height: var(--nav-height);
    width: 100%;
    display: flex;
    white-space: nowrap;
    z-index: 5;

    &__wrapper {
        height: var(--logo-height);
        width: 100%;
        margin-top: auto;
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
