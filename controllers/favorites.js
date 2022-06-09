const express = require("express")
const router = express.Router()
const db = require("../models")

// This is the favorites GET route (the data request).
router.get("/favorites", async (req, res) => {
  const user = await db.user.findOne({
    where: {
      id: res.locals.user.dataValues.id,
    },
    include: [db.pet],
  });
  const favorites = await user.pets;
  // brings you to the favorites page
  res.render("users/favorites.ejs", { allFavorites: favorites });
});


module.exports = router;
