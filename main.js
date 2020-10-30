// parcel v 2!
// import { freq } from './freq.js'

// freq();

import * as d3 from "d3";
import IMcsv from "url:./IM.csv";
import IMtxt from "url:./data/invisible_man.txt";
import './style.scss';

d3.dsv(IMtxt, d3.autoType).then(data => {
    console.log("data1", data);
});