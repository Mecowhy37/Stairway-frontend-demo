<template>
    <nav class="navbar">
        <div class="navbar__wrapper row space-between">
            <img
                class="navbar__logo"
                src="/logox2.png"
            />
            <div class="navbar__navigation">
                <NuxtLink
                    to="/"
                    class="link link--underlined"
                    ><p>Swap</p></NuxtLink
                >
                <NuxtLink
                    to="/pools"
                    class="link link--underlined"
                    ><p>Add liquidity</p></NuxtLink
                >
                <Btn
                    v-if="!stepStore.connectedWallet"
                    plain
                    active
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
                    :width="180"
                >
                    <template #dropdown-activator="{ on }">
                        <Btn
                            plain
                            active
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
                        <Btn
                            wide
                            medium
                            opaque
                            active
                            @click="stepStore.disconnectConnectedWallet()"
                        >
                            Disconnect
                        </Btn>
                    </template>
                </Dropdown>
                <Dropdown
                    no-padding
                    :width="140"
                >
                    <template #dropdown-activator="{ on }">
                        <Btn
                            circle
                            transparent
                            class="burger"
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
                            ><p>Add liquidity</p></NuxtLink
                        >
                    </template>
                </Dropdown>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { useStepStore } from "@/stores/step"

const stepStore = useStepStore()

function revertTheme() {
    stepStore.isDark = !stepStore.isDark
}
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
        margin-top: auto;
        padding: 0 70px;
        width: 100%;
    }
    &__logo {
        display: block;
        height: var(--logo-height);
    }
    &__navigation {
        display: flex;
        align-items: center;
        gap: 30px;

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
        }
        .burger {
            margin: 0 -10px;
            &:hover {
                background-color: rgba(0, 0, 0, 0.04);
            }
            .icon {
                margin: 10px !important;
            }
        }
    }

    .nav-actions {
        display: flex;
        gap: 0.8rem;
        margin-left: auto;
        .networks-dd {
            display: flex;
            flex-wrap: wrap;
            gap: 12%;
            justify-content: space-evenly;
        }
    }
}
</style>
