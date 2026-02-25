import expenseService from "../services/expense.service";

const expenseController = {
    add: async (req, res, next) => {
        try {
            const expense = await expenseService.create(req.body);
            return res.status(200).json(expense);
        } catch (error) {
            next(error);
        }
    },

    get: async (req, res, next) => {
        try {
            const { id } = req.params;
            const expense = await expenseService.getById(id);
            return res.status(200).json(expense);
        } catch (error) {
            next(error);
        }
    },

    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            const expense = await expenseService.update(id, req.body);
            return res.status(200).json(expense);
        } catch (error) {
            next(error);
        }
    },

    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await expenseService.delete(id);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
};

export default expenseController;
