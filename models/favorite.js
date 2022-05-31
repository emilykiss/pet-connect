'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class favorite extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.favorite.belongsToMany(models.user, {through: "pet_user"})
      models.favorite.hasMany(models.pet)
    }
  }
  favorite.init({
    action: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    petId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'favorite',
  });
  return favorite;
};