// prints responsive text on the page
// handles selection and dispatch of the new selected word (newWord) from both text and search bar

import * as d3 from "d3";
import '../style.scss';

// CONSTANTS AND GLOBALS
const widthW = window.innerWidth * .9;
const heightW = window.innerHeight * .5;

// const url = require('url')
// const IMtxt2 = url.parse('../../data/invisible_man.txt');
const IMtxt = require('../../data/invisible_man.txt');
let IMobj;
let IM_map;
const spaceRE = /\s+/g;
const punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
const white = '#fffeee'
const lightBlue = '#a2cff7';
const paleRed = "#533d3f";
const palerRed = "#806c6d";
const paleWhite = "#d1bebf";

export default class Text {
    constructor(dispatch) {
        this.loadData();
        this.dispatch = dispatch;
    }

    // DATA AND MANIPULATIONS
    loadData() {

        d3.text(IMtxt, d3.autoType).then((data) => {
            // includes quotations
            //data = data.slice(515, -198);
            // starts with prologue
            data = data.slice(940, -198);
            console.log("data ugh are we back to this", data)
            //const IM_noMeta_noPunct = data.replace(punctRE, '').replace(spaceRE, ' ');
            // this is called noPunct but it actually does include it
            // [ ] TO DO: fix that ^^
            const IM_noMeta_noPunct = data.replace(spaceRE, ' ');
            const cells = IM_noMeta_noPunct.split(/\s+/); //.toLowerCase()

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
            const wordRollup = d3.rollup((cells), v => v.length, d => d)
            //initial value of newWord is "invisible" BUT this sometimes breaks it... must depend on order of loading in data
            //this.dispatch.call("statechange", this, 'invisible');
            // .call is like "pick up the phone to call" & .on is like ".on 'ring', pick up the .call"

            this.draw();
        })
    };

    // TEXT ACROSS SCREEN
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

            for (var row = 0; row < 100; row++) {
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
            .attr("class", "square")
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("width", function (d) { return d.width; })
            .attr("height", function (d) { return d.height; })
            .style("stroke", "#3a2224")
            .style("fill", "#3a2224")

        // below is the real draw() portion:
        var text = row.selectAll(".label")
            .data(function (d) { return d; })
            .join("svg:text")
            .attr("class", "textWords")
            .attr("x", function (d) { return d.x })
            .attr("y", function (d) { return d.y + d.height / 2 })
            //.attr("text-anchor", "left")
            .attr("dy", ".5em")
            .attr("font-size", 11)
            .style("fill", palerRed)
            .attr("opacity", .9)
            .attr("class", function (d) { return (d.word).toLowerCase().replace(punctRE, '').replace(spaceRE, ' ') })
            .text(function (d) { return d.word })
            .on('mouseenter', function (d) {
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
                // [ ] TODO: make this a function, maybe?
                //[ ] TODO: make .clicked exempt from transitions until a new .clicked is created     
            })
            .on('click', (event, d) => { //d3 v6?
                //console.log("d", d)
                let data = {}
                this.dispatch.call("statechange", this, IM_map.get(d.num.toString()).toLowerCase().replace(punctRE, '').replace(spaceRE, ' '));
                d3.selectAll(`text`)
                    .classed("clicked", false)
                    .transition()
                    .style("fill", palerRed)
                    .delay(80)
                d3.selectAll(`text.${(d.word).toLowerCase().replace(punctRE, '').replace(spaceRE, ' ')}`)
                    .style("fill", white)
                    .classed("clicked", true)
                //.attr("classed", "clicked")
                // [ ] TODO: on click, clear context if there is any
            })
            .on('mouseout', function (d) {
                // d3.selectAll(`text :not(.clicked)`)
                //     .style("fill", palerRed)
                //     .attr("opacity", .9)
                //     .attr("font-size", 11)
                //     .attr("text-anchor", "left")
                //     .transition(500)
                // d3.select(this)
                //     .style("fill", palerRed)
                //     .attr("opacity", .9)
                d3.selectAll(`.clicked`)
                    .style("fill", white)
                    .attr("opacity", 1)
                    .attr("font-size", 11)
                    .attr("text-anchor", "left")

                // console.log("this museout", this)
            });

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
            })
    }
}