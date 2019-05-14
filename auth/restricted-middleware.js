module.exports = (req, res, next) => {
    // if the client is logged in, req.session.user will be set
    if (req.session && req.session.user) {
        next()
    } else {
        res.status(401).json({ message: "Nope, not allowed" })
    }
}
