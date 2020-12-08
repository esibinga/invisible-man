// imports
import * as d3 from "d3";
import { text } from "d3";
import '../style.scss';

// constants / globals
// this.tmResults = require("url:../../data/IM_19_by_20_try_2.csv")
let topicData;
let stack;
let selectedTopic = [];
const spaceRE = /\s+/g;
const punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;

//
export default class Topics {
    constructor(dispatch) {
        this.dispatch = dispatch;
        this.dispatch.on("statechange.topic", this.highlightTopic);
        this.tmResults = require("url:../../data/IM_19_by_20_try_2.csv")
        this.IMtxt = require('url:../../data/invisible_man.txt');
        this.topicData;
        this.stack;
        this.IM_map;
        this.selectedTopic;
        this.loadData();

        // [ ] TODO: add a dispatch so that this.loadData (or this.initTopic if separated) runs on a click event from text.js
        // it maybe shouldn't load when the page loads, too confusing
    }

    loadData() {
        d3.csv(this.tmResults, d => {
            d3.autoType(d);
            return { ...d }
        }).then((data) => {

            // sorted stream graph requires a stacked format
            this.stack = d3.stack()
                .keys(data.columns.slice(1))
                .order(d3.stackOrderInsideOut)
                .offset(d3.stackOffsetSilhouette)
                (data)
                .map(d => (d.forEach(v => v.key = d.key), d))

            this.topicData = data;

            this.colorArray = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4',
                '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8',
                '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff']


            // let textData;
            this.loadTextData();
            /// this.initTopic();
            //console.log("this.stack", this.topicData)
        })
    }

    loadTextData() {
        d3.text(this.IMtxt, d3.autoType).then((data) => {

            const spaceRE = /\s+/g;
            const punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
            const IM_noMeta_noPunct = data.slice(515, -198).replace(punctRE, '').replace(spaceRE, ' ')
            const cells = IM_noMeta_noPunct.toLowerCase().split(/\s+/)

            this.IMobj = cells.reduce(function (acc, cur, i) {
                acc[i] = cur;
                return acc;
            }, {});

            const xah_obj_to_map = (obj => {
                const mp = new Map;
                Object.keys(obj).forEach(k => { mp.set(k, obj[k]) });
                return mp;
            });

            this.IM_map = xah_obj_to_map(this.IMobj)
            this.initTopic();
        })
        //  console.log("this.IM Map here", this.IM_map)
    }

    initTopic() {
        //console.log("this.IMMAP", this.IM_map)

        const width = window.innerWidth * .9;
        const height = 100;
        const marginLeft = 0;
        const marginRight = 0;
        const marginBottom = 0;
        const marginTop = 0;

        this.xScale = d3
            .scaleBand()
            .domain(this.topicData.map(d => d.chapter_title))
            .range([0, width]);

        this.yScale = d3.scaleLinear()
            .domain([d3.min(this.stack, d => d3.min(d, d => d[1])), d3.max(this.stack, d => d3.max(d, d => d[1]))])
            .rangeRound([height - marginBottom, marginTop])

        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);

        const area = d3.area()
            .x(d => this.xScale(d.data.chapter_title))
            .y0(d => this.yScale(d[0]))
            .y1(d => this.yScale(d[1]))

        const color = d3.scaleOrdinal()
            .domain(this.stack.map(d => d.key))
            .range(this.colorArray)
            .unknown("#ccc")

        this.svg = d3
            .select("#d3-container-TM")
            .append("svg")
            .attr("viewBox", [0, 0, width * .9, height])
            .attr("class", "topic")

        const streams = this.svg.append("g")
            .selectAll("path")
            .data(this.stack)
            .join("path")
            .attr("fill", ({ key }) => color(key))
            .attr("d", area)
            .attr('stroke-width', '.5')
            .attr("stroke", "white")
            .append("title")
            .text(({ key }) => key)

        //create empty topic text box
        const topic =
            d3.select("#d3-container-TM")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 1)

        const topics = this.svg
            .selectAll("path")
            .on("mouseenter", function (d) {
                d3.select(this)
                    .raise()
                    .attr('stroke-width', '3')
                    .attr("stroke", "black")
                    .style("opacity", 1)
                    .transition()
                    .duration(200)
            })
            .on("click", (event, d) => {
                // topicClickDesign();
                // data is the topic data associated with an area
                const data = event.srcElement.__data__.key;
                // the next three lines turn the topic to strings and find those words in the full text
                const topicWords = data.replace(spaceRE, ' ').toLowerCase().split(/\s+/);
                const multiKeys = [...this.IM_map.entries()].filter(({ 1: d }) => topicWords.includes(d));
                const multiKeysNum = multiKeys.map(function (x) {
                    return parseInt(x, 10);
                });
                this.dispatch.call("topicArray", this, multiKeys, topicWords);
                // dispatch the current word again so that freq.js continues to display until newWord is changed by a click event in text.js:
                //this.dispatch.call("statechange", this, this.IM_map.get(d.toString()))

                // display the topic words in a div below:
                topic
                    .text(topicWords)
            })

            //  .on("click", topicToFreq(e))
            .on("mouseout", function () {
                d3.select(this)
                    .attr('stroke-width', '.5')
                    .attr("stroke", "white")
            })

        // const topicClickDesign(e) {
        //     d3.select(this)
        //         .raise()
        //         .attr('stroke-width', '3')
        //         .attr("stroke", "black")
        //         .style("opacity", 1)
        //     //.transition()
        //     //.duration(200)
        // }

    }




    topicToFreq() {
        // on click on a topic, create a newWordArray of the 10 topic words
        // dispatch these to the frequency chart and display, differentiated by color?

        // [ ] TODO: freqChart with input = array of values (observable?)
    }

    highlightTopic(newWord) {

        console.log("highlightTopic:", newWord)
        // [ ] TODO: find the topic in which this word is most prevalent
        // highlight that topic
    }

}