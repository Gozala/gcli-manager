"use strict";


const { indexedDB } = require("sdk/indexed-db")
const { defer } = require("sdk/core/promise")

let DB_STORE = "commands"
let DB_NAME = "commands"

let promise = (request) => {
  let { resolve, reject, promise } = defer()
  request.onsuccess = ({result}) resolve(result)
  request.onerror = (event) reject(event.target.errorCode)
  return promise
}

let getDB = () => promise(indexedDB.open("commands"))

let upgrade = (db) => {
  let commandStore = db.createObjectStore("command", { keyPath: "uri" });

}

let open = () => {
  let request = indexedDB.open("commands")
  request.onupgradeneeded = (event) => upgrade(event.target.result)
}

let list = () => {
  let store = getObjectStore(DB_STORE, "readonly")
  store.openCursor().then(cursor => {
    let entry = store.get(cursor.key)
    promise(entry).then(({}))

  })
}
