import { Router } from "express";
import { registerUserController,changePasswordController } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validateRegistration,validateChangePassword } from "../middlewares/validators.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  validateRegistration,
  registerUserController,
);
router.route("/change-password").put(verifyJWT,validateChangePassword, changePasswordController);
export default router;
