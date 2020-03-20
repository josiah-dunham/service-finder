import { logger } from '../helpers/helpers'

export const Timer = () => {
  let startTime, endTime
  const start = () => startTime = Date.now()

  const stop = () => endTime = Date.now()

  const getTotalTime = (showSeconds = true) => showSeconds ? (endTime - startTime) / 1000 : endTime - startTime

  const displayTotalTime = () => {
    logger(`Total time elapsed: ${getTotalTime()}s`)
  }
  return {
      start,
      stop,
      getTotalTime,
      displayTotalTime
  }
}
