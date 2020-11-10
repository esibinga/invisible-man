import { freq } from './freq.js'
import { text } from './text.js'

freq();
text();

/*
import * as d3 from "d3";
import '../style.scss';

const IMtxt = require('url:../../data/invisible_man.txt');

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

    const IM_map = xah_obj_to_map(IMobj)

    const wordRollup = d3.rollup((cells), v => v.length, d => d)

    console.log("IM text", data)
    console.log("IM map", IM_map);
    console.log("IM unique word map", wordRollup)
});
*/
