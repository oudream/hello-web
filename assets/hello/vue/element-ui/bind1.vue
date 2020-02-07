<template>
    <el-col>
        <el-button type="text" @click="click1">文字按钮{{text1}}</el-button>
        <el-select v-model="filter.value" placeholder="请选择">
            <el-option
                    v-for="item in filter.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.disabled">
            </el-option>
        </el-select>
    </el-col>
</template>

<script>
    export default {
        data() {
            return {
                filter: {
                    options: [{
                        value: '选项1',
                        label: '黄金糕'
                    }, {
                        value: '选项2',
                        label: '双皮奶',
                        disabled: false
                    }, {
                        value: '选项3',
                        label: '蚵仔煎'
                    }, {
                        value: '选项4',
                        label: '龙须面'
                    }, {
                        value: '选项5',
                        label: '北京烤鸭'
                    }],
                    value: ''
                },
                text1: 'bb'
            }
        },

        methods: {
            click1() {
                // let filter = this.filter;
                this.filter.options[0].label = 'work';
                // this.filter = filter;
            }
        }
    }

</script>
