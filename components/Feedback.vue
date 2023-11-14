<template>
    <div class="feedback modal modal--lower">
        <NuxtLink
            target="_blank"
            class="feedback__button"
            to="https://discord.gg/fGfFDM3GUj"
        >
            <Btn
                grey
                reverse
            >
                Provide feedback
                <template #icon>
                    <Icon
                        name="discord"
                        :size="24"
                    />
                </template>
            </Btn>
        </NuxtLink>
    </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.feedback {
    pointer-events: none;
    padding: 15px;
    &__button {
        pointer-events: all;
        place-self: end start;
    }
}
</style>
