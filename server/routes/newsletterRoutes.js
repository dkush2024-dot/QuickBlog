import express from "express";
import { subscribeNewsletter, unsubscribeNewsletter, getNewsletterSubscribers, deleteNewsletterSubscriber } from "../controllers/newsletterController.js";
import auth from "../middleware/auth.js";

const newsletterRouter = express.Router();

newsletterRouter.post("/subscribe", subscribeNewsletter);
newsletterRouter.post("/unsubscribe", unsubscribeNewsletter);
newsletterRouter.get("/subscribers", auth, getNewsletterSubscribers);
newsletterRouter.post("/delete-subscriber", auth, deleteNewsletterSubscriber);

export default newsletterRouter;
