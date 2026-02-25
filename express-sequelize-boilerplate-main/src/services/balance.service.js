import Expense from "../models/Expense";
import ExpenseMember from "../models/ExpenseMember";
import User from "../models/User";
import { BadRequestError } from "../utils/ApiError";

const balanceService = {
    getBalances: async (userId) => {
        // Ensure the user exists
        const user = await User.findByPk(userId);
        if (!user) throw new BadRequestError("User not found");

        const balancesMap = new Map(); // other_user_id -> net_balance

        // 1. Where current user is the creator (Others owe currentUser)
        const createdExpenses = await Expense.findAll({
            where: { created_by: userId },
            include: [{
                model: ExpenseMember,
                as: 'members'
            }]
        });

        createdExpenses.forEach(expense => {
            expense.members.forEach(member => {
                if (member.user_id !== userId) {
                    const currentBal = balancesMap.get(member.user_id) || 0;
                    balancesMap.set(member.user_id, currentBal + member.amount_owed);
                }
            });
        });

        // 2. Where current user is a member (currentUser owes Others)
        const involvedExpenses = await ExpenseMember.findAll({
            where: { user_id: userId },
            include: [{
                model: Expense,
                as: 'expense'
            }]
        });

        involvedExpenses.forEach(memberRecord => {
            const creatorId = memberRecord.expense.created_by;
            if (creatorId !== userId) {
                const currentBal = balancesMap.get(creatorId) || 0;
                balancesMap.set(creatorId, currentBal - memberRecord.amount_owed);
            }
        });

        // Format the response and filter out zero balances
        const balances = [];
        for (const [otherUserId, netBalance] of balancesMap.entries()) {
            // Small epsilon to account for floating point errors
            if (Math.abs(netBalance) > 0.01) {
                balances.push({
                    user_id: otherUserId,
                    net_balance: netBalance
                });
            }
        }

        return { balances };
    }
};

export default balanceService;
