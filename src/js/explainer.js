// explainer

import * as d3 from "d3";
import '../style.scss';

export default class Explainer {
    constructor(dispatch) {
        this.aboutCollapse();
        this.dispatch = dispatch;

    }

    // HTML toggle button

    // annotations & suggestions

    // ABOUT section (actually might do this all CSS)
    aboutCollapse() {
        // document.addEventListener('DOMContentLoaded', function () {
        //     var elems = document.querySelectorAll('.collapsible');
        //      var instances = M.Collapsible.init(elems, options);
        //     console.log("running1")
        // });
        // console.log("running")

        // var coll = document.getElementsByClassName("collapse-header");
        // console.log("coll", coll)
        // var i;

        // for (i = 0; i < coll.length; i++) {
        //     coll[i].addEventListener("click", function () {
        //         this.classList.toggle("active");
        //         var content = this.nextElementSibling;
        //         console.log("next eleemtn sibling", content)
        //         if (content.style.maxHeight) {
        //             content.style.maxHeight = null;
        //         } else {
        //             content.style.maxHeight = content.scrollHeight + "px";
        //         }
        //     });
        // }
        d3.selectAll(`.collapse-header`)
            .on("click", showContent())
            .on("mouseover", console.log('nouse'))

        function showContent() {
            console.log("show me")
            d3.select(".collapse-content")
                .classed("uncollapse", true)
        }
    }
}