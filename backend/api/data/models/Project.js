const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Project = sequelize.define("projects", {
  id: {
     type: DataTypes.INTEGER,
     autoIncrement: true,
     primaryKey: true,
  },
  name: {
     type: DataTypes.STRING(255),
     allowNull: false,
  },
  description: {
     type: DataTypes.TEXT,
  },
});

module.exports = Project;