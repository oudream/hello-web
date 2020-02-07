<template>
    <div>
        <input @input="onInput"/>
        <input :value="value"/>
    </div>
</template>

<script>
    export default {
        props: {
            value: {
                type: String
            }
        },
        methods: {
            onInput(e) {
                this.$emit("update:value", e.target.value)
            }
        }
    }
</script>
