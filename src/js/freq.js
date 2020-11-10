// interactive lexical dispersion chart

//import { text, csv, autoType } from 'd3';
import * as d3 from "d3";
import '../style.scss';

export function freq() {

    const IMtxt = require('url:../../data/invisible_man.txt');
    let IM_map;

    // data and manipulations
    d3.text(IMtxt, d3.autoType).then((data) => {
        data = data.slice(515, -198);
        const spaceRE = /\s+/g;
        const punctRE = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g;
        const IM_noMeta_noPunct = data.replace(punctRE, '').replace(spaceRE, ' ')
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

        IM_map = xah_obj_to_map(IMobj)

        const wordRollup = d3.rollup((cells), v => v.length, d => d)

        //console.log("IM text", data)
        console.log("IM obj", IMobj[90]);
        console.log("IM map", IM_map);
        console.log("IM unique word map", wordRollup)

        init();
    });

    function init() {

        const width = 800;
        const height = 50;
        const marginLeft = 10;
        const marginRight = 0;
        const marginBottom = 50;
        const marginTop = 10;
        const smallFont = 12;
        const medFont = 14;
        const bigFont = 20;
        const lightGray = "#999";
        const lightBlue = "#9dc1e0"; //"#bbd0e3";
        const medGray = "#777";
        const darkGray = "#444";
        const word = "man"; // this will become a state variable

        const keys = [...IM_map.entries()]
            .filter(({ 1: v }) => v === word)
            .map(([k]) => k);

        const keysNum = keys.map(function (x) {
            return parseInt(x, 10);
        });

        const svg = d3
            .select("#d3-container-freq")
            .append("svg")
            .attr("viewBox", [0, 0, width, height * 1.1])

        const xScale = d3
            .scaleLinear()
            .domain([0, 176665]) //d3.extent(keysNum)) 
            .range([marginLeft, width - marginRight]);

        const yScale = d3
            .scaleLinear()
            .domain([10, 0])
            .range([0, height]);

        const xAxis = d3.axisBottom(xScale);
        svg
            .append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${height - marginBottom})`)
            // .call(xAxis)
            .append("text")
            .attr("class", "axis-label")
            .attr("x", "45%")
            .attr("dy", "3em")
            .text(`dispersion of "${word}" in Invisible Man`)
            .attr("font-size", medFont)
            .attr("fill", "none");

        const yAxis = d3.axisLeft(yScale);
        svg
            .append("g")
            .attr("class", "axis y-axis")
            .attr("transform", `translate(${marginLeft},${marginTop})`)
            // .call(yAxis)
            .append("text")
            .attr("class", "axis-label")
            .attr("y", "50%")
            .attr("dx", "-3em")
            .attr("writing-mode", "vertical-rl")
            .text(" ")
            .attr("font-size", medFont)
            .attr("fill", medGray)

        // create circle for each key (word instance)
        const circle =
            svg.selectAll("circle")
                .data(keysNum)
                .join("circle")
                .attr("cy", yScale(5))
                .attr("cx", (d) => xScale(d))
                .attr("r", 1)
                .attr("fill", lightBlue)
                .attr("opacity", 1)
                .attr("stroke", lightBlue)


    }
}