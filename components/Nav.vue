<template>
    <header class="navbar">
        <p class="navbar__logo">StepSwap</p>
        <nav class="navigation">
            <NuxtLink to="/" class="navigation__link"> Swap </NuxtLink>
            <NuxtLink to="/pool" class="navigation__link"> Pool </NuxtLink>
            <NuxtLink to="/vote" class="navigation__link"> Vote </NuxtLink>
            <NuxtLink to="/charts" class="navigation__link"> Charts </NuxtLink>
            <!-- <h2 @click="update">{{ stepStore.walletAdress }}</h2> -->
            <!-- <div class="navigation__underline"></div> -->
        </nav>
        <div class="nav-actions">
            <div class="nav-actions__btn inset">TestNet</div>
            <div class="nav-actions__btn inset">Connect wallet</div>
            <div class="nav-actions__btn inset" @click="() => (stepStore.isDark = !stepStore.isDark)">. . .</div>
        </div>
    </header>
</template>

<script>
import { useStepStore } from "~/stores/step"
import { mapStores } from "pinia"
export default {
    computed: {
        ...mapStores(useStepStore),
    },
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
                height: 4px;
                width: calc(100% - 3.2rem);
                background-color: var(--main-color);
                transition: background-color var(--transition);
                border-radius: 2px;
                transform: translate(-50%, 100%);
                transition: opacity ease-in-out 0.1s;
            }

            &:hover::before {
                opacity: 0.2;
            }

            &.router-link-exact-active::before {
                opacity: 1;
            }
        }

        &__underline {
            position: absolute;
            height: 4px;
            border-radius: 2px;
            width: 57px;
            background-color: var(--main-color);
            transition: background-color var(--transition);
            bottom: 0%;
            margin-left: 0.8rem;
            transform: translateY(100%);
        }
    }

    .nav-actions {
        display: flex;
        gap: 1.6rem;
        margin-left: auto;

        &__btn {
            padding: 1.2rem 1.9rem;
            background-color: var(--nav-actions-bg);
            transition: background-color var(--transition);
            border-radius: 8px;

            &:first-of-type {
                padding-right: 5rem;
            }

            &:last-of-type {
                vertical-align: center;
            }
        }
    }
}
</style>
