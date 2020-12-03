import * as d3 from "d3";
import '../style.scss';

// CONSTANTS AND GLOBALS
const widthW = window.innerWidth * .9;
const heightW = window.innerHeight * .5;
const lightBlue = '#a2cff7';
const IMtxt = require('url:../../data/invisible_man.txt');
let IMobj;
let IM_map;
const spaceRE = /\s+/g;
const punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;

export default class Text {
    constructor(dispatch) {
        this.loadData();
        this.dispatch = dispatch;
    }

    // DATA AND MANIPULATIONS
    loadData() {

        d3.text(IMtxt, d3.autoType).then((data) => {
            data = data.slice(515, -198);
            //const IM_noMeta_noPunct = data.replace(punctRE, '').replace(spaceRE, ' ');
            const IM_noMeta_noPunct = data.replace(spaceRE, ' ');
            const cells = IM_noMeta_noPunct.toLowerCase().split(/\s+/);

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
            //initial value of newWord is "invisible" BUT this sometimes breaks it... and sometimes works?
            // this.dispatch.call("statechange", this, IM_map.get("80"));
            // .call is like "pick up the phone to call" & .on is like ".on 'ring', pick up the .call"

            this.draw();
        })
    };

    // TEXT ACROSS SCREEN
    draw() {
        const svg = d3
            .select("#d3-container")
            .append("svg")
            .attr('width', widthW)
            .attr('height', heightW);

        function gridData() {
            var data = new Array();
            var num = 0;
            var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
            var ypos = 1;
            var width = widthW / 20;
            var height = 20;
            var click = 0;
            var wordlength = 1;

            // iterate for rows	
            for (var row = 0; row < 500; row++) {
                data.push(new Array());

                // iterate for cells/columns inside rows
                for (var column = 0; column < 25; column++) {
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
                    xpos += 6 * (IMobj[num]).length + 8;
                    // increment the count of each square by 1
                    num += 1;
                }
                // reset the x position after a row is complete
                xpos = 1;
                // increment the y position for the next row. Move it down 50 (height variable)
                ypos += height;
            }
            return data;
        }

        var gridData = gridData();
        //  console.log(gridData);

        var grid = d3.select("#grid")
            .append("svg")
            .attr("width", widthW)
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
            .style("fill", "#3a2224")
            .style("stroke", "#fff0")

        // below is the real draw() portion:
        var text = row.selectAll(".label")
            .data(function (d) { return d; })
            .join("svg:text")
            .attr("class", "textWords")
            .attr("x", function (d) { return d.x + d.width / 2 })
            .attr("y", function (d) { return d.y + d.height / 2 })
            //.attr("text-anchor", "left")
            .attr("dy", ".5em")
            .attr("font-size", 10)
            .style("fill", "fff")
            .attr("opacity", .9)
            .attr("class", function (d) { return d.word })
            .text(function (d) { return d.word })
            .on('mouseenter', function (d) {
                d3.select(this)
                    .style("fill", lightBlue)
                    .attr("opacity", 1)
                    .attr("font-size", 12)
                    .attr("text-anchor", "right")
            })
            .on('click', (event, d) => { //d3 v6?
                console.log("d", d)
                this.dispatch.call("statechange", this, IM_map.get(d.num.toString()).replace(punctRE, '').replace(spaceRE, ' '));
            })
            .on('mouseout', function (d) {
                d3.select(this)
                    .style("fill", "fff")
                    .attr("opacity", .9)
                    .attr("font-size", 10)
                    .attr("text-anchor", "left")
                    .transition(500)
            });
    }
}