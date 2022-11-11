<template>
    <div class="centerize">
        <Widget />
    </div>
</template>

<script>
export default {
    head() {
        return {
            title: "Homepage",
            meta: [
                {
                    name: "description",
                    content: "This is a homepage!",
                    hid: "description",
                },
            ],
        }
    },
    data() {
        return {
            were: "here",
        }
    },
}
</script>

<style lang="scss"></style>
