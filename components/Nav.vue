<template>
    <header class="navbar">
        <p class="navbar__logo">StepSwap</p>
        <nav class="navigation">
            <NuxtLink to="/" class="navigation__link">swap</NuxtLink>
            <NuxtLink to="/pool" class="navigation__link">pool</NuxtLink>
            <NuxtLink to="/vote" class="navigation__link">vote</NuxtLink>
            <NuxtLink to="/charts" class="navigation__link">charts</NuxtLink>
            <!-- <h2 @click="update">{{ stepStore.walletAdress }}</h2> -->
            <!-- <div class="navigation__underline"></div> -->
        </nav>
        <div class="nav-actions">
            <Btn secondary thin compact @click="revertTheme">. . .</Btn>
            <Btn secondary thin compact @click="stepStore.tryWallet()">network</Btn>
            <Btn secondary thin compact>
                <span @click="stepStore.connectWalletAction()">
                    {{ stepStore.getTruncatedWalletAddress || "connect" }}
                </span>
            </Btn>
        </div>
    </header>
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
    position: absolute;
    display: flex;
    align-items: center;
    width: 100%;
    padding: 1.6rem 2.1rem;
    font-size: 2.2rem;

    .navigation {
        display: flex;
        position: relative;
        margin-left: 8%;

        &__link {
            position: relative;
            padding: 0.5rem 1.6rem;
            text-decoration: none;
            box-sizing: content-box !important;

            &::before {
                content: "";
                position: absolute;
                opacity: 0;
                bottom: 0;
                left: 50%;
                height: 2px;
                border-radius: 1px;
                width: calc(100% - 3.2rem);
                background-color: var(--main-color);
                transition: background-color var(--transition);
                transform: translateX(-50%);
                transition: opacity ease-in-out 0.1s;
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

        &__btn {
            padding: 0.8rem 1.9rem;
            background-color: var(--nav-actions-bg);
            transition: background-color var(--transition);
            border-radius: 8px;
            border: 1px solid var(--swap-main-btn-bg);
        }
    }
}
</style>
