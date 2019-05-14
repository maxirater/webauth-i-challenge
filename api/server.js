const express = require("express")
const helmet = require("helmet")
const cors = require("cors")
const session = require("express-session")
const KnexSessionStore = require("connect-session-knex")(session)
// alternatively: const KnexSessionStore = require('connect-session-knex)'
// and then KnexSessionStore(session)

const sessionConfig = {
    name: "monkey", // default is sid, but that would reveal our stack
    secret: "keep it secret, keep is safe!", // to encrypt/decrypt the cookie
    cookie: {
        maxAge: 1000 * 60 * 60, // how long the session is valid for, in milliseconds
        secure: false // used over https only, should be true in production
    },
    httpOnly: true, // cannot access the cookie from JS using document.cookie - security reasons
    // keep this true unless there is a good reason to let JS access the cookie
    resave: false, // keep it false to avoid recreating sessions that have not changed
    saveUninitialized: false, // GDPR laws against setting cookies automatically

    // we add this to configure the way sessions are stored
    store: new KnexSessionStore({
        knex: require("../database/dbConfig.js"), // configured instance of knex
        tablename: "session", // table that will store sessions inside the db, name it anything you want
        sidfieldname: "sid", // column that will hold the session id, name anything you want
        createtable: true, // if table does not exist, it will create it automatically
        clearInterval: 1000 * 60 * 60 // time it takes to check for old sessions and remove them from the database to keep it clean and performant
    })
}

const authRouter = require("../auth/auth-router.js")
const usersRouter = require("../users/users-router.js")

const server = express()

server.use(helmet())
server.use(express.json())
server.use(cors())
server.use(session(sessionConfig))

server.use("/api/auth", authRouter)
server.use("/api/users", usersRouter)

server.get("/", (req, res) => {
    res.send("It's alive!")
})

module.exports = server
