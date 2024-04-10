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
      allowNull: false,
   },
   background: {
      type: DataTypes.TEXT,
      allowNull: false,
   },
   client: {
      type: DataTypes.TEXT(255),
      allowNull: false,
   },
   industry: {
      type: DataTypes.STRING(255),
      allowNull: false,
   },
   year: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   is_archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
   },
});

module.exports = Project;
