// displays lexical dispersion chart
// displays the selected word in the header

import * as d3 from "d3";
import '../style.scss';

//globals
const radius = 3;
const radiusBigger = 7;
const paleWhite = "#d1bebf";
const paleRed = "#533d3f";
const palerRed = "#806c6d";

export default class Freq {

    constructor(dispatch) {
        this.dispatch = dispatch;
        this.updateFreq = this.updateFreq.bind(this);
        // pick up the "statechange" call
        this.dispatch.on("statechange.freq", this.updateFreq);
        this.dispatch.on("containerChange", this.updateFreq);
        this.dispatch.on("topicArray", this.updateFreqMulti);
        this.IMtxt = require('url:../../data/invisible_man.txt');
        this.IM_map;
        this.IM_readable;
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

            this.IMobj = cells.reduce(function (acc, cur, i) {
                acc[i] = cur;
                return acc;
            }, {});

            this.IM_readable = data.slice(515, -198).split(/\s+/);

            this.IM_readable = this.IM_readable.reduce(function (acc, cur, i) {
                acc[i] = cur;
                return acc;
            }, {});

            const xah_obj_to_map = (obj => {
                const mp = new Map;
                Object.keys(obj).forEach(k => { mp.set(k, obj[k]) });
                return mp;
            });

            this.IM_map = xah_obj_to_map(this.IMobj)

            //const wordRollup = d3.rollup((cells), v => v.length, d => d)
            let newWord;
            this.draw(newWord);
            this.showNewWord("");
            this.drawFreqMulti();
        })
    };

    draw(newWord) {

        const width = window.innerWidth * .9;
        const height = 120;
        const marginLeft = 10;
        const marginRight = 10;
        const marginBottom = 0;
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
            .attr("class", "freq")
            .attr("viewBox", [0, 0, width, height])

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
            .tickFormat("");

        this.svg
            .attr("class", "freq")
            .append("g")
            .attr("transform", `translate(0, ${height - marginBottom})`)
            .call(this.xAxis)
            .append("text")
            .attr("class", "axis-label")
            .attr("x", "45%")
            .attr("dy", "3em")
            .text(`something`)

        this.yAxis = d3.axisLeft(this.yScale);

        this.svg.append("text")
            .text("Prologue")
            .attr("transform", `translate(${width * .025}, ${height - height * .25}) rotate(-90)`)
            .attr("fill", palerRed)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", smallFont);

        this.svg.append("text")
            .text("Epilogue")
            .attr("transform", `translate(${width - width * .015}, ${height - height * .25}) rotate(-90)`)
            .attr("fill", palerRed)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", smallFont);
    }

    updateFreq(newWord) {
        const keys = [...this.IM_map.entries()]
            .filter(({ 1: v }) => v === newWord)
            .map(([k]) => k);
        console.log("this.contextNum", this.contextNum)

        this.keysNum = keys.map(function (x) {
            return parseInt(x, 10);
        });

        console.log("keysNum", this.keysNum)
        // console.log("IM_Map", this.IM_map)
        console.log("newWOrd", newWord)

        const circle =
            this.svg.selectAll("circle")
                .data(this.keysNum)
                .join("circle")
                .attr("class", "circle")
                .attr("cy", this.yScale(5))
                .attr("cx", (d) => this.xScale(d))
                .attr("r", radius)
                .attr("fill", paleWhite)
                .attr("opacity", 1)
                .attr("stroke", paleWhite)
                .on("mouseenter", function (d) {
                    d3.select(this)
                        .attr("fill", "#fff")
                        .attr("r", radiusBigger)
                    //  .classed("moused", true)
                })
                .on('click', (event, d) => { //d3 v6?
                    this.contextNum = d
                    console.log("this in freq", this)
                    // dispatch the word number to context:
                    this.dispatch.call("wordNum", this, d); //this.IM_map.get(d.toString())
                    // dispatch the current word again so that freq.js continues to display until newWord is changed by a click event in text.js:
                    this.dispatch.call("statechange", this, this.IM_map.get(d.toString()))

                    // d3.selectAll(".ugh")
                    // .attr("fill", "#000")
                    d3.selectAll(".circle")
                        .attr("fill", palerRed)
                        .attr("stroke", palerRed)
                })
                .on("mouseout", function (event, d) {
                    d3.select(this)
                        .attr("fill", paleWhite)
                        .attr("stroke", paleWhite)
                        .attr("r", radius)
                        .classed("moused", false)
                })

        this.showNewWord(newWord);
    }

    drawFreqMulti() {
        const width = window.innerWidth * .9;
        const height = 120;
        const marginLeft = 10;
        const marginRight = 10;
        const marginBottom = 0;
        const marginTop = 10;
        const smallFont = 12;
        const medFont = 14;
        const bigFont = 20;
        const lightGray = "#999";
        const lightBlue = "#9dc1e0"; //"#bbd0e3";
        const medGray = "#777";
        const darkGray = "#444";

        this.multiSvg = d3
            .select("#d3-container-freq2")
            .append("svg")
            .attr("class", "freqMulti")
            .attr("viewBox", [0, 0, width, height])

        this.xScale = d3
            .scaleLinear()
            .domain([0, 176665])
            .range([marginLeft, width - marginRight]);

        //yScale is only drawn in updateFreqMulti once it has access to topic words from dispatch

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
            .tickFormat("");

        this.multiSvg
            .attr("class", "freq2")
            .append("g")
            .attr("transform", `translate(0, ${height - marginBottom})`)
            .call(this.xAxis)
            .append("text")
            .attr("class", "axis-label")
            .attr("x", "45%")
            .attr("dy", "3em")
            .text(`something`)
            .attr("fill", "#fff")

        this.tooltip = //this.svg
            d3.select("#d3-container-freq2")
                .append("div")
                .attr("class", "tooltip")
                .attr("transform", `translate(20, -100)`)
                .style("opacity", 1)

    }

    updateFreqMulti(multiKeys, topicWords) {
        const width = window.innerWidth * .9;
        const marginLeft = 10;
        const marginRight = 10;

        // re-select (not sure why this.multiSvg had to be re-instated here)
        this.multiSvg = d3
            .select(".freq2")

        this.xScale = d3
            .scaleLinear()
            .domain([0, 176665])
            .range([marginLeft, width - marginRight]);

        this.yScale = d3
            .scaleOrdinal()
            .domain(topicWords)
            .range([5, 15, 25, 35, 45, 55, 65, 75, 85, 95]);

        this.yAxis = d3.axisLeft(this.yScale)
            .tickValues(topicWords);

        //  console.log("multi KeysNum", multiKeysNum) -- this is just numbers, no words
        const multiKeysNum = multiKeys.map(function (x) {
            return parseInt(x, 10);
        });

        const multiKeysArray = [...this.IM_map.entries()]
            .filter(({ 1: d }) => topicWords.includes(d))
            .map(array => {
                return [parseInt(array[0]), array[1]]
            })

        const topicGroup = d3.group(multiKeysArray, d => d[1])
        const topicGroup1 = Array.from(d3.group(multiKeysArray, d => d[1]),
            ([key, value]) => ({ key, value: value.flat().filter(Number) }))
        //console.log("multikeys array", multiKeysArray)
        // console.log("multi keys", multiKeys)
        // console.log("topic group1", topicGroup1)
        //console.log("topic group key", topicGroup1[1].key)
        //console.log("topic group  value", topicGroup1[1].value)

        //add circles to axes
        const circle =
            this.multiSvg.selectAll("circle")
                .data(multiKeysArray) //topicGroup1)
                .join("circle")
                .attr("class", (d) => "circle" + ' ' + d[1])
                .attr("text", (d) => d[1])
                .attr("cy", (d) => this.yScale(d[1])) //.key))
                .attr("cx", (d) => this.xScale(d[0])) //.value)) //this gives only the first instance along the x-axis
                .attr("r", radius)
                .attr("fill", paleWhite)
                .attr("opacity", 1)
                .attr("stroke", paleWhite);

        // again, why did i have to reselect instead of being able to use this.tooltip from above?
        const tooltip = d3.select(".tooltip")

        const mouseenter = function (d) {
            d3.select(this)
                .attr("fill", "#fff")
                .attr("r", radiusBigger)
            tooltip
                .style("opacity", 1)
                .text(d.srcElement.classList[1])
                .transition()
                .duration(1000)
        }

        const mouseout = function (d) {
            d3.select(this)
                .attr("fill", paleWhite)
                .attr("r", radius)
            tooltip
                .style("opacity", 0)
                .transition()
                .duration(1000)
        }

        // const circle =
        //     this.svg.selectAll("circle")
        //         .data(multiKeysArray) //topicGroup1)
        //         .join("circle")
        //         .attr("class", (d) => "circle" + ' ' + d[1])
        //         .attr("text", (d) => d[1])
        //         .attr("cy", (d) => this.yScale(d[1])) //.key))
        //         .attr("cx", (d) => this.xScale(d[0])) //.value)) //this gives only the first instance along the x-axis
        //         .attr("r", radius)
        //         .attr("fill", "#9dc1e0")
        //         .attr("opacity", 1)
        //         .attr("stroke", "#9dc1e0")
        circle.on("mouseenter", mouseenter)
            //     tooltip
            //         .attr("transform", `translate(20, 20)`) // ${d => this.xScale(d[0]), d => this.yScale(d[1])})`)
            // })
            .on('click', (event, d) => { //d3 v6?
                this.contextNum = d
                console.log("this in freq", d[0])
                // dispatch the word number to context:
                //TO DO [ ] update new word as well so that this can show context
                this.dispatch.call("wordNum", this, d[0]);
                this.dispatch.call("statechange", this, d[1]);
                // dispatch the current word again so that freq.js continues to display until newWord is changed by a click event in text.js:
                this.dispatch.call("statechange", this, this.IM_map.get(d.toString()))
            })
            .on("mouseout", mouseout)
    }

    showNewWord(newWord) {
        d3.select("#newWord")
            .attr("viewBox", [0, 0, 100, 50])
            .text(`${newWord}`)
            .attr("color", '#111')
            .attr("class", "newWord")
    }

}