<template>
    <div class="centerize">
        <Btn>Button</Btn>
        <Btn transparent>transparent</Btn>
        <Btn plain>plain</Btn>
        <Btn opaque>opaque</Btn>
        <Btn
            opaque
            class="selected"
            >opaque</Btn
        >
        <Btn circle>circle</Btn>
        <Btn disabled>disabled</Btn>
    </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.centerize {
    & > .btn {
        margin-bottom: 12px;
    }
    .row {
        background-color: var(--widget-bg);
        padding: 1rem;
        gap: 0.5rem;
    }
}
</style>
