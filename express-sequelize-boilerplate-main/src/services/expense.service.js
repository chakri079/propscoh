import Expense from "../models/Expense";
import ExpenseMember from "../models/ExpenseMember";
import User from "../models/User";
import { BadRequestError, ValidationError } from "../utils/ApiError";
import * as Yup from "yup";
import sequelizeService from "./sequelize.service";
import sequelize from "sequelize"; // Need for transaction if we exported instance

// Since the boilerplate uses a dynamically imported sequelize connection, we can often rely on models for transactions:
const getTransaction = async () => {
    return User.sequelize.transaction();
};

const expenseService = {
    create: async (data) => {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            value: Yup.number().positive().required(),
            currency: Yup.string().required(),
            date: Yup.date().required(),
            created_by: Yup.string().uuid().required(),
            members: Yup.array().of(Yup.string().uuid()).min(1).required()
        });

        if (!(await schema.isValid(data))) throw new ValidationError("Invalid expense data");

        const { name, value, currency, date, created_by, members } = data;

        // Check duplicates in members
        const uniqueMembers = [...new Set(members)];
        if (uniqueMembers.length !== members.length) {
            throw new BadRequestError("Duplicate users in members array");
        }

        // Ensure created_by exists
        const creator = await User.findByPk(created_by);
        if (!creator) throw new BadRequestError("Creator not found");

        // Ensure all members exist
        const usersCount = await User.count({ where: { id: uniqueMembers } });
        if (usersCount !== uniqueMembers.length) {
            throw new BadRequestError("One or more members not found");
        }

        const t = await getTransaction();

        try {
            const expense = await Expense.create({
                name,
                value,
                currency,
                date,
                created_by
            }, { transaction: t });

            const amountToOwe = value / uniqueMembers.length;

            const expenseMembersData = uniqueMembers
                .filter(userId => userId !== created_by) // creator doesn't owe themselves
                .map(userId => ({
                    expense_id: expense.id,
                    user_id: userId,
                    amount_owed: amountToOwe
                }));

            if (expenseMembersData.length > 0) {
                await ExpenseMember.bulkCreate(expenseMembersData, { transaction: t });
            }

            await t.commit();

            return expenseService.getById(expense.id);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },

    getById: async (id) => {
        const expense = await Expense.findByPk(id, {
            include: [
                { model: User, as: 'creator', attributes: ['id', 'email'] },
                { model: ExpenseMember, as: 'members', attributes: ['user_id', 'amount_owed'] }
            ]
        });
        if (!expense) throw new BadRequestError("Expense not found");
        return expense;
    },

    update: async (id, data) => {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            value: Yup.number().positive().required(),
            currency: Yup.string().required(),
            date: Yup.date().required(),
            created_by: Yup.string().uuid().required(),
            members: Yup.array().of(Yup.string().uuid()).min(1).required()
        });

        if (!(await schema.isValid(data))) throw new ValidationError("Invalid expense data");

        const expense = await Expense.findByPk(id);
        if (!expense) throw new BadRequestError("Expense not found");

        const { name, value, currency, date, created_by, members } = data;

        // Validations
        const uniqueMembers = [...new Set(members)];
        if (uniqueMembers.length !== members.length) throw new BadRequestError("Duplicate users in members array");

        const creator = await User.findByPk(created_by);
        if (!creator) throw new BadRequestError("Creator not found");

        const usersCount = await User.count({ where: { id: uniqueMembers } });
        if (usersCount !== uniqueMembers.length) throw new BadRequestError("One or more members not found");


        const t = await getTransaction();

        try {
            // Update expense details
            await expense.update({ name, value, currency, date, created_by }, { transaction: t });

            // Wipe existing members
            await ExpenseMember.destroy({ where: { expense_id: id }, transaction: t });

            // Re-create members
            const amountToOwe = value / uniqueMembers.length;

            const expenseMembersData = uniqueMembers
                .filter(userId => userId !== created_by)
                .map(userId => ({
                    expense_id: expense.id,
                    user_id: userId,
                    amount_owed: amountToOwe
                }));

            if (expenseMembersData.length > 0) {
                await ExpenseMember.bulkCreate(expenseMembersData, { transaction: t });
            }

            await t.commit();
            return expenseService.getById(expense.id);
        } catch (error) {
            await t.rollback();
            throw error;
        }
    },

    delete: async (id) => {
        const expense = await Expense.findByPk(id);
        if (!expense) throw new BadRequestError("Expense not found");

        const t = await getTransaction();
        try {
            await ExpenseMember.destroy({ where: { expense_id: id }, transaction: t });
            await expense.destroy({ transaction: t });
            await t.commit();
            return { msg: "Expense deleted" };
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
};

export default expenseService;
