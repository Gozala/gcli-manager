/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";


module.metadata = {
  "stability": "experimental"
};

let { Cu } = require("chrome");
let { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});
let self = require("sdk/self");
let l10n = require("sdk/l10n");
let { when: unload } = require("sdk/system/unload");
let { emit } = require("sdk/event/core");

function True() true
function structureClone() JSON.parse(JSON.stringify(data))

function registerTool(options) {
  let window = null
  function send(data) {
    if (window) {
      window.document.createElement("CustomEvent");
      event.initCustomEvent("response", false, true, structureClone(data));
    }
  }

  gDevTools.registerTool({
    id: options.id + self.id,
    icon: self.data.url(options.icon),
    url: self.data.url(options.url),
    label: l10n.get(options.label),
    tooltip: l10n.get(options.tooltip),
    isTargetSupported: options.isTargetSupported || True,
    beforeBuild: function(iframeWindow, toolbox) {
      if (options.onRequest) {
        iframeWindow.addEventListener("request", function(event) {
          event.stopPropagation();
          event.preventDefault();
          console.log(Object.getOwnPropertyNames(event))
          options.onRequest(event.detail);
        }, true)
      }
    },
    build: function(iframeWindow, toolbox) {
      // Pretend that we can intercept earlier
      this.beforeBuild(iframeWindow, toolbox)
    }
  });
  unload(function() unregisterTool(options.id));
}
exports.registerTool = registerTool;


function unregisterTool(id) {
  gDevTools.unregisterTool(id + self.id);
}
exports.unregisterTool = unregisterTool;
