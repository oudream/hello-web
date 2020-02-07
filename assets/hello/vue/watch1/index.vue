<template>
    <section>
        <input ref="ed1" @input="onInput"/>
        <info ref="info1" :value="myValue" :size="123" resize="22" type="12" :type="new Date()" :count="11"></info>
        <button @click="bnClick">click</button>
    </section>
</template>

<script>
    /*

    step 1: init -> myValue -> info.value ;
    step 2: input into info -> emit(update:value) -> myValue -> info.value

     */

    import info from './info.vue';

    export default {
        components: {
            info,
        },

        data() {
            return {
                myValue: "1234",
            }
        },

        methods: {
            onInput(e) {
                this.myValue = e.target.value;
            },

            showMessage() {
                this.$refs.ed1.value = '';
                console.log('showMessage!');
            },

            bnClick() {
                this.myValue = 'abc';
                debugger
                this.$refs.info1.count = 12;
                // this.$refs.info1.upSize(12);
            },
        },

        mounted() {
            let _this = this;
            document.onkeydown = function(e) {
                if (e.ctrlKey) {
                    if (e.code === 'KeyE') {
                        _this.showMessage();
                    }
                }
            };
        },

    }
</script>
