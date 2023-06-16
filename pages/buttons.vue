<template>
    <div class="centerize">
        <div class="row">
            <div>
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
            <div>
                <Icon name="arrow"></Icon>
                <Icon name="chevron"></Icon>
                <Icon name="cog"></Icon>
                <Icon name="cross"></Icon>
                <Icon name="plus"></Icon>
                <Icon name="wallet"></Icon>
            </div>
        </div>
    </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.centerize {
    .btn {
        margin-bottom: 12px;
    }
    .row {
        padding: 1rem;
        gap: 0.5rem;
    }
}
</style>
