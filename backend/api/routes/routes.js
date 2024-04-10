const express = require("express");
const { readdirSync } = require("fs");
const path = require("path");
const { verifyToken } = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");

const Projects = require("../models/Project");
const Tags = require("../models/Tag");
const ProjectTags = require("../models/ProjectTag");

const cors = require("cors");
const router = express.Router();

const app = express();
app.use(cors());

router.get("/", async (req, res) => {
   try {
      const project = await Projects.findAll({
         attributes: [
            "id",
            "name",
            "description",
            "background",
            "is_archived",
            "client",
            "industry",
            "year",
         ],
      });

      res.json({ project });
   } catch (error) {
      console.error("Failed to fetch data: ", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

router.get("/protected", verifyToken, (req, res) => {
   res.json({ message: "Hello admin!" });
});

router.post("/login", authController.login);

router.get("/images/:folder/:name", (req, res) => {
   try {
      const folder = req.params.folder;
      const name = req.params.name;
      const folderPath = path.join(
         __dirname,
         "..",
         "..",
         "assets",
         folder,
         name
      );

      const files = readdirSync(folderPath);
      res.json(files);
   } catch (error) {
      console.error("Failed to fetch tags: ", error);
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
      const {
         name,
         description,
         background,
         tags,
         is_archived,
         client,
         industry,
         year,
      } = req.body;

      const newProject = await Projects.create({
         name,
         description,
         background,
         is_archived,
         client,
         industry,
         year,
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
      console.log(newProject);
      res.status(201).json({ newProject });
   } catch (error) {
      console.error("Failed to create project: ", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

router.put("/:projectId", async (req, res) => {
   try {
      const {
         name,
         description,
         background,
         tags,
         is_archived,
         client,
         industry,
         year,
      } = req.body;
      
      const existingProject = await Projects.findOne({
         where: { id: req.params.projectId },
      });
      if (!existingProject) {
         return res.status(401).json({ error: "Project not found." });
      }

      const updatedFields = {
         name: name,
         description: description,
         background: background,
         is_archived: is_archived,
         client: client,
         industry: industry,
         year: year,
      };

      await existingProject.update(updatedFields);

      await Promise.all(
         tags.map(async (tagName) => {
            let tag = await Tags.findOne({ where: { name: tagName } });
            if (!tag) {
               tag = await Tags.create({ name: tagName });
            }
            await ProjectTags.findOrCreate({
               where: {
                  projectId: existingProject.id,
                  tagId: tag.id,
               },
            });
         })
      );

      res.status(201).json({ updatedProject: existingProject });
   } catch (error) {
      console.error("Failed to update project: ", error);
      res.status(500).json({ error: "Internal Server Error" });
   }
});

module.exports = router;
