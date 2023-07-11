<template>
    <nav class="navbar">
        <h4 class="navbar__logo">Stairway</h4>
        <div class="navigation">
            <NuxtLink
                to="/"
                class="navigation__link"
                ><p>swap</p></NuxtLink
            >
            <NuxtLink
                to="/pools"
                class="navigation__link"
                ><p>pools</p></NuxtLink
            >
            <!-- <NuxtLink
                to="/buttons"
                class="navigation__link"
                ><p>buttons</p></NuxtLink
            > -->

            <!-- <h2 @click="update">{{ stepStore.walletAdress }}</h2> -->
            <!-- <div class="navigation__underline"></div> -->
        </div>
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
            <Btn
                v-if="!stepStore.connectedWallet"
                ref="ctaDropDown"
                plain
                active
                @click="stepStore.connectWallet()"
                >Connect</Btn
            >
            <!-- <div class="divider"></div> -->
            <Dropdown v-else>
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
                            />
                        </template>
                    </Btn>
                </template>
                <template #dropdown>
                    <Btn
                        wide
                        opaque
                        active
                        @click="stepStore.disconnectConnectedWallet()"
                        >Disconnect</Btn
                    >
                </template>
            </Dropdown>
            <!-- </span> -->
            <!-- <Dropdown v-else> -->
            <!-- <template #dropdown-activator="{ on }"> -->
            <!-- <Btn
                    plain
                    @click="stepStore.disconnectConnectedWallet()"
                >
                    {{ !disconnectText ? stepStore.getTruncatedWalletAddress : "disconnect" }}
                </Btn> -->

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
    position: fixed;
    top: 0px;
    height: var(--nav-height);
    width: 100%;
    display: flex;
    align-items: center;
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
                bottom: -10%;
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
        .networks-dd {
            display: flex;
            flex-wrap: wrap;
            gap: 12%;
            justify-content: space-evenly;
        }
    }
}
</style>
