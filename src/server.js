import express from "express"
import cors from "cors"
import { api } from './controllers/api'

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Hello!")
})

app.get("/findPWDrive/", async (req, res) => {
  const pwDriveRunningInfo = await api().findPWDrive()

  res.json(pwDriveRunningInfo)
})

app.get("/findPWDrive/:start/:end", async (req, res) => {
  const pwDriveRunningInfo = await api().findPWDrive(req.params.start, req.params.end)

  res.json(pwDriveRunningInfo)
})

let port = 4000
app.listen(port, () => console.log(`Listening on Port ${port}`))