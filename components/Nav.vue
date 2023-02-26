<template>
    <header class="navbar">
        <h3 class="navbar__logo">StepSwap</h3>
        <nav class="navigation">
            <NuxtLink to="/" class="navigation__link"><h3>swap</h3></NuxtLink>
            <NuxtLink to="/pool" class="navigation__link"><h3>pool</h3></NuxtLink>
            <NuxtLink to="/vote" class="navigation__link"><h3>vote</h3></NuxtLink>
            <NuxtLink to="/charts" class="navigation__link"><h3>charts</h3></NuxtLink>
            <!-- <h2 @click="update">{{ stepStore.walletAdress }}</h2> -->
            <!-- <div class="navigation__underline"></div> -->
        </nav>
        <div class="nav-actions">
            <Btn plain @click="revertTheme">. . .</Btn>
            <Btn plain @click="stepStore.tryWallet()">! ! !</Btn>
            <Dropdown>
                <template #dropdown-activator="{ on }">
                    <Btn plain>
                        Etheruem
                        <template #icon>
                            <h3>
                                <mdicon :name="on ? 'chevron-up' : 'chevron-down'" />
                            </h3>
                        </template>
                    </Btn>
                </template>
                <template #dropdown>
                    <span>networks</span>
                </template>
            </Dropdown>
            <span v-if="!stepStore.connectedWallet" class="cta-dropdown">
                <Btn transparent @click="stepStore.connectWallet()" ref="ctaDropDown">connect</Btn>
                <div class="divider"></div>
                <Dropdown>
                    <template #dropdown-activator="{ on }">
                        <Btn transparent class="reduce-p">
                            <template #icon>
                                <h3>
                                    <mdicon :name="on ? 'chevron-up' : 'chevron-down'" />
                                </h3>
                            </template>
                        </Btn>
                    </template>
                    <template #dropdown>
                        <Btn compact wide>
                            <span>some actions</span>
                        </Btn>
                    </template>
                </Dropdown>
            </span>
            <Dropdown v-else>
                <template #dropdown-activator="{ on }">
                    <Btn pill plain class="">
                        {{ stepStore.getTruncatedWalletAddress }}
                        <template #icon>
                            <h3>
                                <mdicon :name="on ? 'chevron-up' : 'chevron-down'" />
                            </h3>
                        </template>
                    </Btn>
                </template>
                <template #dropdown>
                    <Btn compact wide @click="stepStore.disconnectConnectedWallet()">
                        <span>disconnect</span>
                    </Btn>
                </template>
            </Dropdown>
        </div>
    </header>
</template>

<script setup>
import { useStepStore } from "@/stores/step"

const stepStore = useStepStore()

function revertTheme() {
    stepStore.isDark = !stepStore.isDark
}
const ctaDropDown = ref(null)
const ctaDropDownHeight = ref("")
onMounted(() => {
    ctaDropDownHeight.value = ctaDropDown.value.btnHeight
})
</script>

<style lang="scss" scoped>
$nav-height: 75px;
.navbar {
    position: absolute;
    display: flex;
    width: 100%;
    height: $nav-height;
    padding: 1.6rem 2.1rem;
    .navigation {
        display: flex;
        position: relative;
        margin-left: 8%;

        &__link {
            position: relative;
            padding: 0.5rem 1.2rem;
            text-decoration: none;
            box-sizing: content-box !important;

            &::before {
                content: "";
                position: absolute;
                opacity: 0;
                bottom: 15%;
                left: 50%;
                height: 2px;
                padding: 0 0.3rem;
                border-radius: 1px;
                width: calc(100% - 3.2rem);
                background-color: var(--main-color);
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
        gap: 1.6rem;
        margin-left: auto;

        .cta-dropdown {
            display: flex;
            background-color: hotpink;
            border-radius: calc($nav-height - 3.2rem);
            .divider {
                align-self: center;
                height: 70%;
                width: 1px;
                background-color: rgba(255, 255, 255, 0.7);
                margin-left: -0.5rem;
                margin-right: -1.2rem;
            }
            .reduce-p {
                padding-right: 1.2rem;
            }
        }
    }
}
</style>
