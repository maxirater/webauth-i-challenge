const express = require("express")
const helmet = require("helmet")
const cors = require("cors")
const bcrypt = require("bcryptjs")

const Users = require("./users/users-model.js")

const server = express()

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
        knex: require("./database/dbConfig.js"), // configured instance of knex
        tablename: "session", // table that will store sessions inside the db, name it anything you want
        sidfieldname: "sid", // column that will hold the session id, name anything you want
        createtable: true, // if table does not exist, it will create it automatically
        clearInterval: 1000 * 60 * 60 // time it takes to check for old sessions and remove them from the database to keep it clean and performant
    })
}

server.use(helmet())
server.use(express.json())
server.use(cors())
server.use(session(sessionConfig));

server.get("/", (req, res) => {
    res.send("It's alive!")
})

// for endpoints beginning with /api/auth
server.post("/api/register", (req, res) => {
    let user = req.body
    const hash = bcrypt.hashSync(user.password, 10) // 2 ^ n
    user.password = hash

    Users.add(user)
        .then(saved => {
            res.status(201).json(saved)
        })
        .catch(error => {
            res.status(500).json(error)
        })
})

server.post("/api/login", (req, res) => {
    let { username, password } = req.body

    Users.findBy({ username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                // req.session is an object added by the session middleware
                // we can store information inside req.session
                // req.session is available on every request done by the same client
                // as long as the user session has not expired
                req.session.user = user
                res.status(200).json({
                    // the cookie will be sent automatically by the library
                    message: `Welcome ${user.username}!`
                })
            } else {
                res.status(401).json({ message: "Invalid Credentials" })
            }
        })
        .catch(error => {
            res.status(500).json(error)
        })
})


server.get("/api/logout", (req, res) => {
    if (req.session) {
        // the library exposes the destroy method that will remove the session for the client
        req.session.destroy(err => {
            if (err) {
                res.send(
                    "you can checkout any time you like, but you can never leave...."
                )
            } else {
                res.send("bye")
            }
        })
    } else {
        // if there is no session, just end the request or send a response
        // here, just end the reqeust for example
        res.end()
    }
})

server.get("/api/users", restricted, (req, res) => {
    Users.find()
        .then(users => {
            res.json(users)
        })
        .catch(err => res.send(err))
})

function restricted(req, res, next) {
    // if the client is logged in, req.session.user will be set
    if (req.session && req.session.user) {
        next()
    } else {
        res.status(401).json({ message: "Nope, not allowed" })
    }
}



const port = process.env.PORT || 5000
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`))
