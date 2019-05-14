const router = require("express").Router()
const bcrypt = require("bcryptjs")

const Users = require("../users/users-model.js")

// for endpoints beginning with /api/auth
router.post("/register", (req, res) => {
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

router.post("/login", (req, res) => {
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

router.get("/logout", (req, res) => {
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

module.exports = router
