const express = require("express");
const router = express.Router();
const cors = require("cors");

const app = express();
app.use(cors());

const Projects = require("../models/Project");
const Tags = require("../models/Tag");
const ProjectTags = require("../models/ProjectTag");

router.get("/", async (req, res) => {
   try {
      const project = await Projects.findAll({
         attributes: ["id", "name", "description"],
      });

      res.json({ project });
   } catch (error) {
      console.error("Failed to fetch data: ", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

router.get("/projects", async (req, res) => {
   try {
      const project = await Projects.findAll({
         attributes: ["id", "name", "description"],
      });

      res.json({ project });
   } catch (error) {
      console.error("Failed to fetch data: ", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

router.get("/project_tags", async (req, res) => {
   try {
      const projectTags = await ProjectTags.findAll({
         attributes: ["projectId", "tagId"],
      });

      res.json({ projectTags });
   } catch (error) {
      console.error("Failed to fetch tags: ", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

router.get("/tags", async (req, res) => {
   try {
      const tags = await Tags.findAll({
         attributes: ["id", "name"],
      });

      res.json({ tags });
   } catch (error) {
      console.error("Failed to fetch tags: ", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

router.delete("/:projectId", async (req, res) => {
   try {
      const { projectId } = req.params;

      const tagId = await ProjectTags.findAll({
         where: {
            projectId: projectId,
         },
         attributes: ["tagId"],
      });
      const tagToDelete = tagId.map(tag => tag.tagId);
      
      await Tags.destroy({
         where: {
            id: tagToDelete,
         },
      });

      await ProjectTags.destroy({
         where: {
            projectId: projectId,
         },
      });

      await Projects.destroy({
         where: {
            id: projectId,
         },
      });

      res.status(200).json({
         message: "Project deleted successfully",
      });
   } catch (err) {
      console.error("Could not delete project ", err);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

router.post("/", async (req, res) => {
   try {
      const { name, description, tags } = req.body;

      const newProject = await Projects.create({
         name,
         description,
      });

      await Promise.all(
         tags.map(async (tagName) => {
            let tag = await Tags.findOne({ where: { name: tagName } });

            if (!tag) {
               tag = await Tags.create({ name: tagName });
            }

            await ProjectTags.create({
               projectId: newProject.id,
               tagId: tag.id,
            });
         })
      );
      res.status(201).json({ newProject });
   } catch (error) {
      console.error("Failed to create project: ", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

module.exports = router;
