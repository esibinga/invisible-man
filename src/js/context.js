// displays 10 words of context surrounding the selected word + word instance (from the single or multi frequency chart)

import * as d3 from 'd3';
import "../style.scss";

export default class Context {
    constructor(dispatch) {
        this.dispatch = dispatch;
        this.dispatch.on("wordNum.context", this.showContext);
    }

    // DISPLAY CONTEXT when a freq chart dispatch is called
    showContext(wordNum) {
        const width = 800;
        const height = 50;
        console.log("wordnum", wordNum)
        const boldedNewWord = this.IM_map.get(wordNum.toString())
        let context = this.IM_map.get((wordNum - 5).toString()) + " " + this.IM_map.get((wordNum - 4).toString()) + " " + this.IM_map.get((wordNum - 3).toString()) + " " + this.IM_map.get((wordNum - 2).toString()) + " " + this.IM_map.get((wordNum - 1).toString()) + " " + boldedNewWord + " " + this.IM_map.get((wordNum + 1).toString()) + " " + this.IM_map.get((wordNum + 2).toString()) + " " + this.IM_map.get((wordNum + 3).toString()) + " " + this.IM_map.get((wordNum + 4).toString()) + " " + this.IM_map.get((wordNum + 5).toString());

        this.svg = d3
            .select("#d3-container-context")
            .attr("viewBox", [0, 0, width, height * 2])
            .attr("class", "context")
            .text(`${context}`);

        this.svg = d3
            .select(".freq")
        this.dispatch.call("containerChange", this, this.svg);
    }

}

