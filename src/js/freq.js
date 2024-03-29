// displays lexical dispersion chart for single selected word and for words from the selected topic
// displays the selected word in the header

import * as d3 from "d3";
import "../style.scss";

// GLOBALS
const radius = 3;
const radiusBigger = 7;
const spaceRE = /\s+/g;
const punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
const paleWhite = "#d1bebf";
const paleRed = "#533d3f";
const palerRed = "#806c6d";
const chArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]


export default class Freq {

    constructor(dispatch) {
        this.dispatch = dispatch;
        this.updateFreq = this.updateFreq.bind(this);
        this.dispatch.on("statechange.freq", this.updateFreq);
        this.dispatch.on("containerChange", this.updateFreq);
        this.dispatch.on("topicArray", this.updateFreqMulti);
        this.IMtxt = require("url:../../data/invisible_man.txt");
        this.IM_map;
        this.IM_readable;
        this.loadData();
    }

    // DATA & CLEANING / RESTRUCTURING
    loadData() {

        d3.text(this.IMtxt, d3.autoType).then((data) => {

            // take out meta text, carriage breaks, punctuation, and converts to lowercase (unlike text.js which maintains readability)
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

            let newWord;
            this.draw(newWord);
            this.showNewWord(""); //inital value is nothing
            this.drawFreqMulti();
        })
    };


    // DISPLAY THE SELECTED WORD
    showNewWord(newWord) {
        if (newWord == undefined) { newWord = "" }
        d3.select("#newWord")
            .attr("viewBox", [0, 0, 100, 50])
            .text(`${newWord}`)
            .attr("color", '#111')
            .attr("class", "newWord")
    }

    // INITIALIZE SINGLE FREQUENCY CHART
    draw(newWord) {
        const width = window.innerWidth * .9;
        const height = 120;
        const marginLeft = 10;
        const marginRight = 10;
        const marginBottom = 0;
        const smallFont = 12;

        this.svg = d3
            .select("#d3-container-freq")
            .append("svg")
            .attr("class", "freq")
            .attr("viewBox", [0, 0, width, height * 1.1])

        this.xScale = d3
            .scaleLinear()
            .domain([0, 176665])
            .range([marginLeft, width - marginRight]);

        this.yScale = d3
            .scaleLinear()
            .domain([10, 0])
            .range([0, height]);

        // make chapter markings for x-axis scale
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
            .tickFormat(function (d, i) { return chArray[i] });
        // .tickFormat("");

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

        // add context with "Prologue" and "Epilogue" labels
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

    // UPDATE SINGLE FREQUENCY CHART
    updateFreq(newWord) {
        const keys = [...this.IM_map.entries()]
            .filter(({ 1: v }) => v === newWord)
            .map(([k]) => k);

        this.keysNum = keys.map(function (x) {
            return parseInt(x, 10);
        });

        //console.log("keysNum", this.keysNum)
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
                })
                .on('click', (event, d) => {
                    this.contextNum = d
                    // dispatch word number to text -- this one seems very heavy on the browser
                    this.dispatch.call("scroll", this, d);
                    // dispatches the word number to context
                    this.dispatch.call("wordNum", this, d);
                    // dispatch current word again so that freq.js chart continues to display with the current word until newWord is changed by a click event in text.js:
                    this.dispatch.call("statechange", this, this.IM_map.get(d.toString()))
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
        // because newWord must be reasserted every time the frequency chart is clicked, recall this method on every freq update   
        this.showNewWord(newWord);
    }

    // INIT TOPIC FREQ CHART
    drawFreqMulti() {
        const width = window.innerWidth * .9;
        const height = 120;
        const marginLeft = 10;
        const marginRight = 10;
        const marginBottom = 0;

        this.multiSvg = d3
            .select("#d3-container-freq2")
            .append("svg")
            .attr("class", "freqMulti")
            .attr("viewBox", [0, 0, width, height * 1.1])

        this.xScale = d3
            .scaleLinear()
            .domain([0, 176665])
            .range([marginLeft, width - marginRight]);

        //yScale is only drawn in updateFreqMulti once it has access to topic words from dispatch

        // make chapter markings for x-axis scale
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
            .tickFormat(function (d, i) { return chArray[i] });

        // .tickFormat("");

        this.multiSvg
            .attr("class", "freq2")
            .append("g")
            .attr("transform", `translate(0, ${height - marginBottom})`)
            .call(this.xAxis)
        // .append("text")
        // .attr("class", "axis-label")
        // .attr("x", "45%")
        // .attr("dy", "3em")
        // .text(`something`)
        // .attr("fill", "#fff")

        this.tooltip =
            d3.select("#d3-container-freq2")
                .append("div")
                .attr("class", "tooltip")
                .attr("transform", `translate()`)
                .style("opacity", 1)

        // for another day: tooltip next to element rather than below the graph
        // this.tooltip =
        //     d3.select(".freq2")
        //         .append("div")
        //         .attr("class", "tooltip")
        //         //.attr("transform", `translate(20, -100)`)//${x[0], y[0]})`)
        //         .attr("opacity", 1)
        //         .attr("width", "10px")
        //         .attr("height", "10px")
        //         .attr("fill", "white")

    }

    // UPDATE TOPIC FREQ CHART
    updateFreqMulti(multiKeys, topicWords) {
        const width = window.innerWidth * .9;
        const marginLeft = 10;
        const marginRight = 10;

        // re-select (not sure why this.multiSvg had to be re-instated here (and at tooltip below, instead of this.tooltip))
        this.multiSvg = d3
            .select(".freq2")

        this.xScale = d3
            .scaleLinear()
            .domain([0, 176665])
            .range([marginLeft, width - marginRight]);

        // make y-scale, now that topicWords is available via d3.dispatch
        this.yScale = d3
            .scaleOrdinal()
            .domain(topicWords)
            .range([5, 15, 25, 35, 45, 55, 65, 75, 85, 95]);

        this.yAxis = d3.axisLeft(this.yScale)
            .tickValues(topicWords);

        const multiKeysArray = [...this.IM_map.entries()]
            .filter(({ 1: d }) => topicWords.includes(d))
            .map(array => {
                return [parseInt(array[0]), array[1]]
            })

        const topicGroup = d3.group(multiKeysArray, d => d[1])
        const topicGroup1 = Array.from(d3.group(multiKeysArray, d => d[1]),
            ([key, value]) => ({ key, value: value.flat().filter(Number) }))

        //add circles to axes
        const circle =
            this.multiSvg.selectAll("circle")
                .data(multiKeysArray)
                .join("circle")
                .attr("class", (d) => "circle" + ' ' + d[1])
                .attr("text", (d) => d[1])
                .attr("cy", (d) => this.yScale(d[1]))
                .attr("cx", (d) => this.xScale(d[0]))
                .attr("r", radius)
                .attr("fill", paleWhite)
                .attr("opacity", 1)
                .attr("stroke", paleWhite);

        // mouse event functions: 
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
            //  .attr("transform", `translate(${d.x}, ${d.y})`)
            //  console.log(d)
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

        circle.on("mouseenter", mouseenter)
            .on('click', (event, d) => {
                this.contextNum = d
                this.dispatch.call("wordNum", this, d[0]);
                this.dispatch.call("statechange", this, d[1]);
                this.dispatch.call("newWordtoTopic", this, d[1]);
            })
            .on("mouseout", mouseout)
    }
}