import { Router } from "express";
import { logIn, logOut } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const router = Router();

router.route("/login").post(logIn);
router.route("/logout").post(verifyJWT, logOut);
router.route("/verify-token").post(verifyJWT, (req, res) => {
  return res.json(
    new ApiResponse(
      200,
      {
        user: req.user,
      },
      "Token is valid",
    ),
  );
});
export default router;
