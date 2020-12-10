import Freq from './freq.js'
import Text from './text.js'
import Context from './context.js'
import Topics from './topics.js'
import Explainer from './explainer.js'
import * as d3 from "d3";

export default class App {
    constructor(newWord, wordNum) {
        this.newWord = newWord
        this.wordNum = wordNum
        this.dispatch = d3.dispatch("statechange", "wordNum", "containerChange", "topicArray");
    }

    init() {
        this.text = new Text(this.dispatch)
        this.freq = new Freq(this.dispatch)
        this.context = new Context(this.dispatch)
        this.topics = new Topics(this.dispatch)
        this.explainer = new Explainer(this.dispatch)
        //console.log("working!")
    }

}

new App().init();

// updateText function to update when state/ word changes
// using a class will give text and freq a draw() method to call from outside 
// d3 event dispatch library (can telegraph dispatch/catch events)