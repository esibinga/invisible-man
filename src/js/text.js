// prints responsive text on the page
// handles selection and dispatch of the new selected word (newWord) from both text and search bar

import * as d3 from "d3";
import "../style.scss";

// CONSTANTS AND GLOBALS
const widthW = window.innerWidth * .9;
const heightW = window.innerHeight * .5;
const IMtxt = require("url:../../data/invisible_man.txt");
let IMobj;
let IM_map;
let maxWordNum;
const spaceRE = /\s+/g;
const punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\ "!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
const white = "#fffeee";
const paleRed = "#533d3f";
const palerRed = "#806c6d";
const paleWhite = "#d1bebf";

export default class Text {
    constructor(dispatch) {
        this.loadData();
        this.dispatch = dispatch;
        this.dispatch.on("scroll", this.scrollToWordNum);
    }

    // DATA & CLEANING / RESTRUCTURING
    loadData() {

        d3.text(IMtxt, d3.autoType).then((data) => {
            // starts text with prologue -- to include epitaph, use data = data.slice(515, -198);
            data = data.slice(940, -198);

            // remove meta text but keep other formatting for readability
            const IM_noMeta = data.replace(spaceRE, ' ');
            const cells = IM_noMeta.split(/\s+/);

            IMobj = cells.reduce(function (acc, cur, i) {
                acc[i] = cur;
                return acc;
            }, {});

            const xah_obj_to_map = (obj => {
                const mp = new Map;
                Object.keys(obj).forEach(k => { mp.set(k, obj[k]) });
                return mp;
            });

            IM_map = xah_obj_to_map(IMobj)

            this.draw();
        })
    };

    // CREATE DATA-DRIVEN TEXT
    draw() {

        function gridData() {
            var data = new Array();
            var num = 0;
            var xpos = 1;
            var ypos = 1;
            var width = widthW / 20;
            var height = 25;
            var click = 0;
            var wordlength = 1;

            for (var row = 0; row < 500; row++) {
                data.push(new Array());

                // iterate for cells/columns inside rows
                for (var column = 0; xpos < widthW * .6; column++) {
                    data[row].push({
                        num: num,
                        word: IMobj[num],
                        wordlength: (IMobj[num]).length,
                        x: xpos,
                        y: ypos,
                        width: width,
                        height: height,
                        click: click
                    })
                    // increment the x position by the word length + a set spacing amount
                    xpos += 6.5 * (IMobj[num]).length + 6;
                    // increment the count of each square by 1
                    num += 1;
                }
                // reset the x position after a row is complete
                xpos = 1;
                // increment the y position for the next row. Move it down 25 (height variable)
                ypos += height;
            }

            return data;
        }

        var gridData = gridData();

        var grid = d3.select("#grid")
            .append("svg")
            .attr("class", "gridSvg")
            .attr("width", widthW * .7)
            .attr("height", heightW);

        var row = grid.selectAll(".row")
            .data(gridData)
            .enter().append("g")
            .attr("class", "row");

        var column = row.selectAll(".square")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("class", function (d) { return "a" + (d.num) }) // each rect has the class of its wordNum - for scroll
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("width", function (d) { return d.width; })
            .attr("height", function (d) { return d.height; })
            .style("stroke", "#3a2224")
            .style("fill", "#3a2224")

        // mouse event functions: 
        const mouseenter = function (d) {
            d3.selectAll(`text :not(.clicked)`)
                .style("fill", palerRed)
            d3.select(this)
                .transition()
                .style("fill", paleWhite)
                .attr("opacity", .9)
                .delay(80)
                .transition()
                .style("fill", palerRed)
                .attr("opacity", .9)
                .delay(1000)
        }

        const handleClickEvent = (event, d) => {
            let data = {}
            this.dispatch.call("statechange", this, IM_map.get(d.num.toString()).toLowerCase().replace(punctRE, '').replace(spaceRE, ' '));
            this.dispatch.call("newWordtoTopic", this, IM_map.get(d.num.toString()).toLowerCase().replace(punctRE, '').replace(spaceRE, ' '));
            d3.selectAll(`text`)
                .classed("clicked", false)
                .transition()
                .style("fill", palerRed)
                .delay(80)
            d3.selectAll(`text.${(d.word).toLowerCase().replace(punctRE, '').replace(spaceRE, ' ')}`)
                .style("fill", white)
                .classed("clicked", true)
        }

        const mouseout = function (d) {
            d3.selectAll(`.clicked`)
                .style("fill", white)
                .attr("opacity", 1)
                .attr("font-size", 11)
                .attr("text-anchor", "left")
        }

        // PRINT RESPONSIVE TEXT
        var text = row.selectAll(".label")
            .data(function (d) { return d; })
            .join("svg:text")
            .attr("class", "textWords")
            .attr("x", function (d) { return d.x })
            .attr("y", function (d) { return d.y + d.height / 2 })
            .attr("dy", ".5em")
            .attr("font-size", 11)
            .style("fill", palerRed)
            .attr("opacity", .9)
            .attr("class", function (d) { return (d.word).toLowerCase().replace(punctRE, '').replace(spaceRE, ' ') })
            .text(function (d) { return d.word })
            .on('mouseenter', mouseenter)
            .on('click', handleClickEvent)
            .on('mouseout', mouseout);


        // SEARCH INPUT - on enter or button click
        const search = document.getElementById("siteSearch");
        const button = document.getElementById("searchButton")
        search.addEventListener("keyup", function (event) {
            if (event.code === 'Enter') {
                event.preventDefault();
                button.click();
            }
        });

        d3.select("#searchButton")
            .on("click", () => {
                this.dispatch.call("statechange", this, document.getElementById("siteSearch").value.toString().toLowerCase().replace(punctRE, '').replace(spaceRE, ' '));
                this.dispatch.call("newWordtoTopic", this, document.getElementById("siteSearch").value.toString().toLowerCase().replace(punctRE, '').replace(spaceRE, ' '));
            })

        // SEARCH INPUT - mobile
        const searchM = document.getElementById("siteSearchMobile");
        const buttonM = document.getElementById("searchButtonMobile")
        searchM.addEventListener("keyup", function (event) {
            if (event.code === 'Enter') {
                event.preventDefault();
                buttonM.click();
            }
        });

        d3.select("#searchButtonMobile")
            .on("click", () => {
                this.dispatch.call("statechange", this, document.getElementById("siteSearchMobile").value.toString().toLowerCase().replace(punctRE, '').replace(spaceRE, ' '));
                this.dispatch.call("newWordtoTopic", this, document.getElementById("siteSearchMobile").value.toString().toLowerCase().replace(punctRE, '').replace(spaceRE, ' '));
            })

        // get the highest count for grid data to define scroll parameters below
        const maxNewRow = gridData.reduce((max, row) => max.num > row.num ? max : row)
        maxWordNum = maxNewRow[maxNewRow.length - 1].num
    }

    // when a word is clicked on the frequency chart
    // SCROLL CONTEXT INTO VIEW (only works for words loaded in gridData, not all words in the freq chart)
    scrollToWordNum(wordNum) {

        if (wordNum < maxWordNum) {
            const selection = d3.select(`.a${wordNum}`);
            const target = selection._groups[0][0]
            target.scrollIntoView({ block: 'center', behavior: "smooth" })
        } else {
            console.log("No scroll is available because this part of the text hasn't been loaded yet.")
        }

        // Next step is to load in gridData chapter by chapter as needed (or refactor completely because what am i doing with a for loop anyway...)
    }
}