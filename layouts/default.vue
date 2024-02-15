<template>
    <div class="contents">
        <div class="background">
            <Transition>
                <div class="background__image show"></div>
                <!-- :class="{ show: interfaceReady }" -->
            </Transition>
        </div>

        <!-- <Suspense
            timeout="0"
            @resolve="handleResolve"
            > -->
        <Interface>
            <slot />
        </Interface>
        <!-- <template #fallback>
                <div class="loading">
                    <p>Loading interface . . .</p>
                </div>
            </template>
        </Suspense> -->
    </div>
</template>

<script setup>
useSeoMeta({
    title: "Stairway.fi",
    description:
        "Decentralized AMM for crypto trading. Introducing fixed price intervals, liquidity provision and decision-making in a new way",
})

const interfaceReady = ref(false)
function handleResolve() {
    interfaceReady.value = true
}
</script>

<style lang="scss" module="themes" src="assets/main.scss"></style>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,500&display=swap");
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: "DM Sans";
    line-height: 100%;
    font-weight: 500;
}
html {
    /* font-size: calc([minimum size] + ([maximum size] - [minimum size]) * ((100vw - [minimum viewport width]) / ([maximum viewport width] - [minimum viewport width]))); */
    color: var(--text-color);
    $size: 16px;
    /* font-size: calc($size * ((100vw - 300px) / (1600 - 300))); */
    font-size: $size;
    user-select: none;
}
.background {
    position: fixed;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: -2;
    background-color: var(--background-color);
    &__image {
        width: 100%;
        height: 100%;
        opacity: 0;
        background-image: url("~/assets/img/stairway-background.jpeg");
        background-size: cover;
        background-repeat: no-repeat;
        &.show {
            opacity: 1;
        }
    }
}
.loading {
    width: 100%;
    height: 100vh;
    display: grid;
    & > * {
        place-self: center;
    }
}
</style>
