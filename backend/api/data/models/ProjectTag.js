const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const ProjectTag = sequelize.define("project_tags", {
  projectId: {
     type: DataTypes.INTEGER,
     allowNull: false,
     primaryKey: true
  },
  tagId: {
     type: DataTypes.INTEGER,
     allowNull: false,
  },
});

module.exports = ProjectTag;