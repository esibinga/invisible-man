// interactive lexical dispersion chart

import { text, csv, autoType } from 'd3';

export function freq() {

    /** CONSTANTS AND GLOBALS */


    /** APPLICATION STATE */


    /** DATA */
    csv("../data/IM.csv", autoType).then(function (text) {
        console.log(text);
    });
    // init();
    /** INIT FUNCTION */


    /** DRAW FUNCTION */


}