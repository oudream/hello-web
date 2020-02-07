<template>
    <info :value.sync="myValue"></info>
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
        watch:{
            myValue: function(ov, nv) {
                console.log('myValue changed : ', ov, nv);
            }
        }
    }
</script>
