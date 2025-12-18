require("dotenv").config();
const { Sequelize } = require("sequelize");

// Use DATABASE_URL if provided, otherwise build local connection string
const DATABASE_URL = process.env.DATABASE_URL;

console.log("📌 Using Database URL:", DATABASE_URL);

// Create Sequelize instance
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",

  // SSL only in production (Render)
  dialectOptions:
    process.env.NODE_ENV === "production"
      ? {
          ssl: { require: true, rejectUnauthorized: false },
        }
      : {},

  logging: process.env.NODE_ENV === "development" ? console.log : false,
});

// Connect to DB
async function connectDatabase() {
  try {
    console.log("🔗 Connecting to PostgreSQL...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // No auto-alter to avoid view/column conflicts
    await sequelize.sync();
    console.log("✅ Models synchronized");

    return sequelize;
  } catch (err) {
    console.error("❌ DB Connection failed:", err.message);

    console.log("⏳ Retrying in 5 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return connectDatabase();
  }
}

// Close DB connection
async function closeDatabase() {
  try {
    await sequelize.close();
    console.log("🔌 Database connection closed");
  } catch (err) {
    console.error("❌ Error closing DB:", err.message);
  }
}

module.exports = { sequelize, connectDatabase, closeDatabase };
