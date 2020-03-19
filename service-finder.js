const AbortController = require("abort-controller")
const fetch = require("node-fetch")

// Dumb helper functions
const logger = console.log

const spacer = () => {
  logger("--------------------")
}

const done = () => logger("Done.")

// Constants for the app
const SHOWOUTPUT = false // Will show the output from fetches - not needed, just can be helpful/interesting
const SHOWSTATS = true // Will show the time the fetches took to complete
const FETCHTIMEOUT = 5000 // Timeout in ms to abort a fetch // found some open ports take a very long time to return, and if it doesn't return quickly using the defined endpoint, Drive is not running on that port.
const IGNOREDPORTS = [5005, 5040] // Ports to ignore in fetch requests // If there are any known problem ports, or known open ports that are not Drive and worth skipping since it is irrelevant, they can be added to this array and no fetch request will be made to it.
const PROTOCOL = "http" // http | https - Used to build fetch URLs
const HOST = "127.0.0.1" // Host for URL to fetch
const SERVICE = "metadata" | "" // endpoint to hit/search for

// Port range
const STARTPORT = 5000,
  ENDPORT = 5100

// Used to abort a fetch request
const controller = new AbortController()
const signal = controller.signal

// Simple timer functions
let startTime, endTime

const startTimer = () => {
  startTime = Date.now()
}

const stopTimer = () => {
  endTime = Date.now()
}

const displayTotalTime = () => {
  logger(`Total time elapsed: ${(endTime - startTime) / 1000}s`)
}

// Builds the url to fetch
const getFetchURL = port => `${PROTOCOL}://${HOST}:${port}/${SERVICE}`

// Gets a fetch promise to add to array of promises to fetch all async
const getFetchOne = port => {
  // signal is the option sent to be able to abort the fetch if it is taking too long
  return fetch(getFetchURL(port), {
    signal
  })
    .then(() => port) // All we care about is the port on a successful ping - simply return the port number found
    .catch(err => {
      // Custom error handling to handle aborts and other rejections differently
      const fetchError =
        err.name == "AbortError"
          ? `Request timeout: fetch to port ${port} aborted.`
          : `PW Drive not running on port ${port}`
      throw new Error(fetchError)
    })
}

// Builds fetch promise array
const getAllPortFetches = (start, end) => {
  let allPortFetches = []
  for (let p = start; p <= end; p++) {
    if (IGNOREDPORTS.find(ig => ig == p) == undefined) {
      allPortFetches.push(getFetchOne(p))
    }
  }

  return allPortFetches
}

// Fetches all urls async
const fetchPorts = async (portFetches, timer) => {
  try {
    const settledPromises = await Promise.allSettled(portFetches)

    if (SHOWOUTPUT) {
      logger(settledPromises)
      spacer()
    }

    const ports = settledPromises.filter(p => p.status == "fulfilled") // Filtering out any rejections
    const port = ports.length ? ports[0].value : -1 // Should only be 1 fetch fulfilled, so correct port is the first element in the filtered ports array

    const endMsg =
      port == -1
        ? `ProjectWise Drive is not currently running on localhost between ports ${STARTPORT}-${ENDPORT}.`
        : `ProjectWise Drive is running on localhost:${port}`
    logger(endMsg)
    clearTimeout(timer) // Stops the timeout if the promises were settled before end of timer
  } catch (err) {
    logger("error!")
    logger(err)
  }
}

const start = async () => {
  logger()
  startTimer() // Begin timer

  const fetchTimer = setTimeout(() => controller.abort(), FETCHTIMEOUT) // Timer that aborts the fetch request if time exceeds defined timeout

  const allPortFetches = getAllPortFetches(STARTPORT, ENDPORT) // Returns array of fetch promises in port range
  await fetchPorts(allPortFetches, fetchTimer)

  stopTimer() // Stop timer
  spacer()
  SHOWSTATS ? displayTotalTime() : done() // Either displays the time elapsed, or "Done."
}

start()
