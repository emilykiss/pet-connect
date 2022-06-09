require('dotenv').config()

// required packages
const express = require('express')
const rowdy = require('rowdy-logger')
const cookieParser = require('cookie-parser')
const db = require('./models')
const cryptoJS = require('crypto-js')
const methodOverride = require('method-override')
// app config
const PORT = process.env.PORT || 3000
const app = express()
app.set('view engine', 'ejs')

// middlewares
const rowdyRes = rowdy.begin(app)
app.use(require('express-ejs-layouts'))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(methodOverride("_method"))
app.use(express.static("public"))
app.use(express.static(__dirname + "/public"))
// DIY middleware
// Happens on every request
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] incoming request: ${req.method} ${req.url}`)
  console.log('request body:', req.body)
  // modify the response to give data to the routes/middleware
  res.locals.myData = 'Hi, i came from a middleware'
  // Tell express that the middleware is done
  next()
})

// auth middleware
app.use(async (req, res, next) => {
  try {
    //if there is a cookie, find the user in the db,
    //and mount the found user on the res.locals so later routes can access the logged in user
    if (req.cookies.userId) {
      const userId = req.cookies.userId;
      const decryptedId = cryptoJS.AES.decrypt(userId, process.env.ENC_KEY).toString(cryptoJS.enc.Utf8)
      const user = await db.user.findByPk(decryptedId, {include:[db.comment]})
      res.locals.user = user;
    } else {
      //the user is explicitly not logged in
      res.locals.user = null;
    }
    //go to the next route/middleware
    next()
  } catch (error) {
    console.log(error)
    next()
  }
})

// routes
app.get('/', (req, res) => {
  console.log(res.locals)
  res.render('index')
})
// Controllers
app.use('/users', require('./controllers/users'))
app.use('/favorites', require('./controllers/favorites'))



// Error handling middlewar - 404 error MUST be at the bottom  of the page
app.use((req, res, next) => {
// Render the error here
res.status(404).render('404.ejs')
})

// 500 error handler
app.use((error, req, res, next) => {
  // Log the error
  console.log(error)
  res.status('500.ejs')
})

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  rowdyRes.print()
})