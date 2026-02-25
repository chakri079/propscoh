import { Router } from "express";
import expenseController from "../controllers/expense.controller";

const expenseRoutes = Router();
expenseRoutes.post("/expenses", expenseController.add);
expenseRoutes.get("/expenses/:id", expenseController.get);
expenseRoutes.put("/expenses/:id", expenseController.update);
expenseRoutes.delete("/expenses/:id", expenseController.delete);

export { expenseRoutes };
