require('dotenv/config');

module.exports = {
  dialect: process.env.DB_DIALECT || 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  storage: process.env.DB_DIALECT === 'sqlite' ? process.env.DB_NAME : null, // for SQLite
  define: {
    timestamps: true,
    underscored: true
  },
};

