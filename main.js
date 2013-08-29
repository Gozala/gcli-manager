"use strict";

let { Ci } = require("chrome")
let { run, register } = require("./gcli")
let { open } = require("./scratchpad")
let { Widget } = require("sdk/widget")
let { data } = require("sdk/self")
let { Loader } = require("sdk/test/loader")
let { evaluate } = require("toolkit/loader")

let widget = Widget({
  id: "mozilla-icon",
  label: "My Mozilla Widget",
  contentURL: "http://www.mozilla.org/favicon.ico",
  onClick: () => run({ command: "tilt toggle", args: {} })
});

let startCommandEditor = () => {
  let window = open({
    text: data.load("./template.js")
  })

  let loader = null
  window.addEventListener("blur", ({target}) => {
    if (target instanceof Ci.nsIDOMWindow) {
      let code = window.Scratchpad.getText()
      if (loader) loader.unload()

      loader = Loader(module)
      let { register } = loader.require("./gcli")
      loader.require("./command")
      let sandbox = loader.sandbox("./command")
      let commands = evaluate(sandbox, "scratchpad", {
        source: code
      })
      register(commands)
    }
  }, true)
}

register({
  command: {
    description: "Command manager",
    create: {
      description: "Write new commands",
      params: [],
      exec: startCommandEditor
    }
  },
  greet: {
    description: "group of greeting commands",
    me: {
      please: {
        description: "Greet",
        params: [{name: "name", type: "string"}],
        exec: name => "Hello my dear " + name
      }
    },
    both: {
      description: "Greets you",
      params: [{name: "firstname", type: "string"},
               {name: "lastname", type: "string"}],
      exec: (firstname, lastname) => {
        return "Hello " + firstname + " " + lastname
      }
    },
    name: {
      description: "greet by name",
      params: [{name: "name", type: "string"}],
      exec: (name) => "Bye " + name
    },
    html: {
      description: "greet html",
      returnType: "html",
      params: [{name: "name", type: "string"}],
      exec: name => "<h1>" + name + "</h1>"
    }
  }
});
