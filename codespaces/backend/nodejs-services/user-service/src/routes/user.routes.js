import { Router } from "express";
import { registerUserController,changePasswordController,changeEmailController,updateEmailController,updateUsernameController } from "../controllers/user.controllers.js";
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
router.route("/change-email").put(verifyJWT, changeEmailController);
router.route("/update-email/:token").put(updateEmailController);
router.route("/update-username").put(verifyJWT, updateUsernameController);
export default router;
