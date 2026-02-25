import Sequelize, { Model } from "sequelize";

class ExpenseMember extends Model {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true,
                },
                expense_id: Sequelize.UUID,
                user_id: Sequelize.UUID,
                amount_owed: Sequelize.FLOAT
            },
            {
                sequelize,
                timestamps: false,
            }
        );

        return this;
    }

    static associate(models) {
        this.belongsTo(models.Expense, { foreignKey: 'expense_id', as: 'expense' });
        this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
}

export default ExpenseMember;
