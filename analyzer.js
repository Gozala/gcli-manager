"use strict";

let { Cu } = require("chrome");
let { Reflect } = Cu.import("resource://gre/modules/reflect.jsm", {});

function parseMetadata(fn) {
  var ast = Reflect.parse("!" + fn)
  var node = ast.body[0].expression.argument
  var names = node.params.map(node => node.name)

  var types = node.body.body.filter(function(node) {
    return node.type === "LabeledStatement" &&
    			 (node.body.type === "ExpressionStatement" ||
            node.body.type === "LabeledStatement")
  }).map(function(node) {
    return node.body.type === "ExpressionStatement" ?
      {form: "input",
       type: node.label.name,
       name: node.body.expression.name} :
    	{form: "output",
       type: node.label.name,
       name: node.body.label.name}
  }).reduce(function(types, node) {
    if (node.form === "input")
      types[node.name] = node.type
    else
      types["return"] = node
    return types
  }, {})

  var input = names.map(function(name) {
    return {name: name, type: types[name]}
  })

  return {
    input: input,
    output: types.return || { name: output }
  }
}
exports.parseMetadata = parseMetadata

let meta = f => f.metadata || parseMetadata(f)
exports.meta = meta
