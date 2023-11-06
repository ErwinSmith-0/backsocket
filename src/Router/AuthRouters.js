import { Router, application } from "express";
import AuthController from "../Controller/AuthController.js";
export let AuthRouters = Router();

AuthRouters.route("/createprofile").post(AuthController.createProfile);
AuthRouters.route("/getall").get(AuthController.getall);
AuthRouters.route("/room").post(AuthController.room);
AuthRouters.route("/getsenderreceiver").post(AuthController.getsenderreceiver);
