import Sequelize, { Model } from "sequelize";

class Expense extends Model {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    primaryKey: true,
                },
                name: Sequelize.STRING,
                value: Sequelize.FLOAT,
                currency: Sequelize.STRING,
                date: Sequelize.DATE,
                created_by: Sequelize.UUID
            },
            {
                sequelize,
                timestamps: true,
            }
        );

        return this;
    }

    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
        this.hasMany(models.ExpenseMember, { foreignKey: 'expense_id', as: 'members' });
    }
}

export default Expense;
