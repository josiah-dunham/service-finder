import fetch from "node-fetch"
import AbortController from "abort-controller"

import { logger, spacer, done } from "../helpers/helpers"
import constants from "../helpers/constants"
import { json } from "express"

export const api = () => {
  // Used to abort a fetch request
  const controller = new AbortController()
  const signal = controller.signal

  // Builds the url to fetch
  const getFetchURL = port =>
    `${constants.PROTOCOL}://${constants.HOST}:${port}/${constants.SERVICE}`

  // Gets a fetch promise to add to array of promises to fetch all async
  const getFetchOne = async port => {
    // signal is the option sent to be able to abort the fetch if it is taking too long
    return fetch(getFetchURL(port), {
      signal
    })
      .then(async resp => {
        return {
            driveInfo: await resp.json(),
            port
          }
      }) // All we care about is the port on a successful ping - simply return the port number found
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
      if (constants.IGNOREDPORTS.find(ig => ig == p) == undefined) {
        allPortFetches.push(getFetchOne(p))
      }
    }

    return allPortFetches
  }

  // Fetches all urls async
  const fetchPorts = async (portFetches, timer) => {
    try {
      const settledPromises = await Promise.allSettled(portFetches)

      if (constants.SHOWOUTPUT) {
        logger(settledPromises)
        spacer()
      }

      const fulfilled = settledPromises.filter(p => p.status == "fulfilled") // Filtering out any rejections
      const port = fulfilled.length ? fulfilled[0].value.port : -1 // Should only be 1 fetch fulfilled, so correct port is the first element in the filtered ports array
      const driveInfo = port == -1 ? {} : fulfilled[0].value.driveInfo
      clearTimeout(timer) // Stops the timeout if the promises were settled before end of timer
      return {
        driveInfo,
        driveStatus: {
          port,
          isRunning: port == -1 ? false : true
        }
      }
    } catch (err) {
      logger("error!")
      logger(err)
    }
  }

  const findPWDrive = async (startPort = 5000, endPort = 5100) => {
    const allPortFetches = getAllPortFetches(startPort, endPort)
    logger()
    logger(`Beginning scan on ports ${startPort}-${endPort}`)
    logger("...")

    const fetchTimer = setTimeout(
      () => controller.abort(),
      constants.FETCHTIMEOUT
    ) // Timer that aborts the fetch request if time exceeds defined timeout
    const result = await fetchPorts(allPortFetches, fetchTimer)

    const endMsg = result.driveStatus.isRunning
      ? `ProjectWise Drive is running on localhost:${result.driveStatus.port}.`
      : `ProjectWise Drive is not currently running on localhost between ports ${startPort}-${endPort}.`

    logger({...result})
    logger()
    logger(endMsg)

    spacer()
    constants.SHOWSTATS ? done() : done()
    return {
      driveStatus: result.driveStatus,
      driveInfo: result.driveInfo,
      msg: endMsg
    }
  }

  return {
    findPWDrive
  }
}
