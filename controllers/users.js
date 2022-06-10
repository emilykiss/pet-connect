const express = require("express")
const router = express.Router()
const db = require("../models")
const cryptoJS = require("crypto-js")
const bcrypt = require("bcryptjs")
const { default: axios } = require("axios")
const accessToken = require("../test.js")
//Get /users/new - renders a form to add new users
router.get("/new", (req, res) => {
  res.render("users/new.ejs", { msg: null })
})

//post /users - creates a new user and redirects to index
router.post("/users", async (req, res) => {
  try {
    //try catch to create the user
    //TODO: hash password
    const hashedPassword = bcrypt.hashSync(req.body.password, 12)
    const [user, created] = await db.user.findOrCreate({
      where: { email: req.body.email },
      defaults: { password: hashedPassword },
    })
    // if the user is new, log them in by giving them a cookie and redirect to the homepage(in the future this could redirect to profile etc.)
    if (created) {
      //res.cookie('cookie name', cookie data)
      //TODO: encrypt ID
      const encryptedId = cryptoJS.AES.encrypt(
        user.id.toString(),
        process.env.ENC_KEY
      ).toString()
      res.cookie("userId", encryptedId)
      res.redirect("/pets")
    } else {
      // if the user was not created, re-render the login form with a message
      res.render("users/new.ejs", {
        msg: "The email exists in the database already... Sus.",
      })
    }
  } catch (err) {
    console.log(err)
  }
})

// GET /users/login -- renders a login form
router.get("/login", (req, res) => {
  res.render("users/login.ejs", { msg: null })
})
// POST /users/login -- authenticates user credentials against the database
router.post("/login", async (req, res) => {
  try {
    // if the user is not found, display the login form and give them a message. Otherwise check the db
    const foundUser = await db.user.findOne({
      where: { email: req.body.email },
    })
    const msg = "Your email is not recognized, try again..."
    if (!foundUser) {
      console.log("email not found")
      res.render("users/login.ejs", { msg })
      return // do not continue with the function
    }

    //if they match, give the user a cookie
    const compare = bcrypt.compareSync(req.body.password, foundUser.password)
    if (compare) {
      const encryptedId = cryptoJS.AES.encrypt(
        foundUser.id.toString(),
        process.env.ENC_KEY
      ).toString()
      res.cookie("userId", encryptedId)
      //To direct to profile instead of main page
      res.redirect("/pets")
    } else {
      res.render("users/login.ejs", { msg })
    }
  } catch (error) {
    console.log(error)
  }
})

// This is where the user is logged out.
router.get("/logout", (req, res) => {
  res.clearCookie("userId")
  res.redirect("/users/login")
})

// This is the get route for the logged in user.
// The bio rendered on this page only belongs to the user that is currently logged in.
router.get("/profile", async (req, res) => {
  try {
    if (!res.locals.user) {
      res.render("users/login.ejs", { msg: "Please log in to continue" })
      return
    }
    const comments = await db.comment.findAll({
      where: {
        userId: res.locals.user.dataValues.id,
      },
    })
    res.render("users/profile.ejs", { comments, users: res.locals.user })
  } catch (error) {
    console.log(error)
  }
})

// This is where the user can post their bio.
// The  users comments are stored in the comments database.
router.post("/profile", async (req, res) => {
  if (!res.locals.user) {
    res.render("users/login", { msg: "log in" })
    return
  }
  // This is where the bio is created.
  await db.comment.create({
    content: req.body.content,
    userId: req.body.userId,
  })
  // Finally, we are brought back to the user's profile with their updated information.
  res.redirect("/users/profile")
})

// GET route for the user's bio.
router.get("/:id", async (req, res) => {
   try {
     if (!res.locals.user) {
       res.render("users/login.ejs", { msg: "Please log in to continue" })
       return
     }
     const userComment = await db.comment.findByPk(req.params.id)

     if (res.locals.user.dataValues.id !== userComment.userId) {
       res.redirect("/users/profile")
       return
     }

     // Here is where we are locating the user's specific information.
     const comment = await db.comment.findOne({
       where: {
         id: req.params.id,
       },
     })
     res.render("users/editcomment", { comment })
   } catch (error) {
     console.log(error)
   }
})

// This route allows the logged in user to update their information.
router.put("/:id", async (req, res) => {
  //   if (res.locals.user === res.locals.user.dataValues.id)
  try {
    if (!res.locals.user) {
      res.render("users/login.ejs", { msg: "Please log in to continue" })
      return
    }
      // This is where the comment is updated.
      const comment = await db.comment.update(
        {
          content: req.body.edit,
        },
        {
          where: {
            id: req.params.id,
            userId: req.body.userId,
          },
        }
      )
      // Finally, we are not redirected back to the profile with the updated information.
      res.redirect("/users/profile")
  } catch (error) {
    console.log(error)
  }
})

module.exports = router
