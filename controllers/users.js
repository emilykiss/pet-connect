const express = require('express')
const router = express.Router()
const db = require('../models')
const cryptoJS = require('crypto-js')
const bcrypt = require('bcryptjs')
const { default: axios } = require('axios')
const { append } = require('express/lib/response')
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
            res.redirect('users/pet')
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
            //To direct to profile instead of main page
            res.redirect('user/pet.ejs')
        } else {
            res.render('users/login.ejs', {msg})
        }

    } catch (error) {
        console.log(error)
    }
})
// GET /users/logout -- clear the coookie to log the user out

router.get('/logout',  (req, res) => {
   res.clearCookie("userId")
   res.redirect('/')

})

router.get('/pet', async (req, res) => {
     try {
      //check if user is authorized
      if (!res.locals.user) {
        // if the user is not authorized, ask them to log in
        res.render("users/login.ejs", { msg: "Please log in to continue" });
        return; // end the route here
      }
      //this is where I am going to upload the images
      const url = "https://api.petfinder.com/v2/animals";
      const response = await axios({
        method: "get",
        url: url,
        headers: {
          Authorization:
            "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJZbFNlMllCT3JwWkVVNmV6RnFIa2dzbXlVb3ZraWM3VjBWZjBZWTczQnVkYk1JSk93YSIsImp0aSI6IjRlYjFkOWQ0MTA0YWNlMDdiNDY1ZDE1YTI0YTYzN2MyZmQ0NjlhZmJmMzJjMWYxMjg4YWY5MWU0ZTQzMmU1NzUwNTEzNzgxN2Y1ZjI1MGRkIiwiaWF0IjoxNjU0MDM3NjMwLCJuYmYiOjE2NTQwMzc2MzAsImV4cCI6MTY1NDA0MTIzMCwic3ViIjoiIiwic2NvcGVzIjpbXX0.yRZxVCxvTrbqrydCwX8QpjHWj9cLSBwFaWi0rpKtOqpOX9MHqnp-If8VhRGpBAJftTyVYtvQbyaSyO_0cg9X5YwX0_FZ4IEsDruae5eeOhOL5eIX4uFdV2SdKOTTZxWzhJZTJxvoF_ysZwlfTxVr9EGyIFq4B5HHHdUXu3D2vizLMw1q6TQfyXBwd0lEYxEHryhMoz5L2g5k3b9l6dflbleyMDWoOlJMecBZlmKM7IPWG3QsDN5ju8NR405YwdgDNMH5p3C5zFWfVjFrEch2GQleXIkehtvU1PvOZ8bgezyCwjlXmvw6IeLIePaj2XqU9XAS4O-8GBrYiogVEYfcPA",
        },
      });
      const animals = await response.data.animals
      res.render('users/pet.ejs', {animals, user: res.locals.user})
    } catch (error) {
        console.log(error)
    }
})


// router.get("/favorites", async (req, res) => {
//     try {
//         let pets = res.locals.user.getPets();
//         console.log(pets);
//         const foundUser = await db.user.findOne({
//           where: { email: req.locals.email }
//         })
//         const favorites = await db.favorite.findAll()
//         if (foundUser === req.locals.email){
//             res.render("users/id.ejs", {animals:favorites})
//         }
     
//     } catch (error) {
//         console.log(error)
//     }
//     //where i want to put specific details about a pet 

// })

router.get("/favorites", async (req, res) => {
  const favorites = await db.favorite.findAll()
  res.render("users/favorites.ejs", {animals:favorites})
})

router.post('/favorites', async (req, res) => {
    try {
     if(!res.locals.user){
         res.render('users/login', {msg: 'log in'})
         return
     }
        const [pet, created] = await db.pet.findOrCreate({
            where: {
                id: req.body.id 
            }
        })
        const user = await db.user.findByPk(res.locals.user.dataValues.id)
        user.addPet(pet)
        res.redirect("users/favorites.ejs"); 
    } catch (error) {
        console.log(error)
    }
})


// router.delete('/favorites/:id', async (req, res) => {
    
// })





module.exports = router

