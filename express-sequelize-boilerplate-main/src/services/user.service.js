import User from "../models/User";
import ExpenseMember from "../models/ExpenseMember";
import Expense from "../models/Expense";
import { BadRequestError, ValidationError } from "../utils/ApiError";
import * as Yup from "yup";

const userService = {
    create: async (data) => {
        const schema = Yup.object().shape({
            email: Yup.string().email().required(),
            password: Yup.string().required().min(6),
        });

        if (!(await schema.isValid(data))) throw new ValidationError("Invalid email or password");

        const { email } = data;

        const userExists = await User.findOne({ where: { email } });
        if (userExists) throw new BadRequestError("User already exists");

        const user = await User.create(data);
        return {
            id: user.id,
            email: user.email,
            default_currency: user.default_currency,
        };
    },

    getProfile: async (id) => {
        const user = await User.findByPk(id, {
            attributes: ["id", "email", "default_currency"],
        });
        if (!user) throw new BadRequestError("User not found");
        return user;
    },

    updateProfile: async (id, data) => {
        const schema = Yup.object().shape({
            email: Yup.string().email(),
            password: Yup.string().min(6),
            default_currency: Yup.string(),
        });

        if (!(await schema.isValid(data))) throw new ValidationError("Invalid data format");

        const user = await User.findByPk(id);
        if (!user) throw new BadRequestError("User not found");

        if (data.email && data.email !== user.email) {
            const emailExists = await User.findOne({ where: { email: data.email } });
            if (emailExists) throw new BadRequestError("Email already in use");
        }

        await user.update(data);

        return {
            id: user.id,
            email: user.email,
            default_currency: user.default_currency,
        };
    },

    deleteAccount: async (id) => {
        const user = await User.findByPk(id);
        if (!user) throw new BadRequestError("User not found");

        // Check if user is involved in any expenses (balances)
        const createdExpenses = await Expense.count({ where: { created_by: id } });
        const involvedExpenses = await ExpenseMember.count({ where: { user_id: id } });

        if (createdExpenses > 0 || involvedExpenses > 0) {
            throw new BadRequestError("Cannot delete account with existing expenses or balances");
        }

        await user.destroy();
        return { msg: "Deleted" };
    },

    getAll: async () => {
        return User.findAll({ attributes: ["id", "email", "default_currency"] });
    }
};

export default userService;
