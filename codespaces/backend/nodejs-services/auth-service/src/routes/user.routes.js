import { Router } from "express";
import { logIn,logOut} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { consumeQueue,publishMessage } from "../config/RabbitMQ.js";
const router = Router();

let i=0;

router.route("/login").post(logIn);
router.route("/logout").post(verifyJWT,logOut);
router.route("/fet").get(async(req, res) => {  
    const respo =consumeQueue("password-change-queue",(msg)=>{console.log(msg)});  
    return res.json(respo);
});
router.route("/publish").get(async(req, res) => {  
    const respo =  publishMessage("event-bus","password-change", `Hello World ${i++}`);
    return res.json(respo);
});
export default router;