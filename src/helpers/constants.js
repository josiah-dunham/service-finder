const SHOWOUTPUT = false // Will show the output from fetches - not needed, just can be helpful/interesting
const SHOWSTATS = false // Will show the time the fetches took to complete
const FETCHTIMEOUT = 5000 // Timeout in ms to abort a fetch // found some open ports take a very long time to return, and if it doesn't return quickly using the defined endpoint, Drive is not running on that port.
const IGNOREDPORTS = [5005, 5040] // Ports to ignore in fetch requests // If there are any known problem ports, or known open ports that are not Drive and worth skipping since it is irrelevant, they can be added to this array and no fetch request will be made to it.
const PROTOCOL = "http" // http | https - Used to build fetch URLs
const HOST = "127.0.0.1" // Host for URL to fetch
const SERVICE = "metadata" // endpoint to hit/search for

const constants = {
  SHOWOUTPUT,
  SHOWSTATS,
  FETCHTIMEOUT,
  IGNOREDPORTS,
  PROTOCOL,
  HOST,
  SERVICE
}

export default constants
