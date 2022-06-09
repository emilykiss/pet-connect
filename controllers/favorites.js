const express = require("express");
const router = express.Router();
const db = require("../models");
const cryptoJS = require("crypto-js");
const bcrypt = require("bcryptjs");
const { default: axios } = require("axios");
const accessToken = require("../test.js");

// This is the favorites GET route (the data request).
router.get("/", async (req, res) => {
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

// This route allows the logged in user to add to their favorites page.
router.post("/", async (req, res) => {
  if (!res.locals.user) {
    res.render("users/login", { msg: "log in" });
    return;
  }
  // Here, the logged in user can add a pet to their favorites page.
  try {
    const user = await db.user.findByPk(res.locals.user.dataValues.id);
    console.log(req.body.photos);
    const [pet, createdPet] = await db.pet.findOrCreate({
      where: {
        name: req.body.name,
      },
      defaults: {
        age: req.body.age,
        url: req.body.photos,
      },
    });
    await user.addPet(pet);
    const allFavorites = await user.getPets();
    // console.log(allFavorites[0], "!!!!!?????????????????????!!!!!!")
    // The pet has been added and you  are taken back to favorites.
    res.render("users/favorites", { allFavorites });
  } catch (error) {
    console.log(error);
  }
});

// This is the delete route, where a user can delete a pet from their favorites.
router.delete("/", async (req, res) => {
  console.log(req.body.id);
  // We are finding the pet from the database with its specific id.
  try {
    const instance = await db.pet.findOne({
      where: {
        id: req.body.id,
      },
    });
    // Here, the destroying is happening.
    await instance.destroy();
    //  The user is redirecte to the favorites page, and the deleted pet is no longer  there.
    res.redirect("/favorites");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
