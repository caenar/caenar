const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Tag = sequelize.define("tags", {
  id: {
     type: DataTypes.INTEGER,
     autoIncrement: true,
     primaryKey: true,
  },
  name: {
     type: DataTypes.STRING(255),
     unique: true,
     allowNull: false,
  },
});

module.exports = Tag;