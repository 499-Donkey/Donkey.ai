import express from "express"
import * as ScriptsController from "../controllers/scripts"

const router = express.Router();

router.get("/", ScriptsController.getScripts);

router.get("/:scriptId", ScriptsController.getScript);

router.post("/", ScriptsController.createScript);

router.patch("/:scriptId", ScriptsController.updateScript);

router.delete("/:scriptId", ScriptsController.deleteScript);

export default router;