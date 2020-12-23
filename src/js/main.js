import Freq from "./freq.js"
import Text from "./text.js"
import Context from "./context.js"
import Topics from "./topics.js"
import Explainer from "./explainer.js"
import * as d3 from "d3";

export default class App {
    constructor(newWord, wordNum) {
        this.newWord = newWord
        this.wordNum = wordNum
        this.dispatch = d3.dispatch("statechange", "wordNum", "containerChange", "topicArray", "scroll", "newWordtoTopic");
    }

    init() {
        this.text = new Text(this.dispatch)
        this.freq = new Freq(this.dispatch)
        this.context = new Context(this.dispatch)
        this.topics = new Topics(this.dispatch)
        this.explainer = new Explainer(this.dispatch)
    }
}

new App().init();
