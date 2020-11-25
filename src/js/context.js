// imports
import * as d3 from "d3";
import '../style.scss';

// constants / globals


//
export default class Context {
    constructor(dispatch) {
        // this.loadData();
        this.dispatch = dispatch;
        this.dispatch.on("wordNum.context", this.showContext)

    }

    showContext(wordNum) {
        console.log("context:", (this.IM_map.get((wordNum - 1).toString()) + " " + this.IM_map.get(wordNum.toString()) + " " + this.IM_map.get((wordNum + 1).toString())))
        // [ ] this works, but IM_map has no punctuation -- would be better coming from a source with more formatting
    }

    // make svg to display text

}