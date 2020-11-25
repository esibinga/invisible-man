// interactive lexical dispersion chart

import * as d3 from "d3";
import '../style.scss';

export default class Freq {

    constructor(dispatch) {
        this.dispatch = dispatch;
        this.updateFreq = this.updateFreq.bind(this);
        this.dispatch.on("statechange.freq", this.updateFreq); // pick up the "statechange" call
        //    this.dispatch.on("wordNum", (d) => console.log("wordNUM", d));
        this.IMtxt = require('url:../../data/invisible_man.txt');
        this.IM_map;
        this.loadData();
        //can separate updateFreq into smaller functions
        // or - give Freq an internal state property that updates every time 
        // save the new word to this.newWOrd to keep track of it
    }

    // data and manipulations
    loadData() {

        d3.text(this.IMtxt, d3.autoType).then((data) => {

            const spaceRE = /\s+/g;
            const punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
            const IM_noMeta_noPunct = data.slice(515, -198).replace(punctRE, '').replace(spaceRE, ' ')
            const cells = IM_noMeta_noPunct.toLowerCase().split(/\s+/)

            const IMobj = cells.reduce(function (acc, cur, i) {
                acc[i] = cur;
                return acc;
            }, {});

            const xah_obj_to_map = (obj => {
                const mp = new Map;
                Object.keys(obj).forEach(k => { mp.set(k, obj[k]) });
                return mp;
            });

            this.IM_map = xah_obj_to_map(IMobj)

            //const wordRollup = d3.rollup((cells), v => v.length, d => d)
            let newWord;
            this.draw(newWord);
        })
    };

    draw(newWord) {

        const width = 800;
        const height = 50;
        const marginLeft = 10;
        const marginRight = 10;
        const marginBottom = 10;
        const marginTop = 10;
        const smallFont = 12;
        const medFont = 14;
        const bigFont = 20;
        const lightGray = "#999";
        const lightBlue = "#9dc1e0"; //"#bbd0e3";
        const medGray = "#777";
        const darkGray = "#444";

        this.svg = d3
            .select("#d3-container-freq")
            .append("svg")
            .attr("viewBox", [0, 0, width, height * 2])

        this.xScale = d3
            .scaleLinear()
            .domain([0, 176665])
            .range([marginLeft, width - marginRight]);

        this.yScale = d3
            .scaleLinear()
            .domain([10, 0])
            .range([0, height]);

        // make chapter markings for x-axis
        const chapterTicks = [...this.IM_map.entries()]
            .filter(({ 1: v }) => v === "chapter")
            .map(([k]) => k);

        this.chapterTicksObj = chapterTicks.map(function (currElement, index) {
            return {
                chapter: index,
                num: parseInt(currElement, 10),
            }
        });

        this.chapterTicks = chapterTicks.map(function (x) {
            return parseInt(x, 10);
        });

        this.xAxis = d3.axisBottom(this.xScale)
            .tickValues(this.chapterTicksObj.map(a => a.num))
            .tickSize(-height)

        this.svg
            .attr("class", "freq")
            .append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(this.xAxis)
            .append("text")
            .attr("class", "axis-label")
            .attr("x", "45%")
            .attr("dy", "3em")
            .text(`dispersion of "${newWord}" in Invisible Man`)
            .attr("font-size", medFont)
            .attr("fill", "#fff")
            .selectAll(".tick")
            .attr("fill", "red")
            .attr("class", "work");

        this.yAxis = d3.axisLeft(this.yScale);
        // this.svg
        //     .append("g")
        //     .attr("class", "axis y-axis")
        //     .attr("transform", `translate(${marginLeft},${marginTop})`)
        //     // .call(yAxis)
        //     // .append("text")
        //     .attr("class", "axis-label")
        //     .attr("y", "50%")
        //     .attr("dx", "-3em")
        //     .attr("writing-mode", "vertical-rl")
        //     .text(" ")
        //     .attr("font-size", medFont)
        //     .attr("fill", medGray)

    }

    updateFreq(newWord) {
        // this.IM_Map is undefined the first time this runs, so [...this.IM_map.entries()] throws an error until a click event fires
        const keys = [...this.IM_map.entries()]
            .filter(({ 1: v }) => v === newWord)
            .map(([k]) => k);

        this.keysNum = keys.map(function (x) {
            return parseInt(x, 10);
        });

        // console.log("keysNum", this.keysNum)
        // console.log("IM_Map", this.IM_map)
        console.log("newWOrd", newWord)

        const circle =
            this.svg.selectAll("circle")
                .data(this.keysNum)
                .join("circle")
                .attr("class", "circle")
                .attr("cy", this.yScale(5))
                .attr("cx", (d) => this.xScale(d))
                .attr("r", 2)
                .attr("fill", "#9dc1e0")
                .attr("opacity", 1)
                .attr("stroke", "#9dc1e0")
                .on("mouseenter", function (d) {
                    d3.select(this)
                        .attr("fill", "#fff")
                        .attr("r", 3)
                    //wordNum = d.srcElement.__data__.toString()
                })
                .on('click', (event, d) => { //d3 v6?
                    this.contextNum = d //.toString()
                    this.dispatch.call("wordNum", this, d);
                    // console.log("context word NUm", (this.IM_map.get((this.contextNum - 1).toString()) + " " + this.IM_map.get(this.contextNum.toString()) + " " + this.IM_map.get((this.contextNum + 1).toString())))
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                        .attr("fill", "#9dc1e0")
                        .attr("r", 2)
                })

        this.svg.select("axis-label")
            //  .append("g")
            //  .attr("class", "axis x-axis")
            // .attr("transform", `translate(0,${height - marginBottom})`)
            .call(this.xAxis)
            .append("text")
            // .attr("class", "axis-label")
            .attr("x", "45%")
            .attr("dy", "3em")
            .text(newWord) //`dispersion of "${newWord}" in Invisible Man`)
            //.attr("font-size", medFont)
            .attr("fill", "#fff");

        //update x axis title with newWord

    }
}