<template>
    <div class="feedback modal modal--lower">
        <NuxtLink
            target="_blank"
            class="feedback__button"
            to="https://discord.com/channels/1022397568837234718/1022397569499930653"
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
