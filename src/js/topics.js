// imports
import * as d3 from "d3";
import '../style.scss';

// constants / globals


//
export default class Topics {
    constructor(dispatch) {
        // this.loadData();
        this.dispatch = dispatch;
        this.dispatch.on("statechange.topic", this.highlightTopic)
    }

    highlightTopic(newWord) {
        console.log("highlightTopic:", newWord)
        // find the topic in which this word is most prevalent
        // highlight that topic
    }

    // make svg to show dynamic tm chart

}