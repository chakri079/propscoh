import balanceService from "../services/balance.service";

const balanceController = {
    get: async (req, res, next) => {
        try {
            const { userId } = req.params;
            const balances = await balanceService.getBalances(userId);
            return res.status(200).json(balances);
        } catch (error) {
            next(error);
        }
    }
};

export default balanceController;
