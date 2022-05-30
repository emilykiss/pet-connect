const express = require('express')
const router = express.Router()
const db = require('../models')
const cryptoJS = require('crypto-js')
const bcrypt = require('bcryptjs')
//Get /users/new - renders a form to add new users
router.get('/new',  (req, res) => {
    res.render('users/new.ejs', {msg: null})
})


//post /users - creates a new user and redirects to index
router.post('/', async (req, res) => {
    try {
        //try catch to create the user
        //TODO: hash password
        const hashedPassword = bcrypt.hashSync(req.body.password, 12)
        const [user, created] = await db.user.findOrCreate({
            where: {email: req.body.email },
            defaults: {password: req.body.password}
        })
        // if the user is new, log them in by giving them a cookie and redirect to the homepage(in the future this could redirect to profile etc.)
        if (created) {
            //res.cookie('cookie name', cookie data)
            //TODO: encrypt ID 
            const encryptedId = cryptoJS.AES.encrypt(user.id.toString(), process.env.ENC_KEY).toString()
            res.cookie('userId', encryptedId)
            res.redirect('users/profile')
        }else{
            // if the user was not created, re-render the login form with a message
            console.log('That email already exists')
            res.render('users/new.ejs', {msg: 'The email exists in the database already...'})
        }

    } catch (err) {
        console.log(err)
    }
})

// GET /users/login -- renders a login form
router.get('/login', (req, res) => {
    res.render('users/login.ejs', { msg: null })
})
// POST /users/login -- authenticates user credentials against the database
router.post('/login', async (req, res) => {
    try {
        // if the user is not found, display the login form and give them a message. Otherwise check the db
        const foundUser = await db.user.findOne({
            where: { email: req.body.email }
        })
        const msg = 'You are not authenticated.'
        if (!foundUser) {
            console.log('email not found')
            res.render('users/login.ejs', {msg})
            return // do not continue with the function
        }

    
        //if they match, give the user a cookie 
        const compare = bcrypt.compareSync(req.body.password, foundUser.password)
        if (compare) {
            const encryptedId = cryptoJS.AES.encrypt(foundUser.id.toString(),process.env.ENC_KEY).toString();
            res.cookie("userId", encryptedId)
            //Tedirect to profile instead of main page
            res.redirect('user/profile')
        } else {
            res.render('users/login.ejs', {msg})
        }

    } catch (error) {
        console.log(error)
    }
})
// GET /users/logout -- clear the coookie to log the user out
router.get('/logout', (req, res) => {
    res.render("users/logout.ejs", { msg: null })
})

router.post('/logout',  (req, res) => {
    try {
        const logout =  () => {
            window.localStorage.clear()
            window.location.reload(true)
            window.location.replace('/')
            
        }
    } catch (error) {
        console.log(error)
    }
})

router.get('/profile', (req, res) => {
    //check if user is authorized
    if(!res.locals.user) {
        // if the user is not authorized, ask them to log in
        res.render('users/login.ejs', { msg: 'Please log in to continue'})
        return // end the route here
    }
    res.render('users/profile', { user: res.locals.user })
})

module.exports = router

