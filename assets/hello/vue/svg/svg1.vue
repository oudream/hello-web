<template>
    <section>
        <table id="svg1">
            <tr>
                <td style="width: 450px">
                    <table>
                        <tr>
                            <td class="td-rtdata" colspan="2">
                                <div id="div__m__1">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="td-rtdata" colspan="2">
                                <div id="div__m__2">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="td-rtdata">
                                <div id="div__m__31">
                                </div>
                            </td>
                            <td class="td-rtdata">
                                <div id="div__m__32">
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="td-rtdata">
                                <div id="div__m__41">
                                </div>
                            </td>
                            <td class="td-rtdata">
                                <div id="div__m__42">
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
                <td style="width: 650px">
                    <div id="show-rt-curve-33554449" style="min-width: 310px; height: 300px; margin: 0 auto"></div>
                    <br>
                    <div id="show-rt-curve-33554450" style="min-width: 310px; height: 300px; margin: 0 auto"></div>
                </td>
            </tr>
        </table>
    </section>
</template>

<script>

    // jquery
    // d3
    // highcharts-7/code/highcharts.js
    // highcharts-7/code/modules/exporting.js

    // gcl_rtlog.js
    // gcl_gis_rtlog

    // import echarts from 'echarts'

    import $ from 'jquery'
    import * as d3 from 'd3'
    import Highcharts from 'highcharts'

    export default {
        methods: {
            loadSvg (id, filename) {
                fetch('/static/svg/' + filename).then(data => data.text()).then(data => {
                    let ele = window.document.querySelector(id);
                    if (ele) {
                        window.document.querySelector(id).innerHTML = data;
                    }
                    this.startUi();
                }).then()
            },

            startUi () {
                this.resIndex++;
                if (this.resIndex === this.resCount) {
                    this.svgContianer = window.document.querySelector('#svg1');
                    gcl.gis.ind.startView(this.svgContianer);
                    gcl.gis.comp.startView(this.svgContianer);
                    gcl.gis.ind.printInds();
                    gcl.rtdb.printAll();
                }
            },

            stopUi () {
                gcl.gis.ind.stopView(this.svgContianer);
                gcl.gis.comp.stopView(this.svgContianer);
                gcl.gis.ind.printInds();
                gcl.rtdb.printAll();
            },

        },

        computed: {

        },

        created() {
            window.$ = $;
            window.d3 = d3;
            window.Highcharts = Highcharts;

            this.resCount = 6;
            this.resIndex = 0;

            this.loadSvg('#div__m__1' , '0x01000001.svg');
            this.loadSvg('#div__m__2' , '0x01000011.svg');
            this.loadSvg('#div__m__31', '0x02000001.svg');
            this.loadSvg('#div__m__32', '0x02000002.svg');
            this.loadSvg('#div__m__41', '0x02000003.svg');
            this.loadSvg('#div__m__42', '0x02000004.svg');
        },

        mounted() {

        },

        beforeDestroy() {
            this.stopUi();
        },
    }


    // $(document).ready(function () {
    // });


</script>

<style>
</style>
