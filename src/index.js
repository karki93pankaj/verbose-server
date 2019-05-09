require('dotenv').config()
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import createApolloServer from './createApolloServer'
import jwt from 'jsonwebtoken'

const PORT = 4400

const server = createApolloServer()

const corsOptions = {
  credentials: true,
  origin: 'http://localhost:3003',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

app.use((req, res, next) => {
  const { token } = req.cookies

  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET)
    //put the userId onto the req for future requests to access
    req.userId = userId
  }
  next()
})

server.applyMiddleware({
  app,
  cors: corsOptions,
  path: '/',
})

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT} in ${process.env.NODE_ENV} mode`)
})
