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
// GET /users/logout -- clear the coookie to log the user out

router.get('/logout',  (req, res) => {
   res.clearCookie("userId")
   res.redirect('/users/login')

})

router.get('/pet', async (req, res) => {
     try {
         const header = await accessToken()
      //check if user is authorized
      if (!res.locals.user) {
        // if the user is not authorized, ask them to log in
        res.render("users/login.ejs", { msg: "Your new best friend is waiting for you. Log in to connect:" });
        return; // end the route here
      }
      //this is where I am going to upload the images
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
      res.render('users/pet.ejs', {animals, user: res.locals.user})
    } catch (error) {
        console.log(error)
    }
})


router.get("/favorites", async (req, res) => {
  const favorites = await db.pet.findAll()
  res.render("users/favorites.ejs", {allFavorites:favorites})
})

router.post('/favorites', async (req, res) => {
    try {
       
     if(!res.locals.user){
         res.render('users/login', {msg: 'log in'})
         return
     }
        const user = await db.user.findByPk(res.locals.user.dataValues.id)
        const [pet, created] = await db.pet.findOrCreate({
            where: {
                name: req.body.name
            }, defaults: {
                age: req.body.age,
                url: req.body.photos,

            }
        })
        await user.addPet(pet)
        const allFavorites = await db.pet.findAll()
        res.render("users/favorites", {allFavorites})
    } catch (error) {
        console.log(error)
    }
})


router.delete('/favorites', async (req, res) => {
    console.log(req.body.id)
    try {
        const instance = await db.pet.findOne({
        where: {
            id: req.body.id
        }
    })
    console.log(instance)
    await instance.destroy()
    res.redirect('/users/favorites')
  } catch (err) {
    console.log(err)
  }
})

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

router.post('/profile', async (req, res) => {
    await db.comment.create({
      content: req.body.content,
      userId: req.body.userId
    })
    res.redirect('/users/profile')
})

router.get('/editprofile/:id', async (req, res) => {
    
    if (!res.locals.user) {
      res.render("users/login.ejs", { msg: "Please log in to continue" })
      return
    }
    try {
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

router.put('/editprofile/:id', async (req, res) => {
try {
    if (!res.locals.user) {
      res.render("users/login.ejs", { msg: "Please log in to continue" });
      return;
    }
    const comment = await db.comment.update({
       content: req.body.edit
      }, {
        where: {
           id: req.params.id
      }
    })
    res.redirect("/users/profile")
} catch (error) {
    console.log(error)
}
})


module.exports = router

