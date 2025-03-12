import express from "express";
import { Container } from "typedi";
import { authenticate } from "../../common/middlewares/auth.middleware";
import { FollowUpController } from "../controllers/followUp.controller";

const followUpRouter = express.Router();
const followUpController = Container.get(FollowUpController);

followUpRouter.post(
  "/",
  authenticate,
  followUpController.createFollowUp.bind(followUpController)
);
followUpRouter.get(
  "/",
  authenticate,
  followUpController.getFollowUps.bind(followUpController)
);
followUpRouter.get(
  "/messages",
  authenticate,
  followUpController.getAllMessages.bind(followUpController)
);
followUpRouter.get(
  "/:followUpId",
  authenticate,
  followUpController.getFollowUpById.bind(followUpController)
);
followUpRouter.patch(
  "/:followUpId/",
  authenticate,
  followUpController.updateFollowUp.bind(followUpController)
);
followUpRouter.get(
  "/generate/:followUpId/",
  authenticate,
  followUpController.generateFollowUpMessage.bind(followUpController)
);
followUpRouter.get(
  "/generate/new/:followUpId/",
  authenticate,
  followUpController.generateNewFollowUpMessage.bind(followUpController)
);

// followUpRouter.delete(
//   "/:followUpId",
//   authenticate,
//   followUpController.deleteFollowUp.bind(followUpController)
// );

export default followUpRouter;
