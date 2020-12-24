// imports
import * as d3 from "d3";
import "../../src/style.scss";

// GLOBALS
let stack;
let selectedTopic = [];
const spaceRE = /\s+/g;
const palerRed = "#806c6d";
const paleWhite = "#d1bebf";
const darkDarkRed = "#3a2224";
let findTopicData;
const chArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]


export default class Topics {
    constructor(dispatch) {
        this.dispatch = dispatch;
        this.dispatch.on("newWordtoTopic", this.newWordtoTopic);
        this.tmResults = require("url:../../data/IM_19_by_20_try_2.csv");
        this.IMtxt = require("url:../../data/invisible_man.txt");
        this.topicData;
        this.stack;
        this.IM_map;
        this.selectedTopic;
        this.loadData();

    }

    // LOAD AND REFACTOR TOPIC DATA
    loadData() {

        /*
        // ran this in Observable and pasted the output of midpoints below
            function midpoints(chapters1) {
                let simpleArray = []
             for (let i=0; i < chapters1.length; i++) {
             const midpoint = (chapters1[i] + chapters1[i+1] ) / 2
               simpleArray.push(Math.round(midpoint))
             }
             return simpleArray;
           } 
        */

        const chapterStarts = [73, 3860, 9982, 22020, 29647, 32782, 41491, 45907, 49022, 52123, 59091, 69753, 75245, 78217, 89089, 95604, 100095, 107242, 115524, 123295, 127492, 134212, 139796, 144982, 155513, 161785, 173283]
        // these are chapter midpoints to align the topic model and chapters, but the beginning and end are fudged (it starts at the beginning of the prologue and ends at the end of the epilogue)
        const chapterMidpoints = [73, 6921, 16001, 25834, 31215, 37137, 43699, 47465, 50573, 55607, 64422, 72499, 76731, 83653, 92347, 97850, 103669, 111383, 119410, 125394, 130852, 137004, 142389, 150248, 158649, 167534, 176665]


        d3.csv(this.tmResults, d => {
            d3.autoType(d);
            return { ...d, chapter_start: chapterStarts.shift(), chapter_midpoint: chapterMidpoints.shift() }
        }).then((data) => {

            // sorted stream graph requires a stacked format
            this.stack = d3.stack()
                .keys(data.columns.slice(1))
                .order(d3.stackOrderInsideOut)
                .offset(d3.stackOffsetSilhouette)
                (data)
                .map(d => (d.forEach(v => v.key = d.key), d))

            this.topicData = data;
            findTopicData = this.topicData

            //new color array, optimized for better contrast (first color is assigned to "Chapter", hence #000)
            this.colorArray = ['#000', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4',
                '#46f0f0', '#f032e6', '#bcf60c', '#D5964D', '#fffac8', '#e6beff', '#fabebe', '#008080',
                '#e6194b', '#aaffc3', '#89cff0', '#ffffff', '#ffd8b1', '#000075', '#808080']

            this.loadTextData();
        })
    }


    // LOAD AND REFACTOR TEXT DATA
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
            this.newWordtoTopic();
        })
    }

    initTopic() {
        const width = window.innerWidth * .9;
        const height = 100;
        const marginLeft = 10;
        const marginRight = 10;
        const marginBottom = 0;
        const marginTop = 0;

        this.xScale = d3
            .scaleLinear()
            .domain([0, 176665])
            .range([marginLeft, width - marginRight]);

        const chapterTicks = [...this.IM_map.entries()]
            .filter(({ 1: v }) => v === "chapter")
            .map(([k]) => k);

        this.chapterTicks = chapterTicks.map(function (x) {
            return parseInt(x, 10);
        });

        this.chapterTicksObj = chapterTicks.map(function (currElement, index) {
            return {
                chapter: index,
                num: parseInt(currElement, 10),
            }
        });

        this.yScale = d3.scaleLinear()
            .domain([d3.min(this.stack, d => d3.min(d, d => d[1])), d3.max(this.stack, d => d3.max(d, d => d[1]))])
            .rangeRound([height - marginBottom, marginTop])

        this.xAxis = d3.axisBottom(this.xScale)
            .tickValues(this.topicData.map(d => d.chapter_start))
            .tickSize(-height)
            .tickFormat(function (d, i) { return chArray[i] })
            .tickArguments([26])

        this.yAxis = d3.axisLeft(this.yScale);

        const area = d3.area()
            .x(d => this.xScale(d.data.chapter_midpoint))
            .y0(d => this.yScale(d[0]))
            .y1(d => this.yScale(d[1]))

        const color = d3.scaleOrdinal()
            .domain(this.stack.map(d => d.key))
            .range(this.colorArray)
            .unknown("#ccc")

        this.svg = d3
            .select("#d3-container-TM")
            .append("svg")
            .attr("viewBox", [0, 0, width, height * 1.2])
            .attr("class", "topic")

        this.svg
            .attr("class", "topic")
            .append("g")
            .attr("transform", `translate(0, ${height - marginBottom})`)
            .call(this.xAxis)

        d3.selectAll('path')
            .style("opacity", .4)
            .attr("stroke", darkDarkRed)
            .attr('stroke-width', '.5')

        const streams = this.svg.append("g")
            .selectAll("path")
            .data(this.stack)
            .join("path")
            .attr("fill", ({ key }) => color(key))
            .attr("d", area)
            .attr('stroke-width', '.5')
            .attr("stroke", palerRed)
            .attr("class", ({ key }) => key)
            .append("title")
            .text(({ key }) => key)
            .call(this.xAxis)

        //create empty topic text box
        const topic =
            d3.select("#d3-container-TM")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 1)

        // 
        const topics = this.svg
            .selectAll("path")
            .on("mouseenter", function (d) {
                d3.selectAll('path')
                    .style("opacity", .4)
                    .attr("stroke", darkDarkRed)
                    .attr('stroke-width', '.5')
                d3.select(this)
                    .raise()
                    .attr('stroke-width', '3')
                    .attr("stroke", ({ key }) => color(key))
                    .style("opacity", 1)
                    .transition()
                    .duration(200)
            })
            .on("click", (event, d) => {
                // data is the topic data associated with an area
                const data = event.srcElement.__data__.key;
                // the next three lines turn the topic to strings and find those words in teh text ofr the multi-word Freq plot
                const topicWords = data.replace(spaceRE, ' ').toLowerCase().split(/\s+/);
                const multiKeys = [...this.IM_map.entries()].filter(({ 1: d }) => topicWords.includes(d));
                this.dispatch.call("topicArray", this, multiKeys, topicWords);
                // display the topic words in a div below:
                this.svg = d3
                    .select("#d3-container-multiContext")
                    .attr("viewBox", [0, 0, width, height * 2])
                    .attr("class", "context")
                    .text(`${topicWords.join(', ')}`);

                // [ ] TODO: UI to show/maintain clicked topic -- proving more challenging than expected
                // d3.select((d) => this.topicData.columns[d])
                //     .attr("classed", "clicked")
                //     console.log("key:", key)
            })
            .on("mouseout", function () {
                d3.select(this)
            })



    }

    // throws a HINT if a selected word is represented in the topic graph
    // TO COME: if selected word is in a topic, that topic will be highlighted
    newWordtoTopic(newWord) {
        const data = findTopicData;
        const width = 800;
        const height = 50;

        // order topics within each chapter to get the biggest topic
        const compareNumbers = (a, b) => {
            return b - a;
        }

        // define a way to get the topic from its value
        const getKeyByValue = (object, value) => {
            return Object.keys(object).find(key => object[key] === value);
        }

        // restructure the array to an object
        const object = (d) => {
            return data[d]
        }

        // return the largest topic in each chapter (index is [4] because the first four values returned are always the ch. title, ch number, ch_start and ch_midpoint)
        const topTopicValue = (d) => {
            return Object.values(data[d]).sort(compareNumbers)[4]
        }

        // get the chapter associated with that topic value
        const topTopicByChapter = (d) => {
            return " " + getKeyByValue(object(d), topTopicValue(d)) + " " // spaces added on each side so that .match will work for the full, exact word down below
        }

        /* // returns an array of chapter numbers in which newWord is in the top topic (not used)
         const topicNumFromArray = (chArray, newWord) => {
             var arr = []
             for (let i = 0; i < chArray.length; i++) {
                 if (topTopicByChapter(i).includes(newWord))
                     arr.push(i)
             }
             return arr
         } */

        // is newWord in the top topic for this chapter? build an array of TRUE values
        const returnTopicNum = (chArray, newWord) => {
            var arr = []
            for (let d = 0; d < chArray.length; d++) {
                if (topTopicByChapter(d).match(" " + newWord + " ")) {
                    arr.push(d)
                } else { }
            }
            return arr
        }

        const textOutput = (newWord) => {
            if ((newWord) && returnTopicNum(chArray, newWord).length == 0) {
                return "\"" + newWord + "\"" + " isn't in the top topic for any chapters"
            } else if ((newWord) && returnTopicNum(chArray, newWord).length == 1) {
                return "\"" + newWord + "\"" + " is in the top topic for Chapter " + returnTopicNum(chArray, newWord)
            } else if ((newWord) && returnTopicNum(chArray, newWord).length >= 2) {
                return "\"" + newWord + "\"" + " is in the top topic for Chapters " + returnTopicNum(chArray, newWord).join(", ").replace(/, ((?:.(?!, ))+)$/, ' and $1');
            } else return ""
        }

        this.svg = d3
            .select("#d3-container-hint")
            .attr("viewBox", [0, 0, width, height * 2])
            .attr("class", "context")
            .text(textOutput(newWord))
    }
}