const express = require('express')
const userRouter = require('./routers/userRouter')
const routesRouter = require('./routers/routesRouter')
const ratingRouter = require('./routers/ratingRouter')
require('./db/mongoose')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(routesRouter)
app.use(ratingRouter)

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})