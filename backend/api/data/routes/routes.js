const express = require("express");
const { readdirSync } = require("fs");
const path = require("path");
const authController = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

const Projects = require("../models/Project");
const Tags = require("../models/Tag");
const ProjectTags = require("../models/ProjectTag");
const Users = require("../models/User");

const cors = require("cors");
const router = express.Router();

const app = express();
app.use(cors());

router.post("/login", authController.login);

router.get("/protected", verifyToken, (req, res) => {
   res.json({ message: "Protected route", userId: req.userId });
});

router.get("/", async (req, res) => {
   try {
      const project = await Projects.findAll({
         attributes: ["id", "name", "description", "background"],
      });

      res.json({ project });
   } catch (error) {
      console.error("Failed to fetch data: ", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

router.get("/login", async (req, res) => {
   try {
      const user = await Users.findAll({
         attributes: ["id", "username"],
      });

      res.json({ user });
   } catch (error) {
      console.error("Failed to fetch data: ", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

router.get("/projects", async (req, res) => {
   try {
      const proj = await Projects.findAll({
         attributes: ["name"],
      });

      const dirPath = "./assets/projects/casestudies";

      let projectPath = [];
      for (const project of proj) {
         const name = project.name.toLowerCase().replace(/\s/g, "");
         const newPath = path.join(dirPath, name);
         projectPath.push(newPath);
      }

      let projectFiles = [];
      for (const dir of projectPath) {
         projectFiles.push(readdirSync(dir));
      }

      let caseStudies = {};
      for (let i = 0; i < projectPath.length; i++) {
         caseStudies = { name: projectPath, files: projectFiles };
      }

      res.json({caseStudies});
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
      const tagToDelete = tagId.map((tag) => tag.tagId);

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
      const { name, description, background, tags } = req.body;

      const newProject = await Projects.create({
         name,
         description,
         background,
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
