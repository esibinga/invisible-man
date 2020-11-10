// this will have the full text (clickable)

import * as d3 from "d3";
import '../style.scss';

export function text() {

    // CONSTANTS AND GLOBALS

    const widthW = window.innerWidth * 0.8;
    const heightW = window.innerHeight * 0.9;
    const marginLeft = 0;
    const marginRight = 0;
    const marginBottom = 50;
    const marginTop = 10;
    const lightBlue = "#9dc1e0"; //"#bbd0e3";
    const IMtxt = require('url:../../data/invisible_man.txt');
    let IMobj;
    let IM_map;

    // DATA AND MANIPULATIONS
    d3.text(IMtxt, d3.autoType).then((data) => {
        data = data.slice(515, -198);
        const spaceRE = /\s+/g;
        const punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
        const IM_noMeta_noPunct = data.replace(punctRE, '').replace(spaceRE, ' ');
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
        //console.log("IM map get", d => IM_map.get(d))
        init();

    });

    // TEXT ACROSS SCREEN
    function init() {

        const svg = d3
            .select("#d3-container")
            .append("svg")
            .attr('width', widthW)
            .attr('height', heightW * .6);

        function gridData() {
            var data = new Array();
            var num = 0;
            var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
            var ypos = 1;
            var width = widthW / 20;
            var height = 15;
            var click = 0;
            var wordlength = 1;

            // iterate for rows	
            for (var row = 0; row < 100; row++) {
                data.push(new Array());

                // iterate for cells/columns inside rows
                for (var column = 0; column < 20; column++) {
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
        // I like to log the data to the console for quick debugging
        console.log(gridData);
        //console.log("num", d3.extent(gridData));

        var grid = d3.select("#grid")
            .append("svg")
            .attr("width", widthW)
            .attr("height", "510px");

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

        var text = row.selectAll(".label")
            .data(function (d) { return d; })
            .join("svg:text")
            .attr("x", function (d) { return d.x + d.width / 2 })
            .attr("y", function (d) { return d.y + d.height / 2 })
            .attr("text-anchor", "left")
            .attr("dy", ".5em")
            .attr("font-size", 10)
            .style("fill", "fff")
            .text(function (d) { return d.word })
            .on('mouseenter', function (d) {
                d3.select(this)
                    .style("fill", lightBlue)
            })
            .on('mouseout', function (d) {
                d3.select(this)
                    .style("fill", "fff")
            });

    }
}