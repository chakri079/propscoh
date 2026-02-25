import { Router } from "express";
import balanceController from "../controllers/balance.controller";

const balanceRoutes = Router();
balanceRoutes.get("/balances/:userId", balanceController.get);

export { balanceRoutes };
