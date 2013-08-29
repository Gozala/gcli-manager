({
  echo: {
    description: "Prints back given text",
    params: [
      { name: "text", type: "string" }
    ],
    exec: (name) => {
      return name
    }
  }
})
