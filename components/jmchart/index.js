// components/jmchart/index.js\
import jmChart from "jmchart/dist/jmchart.esm";
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        height: {
            type: Number,
            value: 100
        },
        width: {
            type: Number,
            value: 100
        },
        options: {
            type: Object,
            value: {}
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        chart: null
    },
    created() {
        //this.initChart();    
    },
    detached() {
        this.data.graph && this.data.graph.destroy();
    },
    /**
     * 组件的方法列表
     */
    methods: {
        initChart: async function() {
            if(this.data.chart) return this.data.chart;
            if(this.data.jmgraphPromise) return this.data.jmgraphPromise;
            return this.data.jmgraphPromise = new Promise((resolve) => {
                const query = wx.createSelectorQuery().in(this);
                wx.nextTick(()=>{
                    query.selectAll('#jmchart_canvas,#jmchart_touch_canvas')
                    .fields({ node: true, size: true })
                    .exec((res) => {
                        const canvas = res[0][0].node;
                        const touchCanvas = res[0] && res[0][1]? res[0][1].node : null;
                        const chart = this.data.chart || (this.data.chart = new jmChart(canvas, {
                            width: res[0][0].width,
                            height: res[0][0].height,
                            autoRefresh: true,
                            touchCanvas,
                            ...this.data.options
                        }));  
                        console.log(chart);
                        resolve(chart);
                    });
                });                
            });            
          },
          canvastouchstart(...args) {
            return (this.data.chart.touchGraph||this.data.chart).eventHandler.touchStart(...args);
          },
          canvastouchmove(...args) {
            return (this.data.chart.touchGraph||this.data.chart).eventHandler.touchMove(...args);
          },
          canvastouchend(...args) {
            return (this.data.chart.touchGraph||this.data.chart).eventHandler.touchEnd(...args);
          },
          canvastouchcancel(...args) {
            return (this.data.chart.touchGraph||this.data.chart).eventHandler.touchCancel(...args);
          }
    }
})
