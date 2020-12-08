// imports
import * as d3 from "d3";
import '../style.scss';

// constants / globals


//
export default class Context {
    constructor(dispatch) {
        this.dispatch = dispatch;
        this.dispatch.on("wordNum.context", this.showContext);
    }

    showContext(wordNum) {
        const width = 800;
        const height = 50;
        console.log("wordnum", wordNum)
        const context = this.IM_map.get((wordNum - 3).toString()) + " " + this.IM_map.get((wordNum - 2).toString()) + " " + this.IM_map.get((wordNum - 1).toString()) + " " + this.IM_map.get(wordNum.toString()) + " " + this.IM_map.get((wordNum + 1).toString()) + " " + this.IM_map.get((wordNum + 2).toString()) + " " + this.IM_map.get((wordNum + 3).toString());
        // [ ] this works, but IM_map has no punctuation -- would be better coming from a source with more formatting
        // using IM_readable for context doesn't work because the numbers are not the same when there is punctuation included or not

        //const context = this.IM_readable[(wordNum - 3).toString()] + " " + this.IM_readable[(wordNum - 2).toString()] + " " + this.IM_readable[(wordNum - 1).toString()] + " " + this.IM_readable[wordNum.toString()] + " " + this.IM_readable[(wordNum + 1).toString()] + " " + this.IM_readable[(wordNum + 2).toString()] + " " + this.IM_readable[(wordNum + 3).toString()];

        console.log("im obj", this.IM_readable[wordNum])
        this.svg = d3
            .select("#d3-container-context")
            .attr("viewBox", [0, 0, width, height * 2])
            .text(context);

        this.svg = d3
            .select(".freq")
        this.dispatch.call("containerChange", this, this.svg);
    }

}
