import Sequelize, { Model } from "sequelize";
import bcrypt from "bcryptjs";

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true
          }
        },
        password: Sequelize.VIRTUAL, //When it is VIRTUAL it does not exist in the database
        password_hash: Sequelize.STRING,
        default_currency: {
          type: Sequelize.STRING,
          defaultValue: 'INR'
        }
      },
      {
        sequelize,
        timestamps: true, //If it's false do not add the attributes (updatedAt, createdAt).
        //paranoid: true, //If it's true, it does not allow deleting from the bank, but inserts column deletedAt. Timestamps need be true.
        //underscored: true, //If it's true, does not add camelcase for automatically generated attributes, so if we define updatedAt it will be created as updated_at.
        //freezeTableName: false, //If it's false, it will use the table name in the plural. Ex: Users
        //tableName: 'Users' //Define table name
      }
    );

    this.addHook("beforeSave", async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  static associate(models) {
    this.hasMany(models.Expense, { foreignKey: 'created_by', as: 'created_expenses' });
    this.hasMany(models.ExpenseMember, { foreignKey: 'user_id', as: 'expense_involvements' });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
