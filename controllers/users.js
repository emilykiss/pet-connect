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
            "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJZbFNlMllCT3JwWkVVNmV6RnFIa2dzbXlVb3ZraWM3VjBWZjBZWTczQnVkYk1JSk93YSIsImp0aSI6IjdlZWFiOTcwZTBhM2M4ODk4YzMyMjQ1OGRiZmI1OTEzMmVlYzViYWE0MTliNTRmYTVhZDM5N2FmNTZiMmRkZWFlZTMzNDk1NTMyYTZiNzNhIiwiaWF0IjoxNjU0MDI5NjkwLCJuYmYiOjE2NTQwMjk2OTAsImV4cCI6MTY1NDAzMzI5MCwic3ViIjoiIiwic2NvcGVzIjpbXX0.rKkeJEf0djQtk5S3GoEuzgjhqORhNjCX_LhY8Bww3gYWCnqGBkrYRUyhE-yW89n3oOrFNmf4wC9kMpfzrsY51LhB50j1E_hnfP7oWJDKjhKDBOesWsPAqkM3LiR2MKaQb2XaneN8RTCQiG58ccqHjiTTMQ4coF9AW2ywQCevonNqunJUJX8iOqztCbRIXpk7pFi6r0WDo-gfHNzAjyOXW5McoS6RN5lxjr2OA8oi9EZe4Rqg7FxemLS0vkL0OTMvuwfceNNZSKW_4-oV_emnS05-YJoNYSETz3Qn06qUsLNFaH9l9EZcyEMrjjeQICsEPiQ7LWHEOKZ-2Jpr68baHQ",
        },
      });
      const animals = await response.data.animals
      res.render('users/pet.ejs', {animals, user: res.locals.user})
    } catch (error) {
        console.log(error)
    }
})

router.get("/favorites", async (req, res) => {
  const favorites = await db.favorite.findAll()
  res.render("users/favorites.ejs", {animals:favorites})
  // if rec.user.id === current user, do this
})
router.post('/favorites', async (req, res) => {
    // const favorites =  await db.fave.findAll()
    await db.favorite.create({
      name: req.body.name,
      age: req.body.age
    })
    res.redirect("users/favorites.ejs")
    // if rec.user.id === current user, do this 
})
// router.get('/favorites', async (req, res)=> {
//     try {
//          const url = "https://api.petfinder.com/v2/animals"
//          const response = await axios({
//            method: "get",
//            url: url,
//            headers: {
//              Authorization:
//                "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJZbFNlMllCT3JwWkVVNmV6RnFIa2dzbXlVb3ZraWM3VjBWZjBZWTczQnVkYk1JSk93YSIsImp0aSI6ImE2MzJkNzI0N2Q5YmJlMDRkNWEwY2RmYzQzMzQ4MTJlMDQ1NTFkNTlhYzA2NDg3MTE1OTU5NmQ2MjE2MTBkZDEzNmQ1MjRiZjI3YzBjZGI1IiwiaWF0IjoxNjU0MDI0MDg3LCJuYmYiOjE2NTQwMjQwODcsImV4cCI6MTY1NDAyNzY4Nywic3ViIjoiIiwic2NvcGVzIjpbXX0.kLabvHArOjPCJKYh9iAHkBicNOLsc7dMmcYzuZYyDYYQfT2b_yqBA39ynilBpXxriKuCI7UW--Cg3P3X8I2rv3PZIiQxvjQDaVzvuiFB63KjoJ3_UAygqXAsWD56LGVciV8k-ZaD7ls1LVQVgpGh2sePlJsCxU_Q2jlU0cWYCla0R6YzPVnkQnFB47L_lyBufpp3KCuwQz7Zwh8xoKeO_3_ZkZP5GPtSUdqwJITn37YSgcd-H3iIbyDtFp-NM6si84GfpZGrwHfrjOhL-EBgowA9mlZcy-DDTGntkWRS18JWZVmSOiXXVERpWEQyt3IIp7wWDb1HJNFGtLPOZYHgKA",
//            },
//          });
//         const animals = await response.data.animals
//         res.render('users/favorites.ejs', {animals, user: res.locals.user})
//     } catch (error) {
//         console.log(error)
//     }
// })




module.exports = router

