"use strict";

let { Cu } = require("chrome");
let { ScratchpadManager } = Cu.import("resource:///modules/devtools/scratchpad-manager.jsm", {});


let remove = node => node.parentNode.removeChild(node)

let open = options => {
  let window = ScratchpadManager.openScratchpad({
    text: options && options.text || ""
  })
  window.addEventListener("DOMContentLoaded", ({target}) => {
    if (target !== window.document) return;
    let toolbar = target.querySelector("#sp-toolbar")
    toolbar.innerHTML = ""

    target.querySelector("#sp-environment-menu").hidden = true
    target.querySelector("#sp-execute-menu").hidden = true

    target.documentElement.style = ""
  })
  return window
}
exports.open = open;
