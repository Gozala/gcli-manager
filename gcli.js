"use strict";

let { Cu, Cc, Ci } = require("chrome");

let { getMostRecentBrowserWindow } = require("sdk/window/utils");
let { getActiveTab } = require("sdk/tabs/utils")
let { defer } = require("sdk/core/promise")
let { require: devquire } = Cu.import("resource://gre/modules/devtools/Require.jsm", {})
let { CommandUtils } = Cu.import("resource:///modules/devtools/DeveloperToolbar.jsm", {})
let { mix } = require("sdk/core/heritage")
let { when: unload } = require("sdk/system/unload")


let gcli = devquire("gcli/index")
let canon = devquire("gcli/canon")
let { Requisition } = devquire("gcli/cli")

let { meta } = require("./analyzer")

let getActiveContentWindow = window =>
    getActiveTab(window).linkedBrowser.contentWindow

// Example of use:
// run({ command: "tilt toggle", args: {} })
let run = command => {
  let chromeWindow = command.chromeWindow || getMostRecentBrowserWindow()
  console.log(chromeWindow)
  console.log(chromeWindow.gBrowser)
  console.log(getActiveTab(chromeWindow))
  let contentWindow = command.contentWindow ||
                      getActiveContentWindow(chromeWindow)

  let environment = CommandUtils.createEnvironment(chromeWindow.document,
                                                   contentWindow.document)

  let requisition = new Requisition(environment)
  let output = requisition.exec(command)

  return output.promise.then(function() {
    return output.data
  }, function() {
    throw Error(output.data);
  })
}
exports.run = run


// Takes hash and returns array of key value pairs.
let pairs = hash => Object.keys(hash).map(key => [key, hash[key]])


// Makes a GCLI command from a given `name` and `f` function.
let makeCommand = (name, command) => mix({ name: name }, command, {
  exec: (input, env) => {
    let params = command.params.map(({name}) => input[name]);
    return command.exec.apply(env, params);
  }
});

let isObject = value => value && typeof(value) === "object"
let expandCommandGroup = (name, group) => {
  let commands = pairs(group).
                 filter(([_, value]) => isObject(value)).
                 map(([subname, value]) =>
                   expandCommand(name + " " + subname, value)).
                 reduce((left, right) => left.concat(right), [])

  return [{ name: name,
            description: group.description || "Command group"
          }].concat(commands)
}

let isGroup = command => !command.exec
let expandCommand = (name, command) =>
    isGroup(command) ? expandCommandGroup(name, command)
                     : [makeCommand(name, command)]


let expandCommands = commands =>
  pairs(commands).
  reduce((commands, [name, command]) =>
    commands.concat(expandCommand(name, command)),
    []);
exports.expandCommands = expandCommands

let installed = []

// Takes hash of commands and registers each one.
let register = commands => {
  let expanded = expandCommands(commands)
  installed = installed.concat(expanded)
  expanded.forEach(gcli.addCommand)
}
exports.register = register

// Uninstall commands installed.
unload(() => installed.forEach(gcli.removeCommand))
