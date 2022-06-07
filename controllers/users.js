const express = require('express')
const router = express.Router()
const db = require('../models')
const cryptoJS = require('crypto-js')
const bcrypt = require('bcryptjs')
const { default: axios } = require('axios')
const { append } = require('express/lib/response')
const accessToken = require('../test.js')
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
            defaults: {password: hashedPassword}
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
            res.render('users/new.ejs', {msg: 'The email exists in the database already... Sus.'})
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
        const msg = 'Your email is not recognized, try again...'
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
            res.redirect('/users/pet')
        } else {
            res.render('users/login.ejs', {msg})
        }

    } catch (error) {
        console.log(error)
    }
})

// This is where the user is logged out.
router.get('/logout',  (req, res) => {
   res.clearCookie("userId")
   res.redirect('/users/login')

})

router.get('/pet', async (req, res) => {
     try {
         // This function was created in the test.js file. It automates access to the API.
         const header = await accessToken()
      //This checks if the user is authorized.
      if (!res.locals.user) {
        // If the user is not authorized, ask them to log in.
        res.render("users/login.ejs", { msg: "Your new best friend is waiting for you. Log in to connect:" });
        return; // end the route here
      }
      // Images for the main page.
      const url = "https://api.petfinder.com/v2/animals";
      const response = await axios({
        method: "get",
        url: url,
        headers: {
          Authorization:
            header,
        },
      });
      const animals = await response.data.animals
      console.log(animals)
      res.render('users/pet.ejs', {animals, user: res.locals.user})
    } catch (error) {
        console.log(error)
    }
})

// This is the favorites GET route (the data request).
router.get("/favorites", async (req, res) => {
    const user = await db.user.findOne({
      where: {
        id: res.locals.user.dataValues.id
      }, include: [db.pet]
    })
    const favorites = await user.pets
    // brings you to the favorites page
    res.render("users/favorites.ejs", {allFavorites:favorites})
})

// This route allows the logged in user to add to their favorites page.
router.post('/favorites', async (req, res) => {
    if (!res.locals.user) {
      res.render("users/login", { msg: "log in" });
      return
    }
    // Here, the logged in user can add a pet to their favorites page.
    try {
        const user = await db.user.findByPk(res.locals.user.dataValues.id)
        console.log(req.body.photos)
        const [pet, createdPet] = await db.pet.findOrCreate({
            where: {
                name: req.body.name
            }, defaults: {
                age: req.body.age,
                url: req.body.photos 
            }
        })
        await user.addPet(pet)
        const allFavorites = await user.getPets()
        // console.log(allFavorites[0], "!!!!!?????????????????????!!!!!!")
        // The pet has been added and you  are taken back to favorites.
        res.render("users/favorites", {allFavorites})
    } catch (error) {
        console.log(error)
    }
})

// This is the delete route, where a user can delete a pet from their favorites.
router.delete('/favorites', async (req, res) => {
    console.log(req.body.id)
    // We are finding the pet from the database with its specific id.
    try {
        const instance = await db.pet.findOne({
        where: {
            id: req.body.id
        }
    })
    // Here, the destroyig is happening.
    await instance.destroy()
    //  The user is redirecte to the favorites page, and the deleted pet is no longer  there.
    res.redirect('/users/favorites')
  } catch (err) {
    console.log(err)
  }
})

// This is the get route for the logged in user. 
// The bio rendered on this page only belongs to the user that is currently logged in.
router.get('/profile', async (req, res) => {
    try {
        if (!res.locals.user) {
          res.render("users/login.ejs", { msg: "Please log in to continue" })
          return
        }
        const comments = await db.comment.findAll({
            where: {
                userId: res.locals.user.dataValues.id
            }
        })
        res.render('users/profile.ejs', {comments, users:res.locals.user})
    } catch (error) {
        console.log(error)
    }
})

// This is where the user can post their bio. 
// The  users comments are stored in the comments database.
router.post('/profile', async (req, res) => {
    if (!res.locals.user) {
      res.render("users/login", { msg: "log in" });
      return;
    }
// This is where the bio is created.
    await db.comment.create({
      content: req.body.content,
      userId: req.body.userId
    })
// Finally, we are brought back to the user's profile with their updated information.
    res.redirect('/users/profile')
})

// GET route for the user's bio.
router.get('/editprofile/:id', async (req, res) => {
    if (!res.locals.user) {
      res.render("users/login.ejs", { msg: "Please log in to continue" })
      return
    }
    try {
// Here is where we are locating the user's specific information.
        const comment = await db.comment.findOne({
          where: {
            id: req.params.id
          },
        })
        res.render('users/editprofile', {comment})
    } catch (error) {
        console.log(error)
    }
})

// This route allows the logged in user to update their information.
router.put('/editprofile/:id', async (req, res) => {
try {
    if (!res.locals.user) {
      res.render("users/login.ejs", { msg: "Please log in to continue" });
      return;
    }
// This is where the comment is updated.
    const comment = await db.comment.update({
       content: req.body.edit
      }, {
        where: {
           id: req.params.id
      }
    })
// Finally, we are not redirected back to the profile with the updated information.
    res.redirect("/users/profile")
} catch (error) {
    console.log(error)
}
})


module.exports = router

