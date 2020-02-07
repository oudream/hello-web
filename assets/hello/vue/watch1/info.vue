<template>
    <div>
        <input :value="value"/>
    </div>
</template>

<script>
    export default {
        props: {
            value: {
                type: String
            },
            size: Number,
            resize: String,
            disabled: Boolean,
            counttype: {
                type: Date,
            },

        },
        data(){
          return {
              count: 0,
          }
        },
        methods: {
            upSize(nv) {
                this.count = nv;
            }
        },
        watch: {
            value(nv, ov) {
                console.log('watch1 info - value changed: ', this.value, 'nv:', nv, 'ov:', ov);
                debugger;
                console.log(typeof this.value,     this.value);
                console.log(typeof this.size,      this.size);
                console.log(typeof this.resize,    this.resize);
                console.log(typeof this.disabled,  this.disabled);
                console.log(typeof this.type,  this.type);
                console.log(typeof this.count,  this.count);
            }
        }
    }
</script>
