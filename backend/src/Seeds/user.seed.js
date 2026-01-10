import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { connectDB } from "../core/db.js";
import User from "../Models/user.model.js";

config();

const hashedPassword = bcrypt.hashSync("test1234", 10);

const seedUsers = [
  {
    email: "ali.demo@example.com",
    fullName: "Ali Raza",
    password: hashedPassword,
    profilePic: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    email: "ahmed.sample@example.com",
    fullName: "Ahmed Khan",
    password: hashedPassword,
    profilePic: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    email: "hamza.test@example.com",
    fullName: "Hamza Malik",
    password: hashedPassword,
    profilePic: "https://randomuser.me/api/portraits/men/13.jpg",
  },
  {
    email: "umar.demo@example.com",
    fullName: "Umar Farooq",
    password: hashedPassword,
    profilePic: "https://randomuser.me/api/portraits/men/14.jpg",
  },
  {
    email: "maryam.demo@example.com",
    fullName: "Maryam Ali",
    password: hashedPassword,
    profilePic: "https://randomuser.me/api/portraits/women/11.jpg",
  },
  {
    email: "ayesha.sample@example.com",
    fullName: "Ayesha Siddiqui",
    password: hashedPassword,
    profilePic: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    email: "fatima.test@example.com",
    fullName: "Fatima Noor",
    password: hashedPassword,
    profilePic: "https://randomuser.me/api/portraits/women/13.jpg",
  },
  {
    email: "hira.demo@example.com",
    fullName: "Hira Qureshi",
    password: hashedPassword,
    profilePic: "https://randomuser.me/api/portraits/women/14.jpg",
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await User.insertMany(seedUsers);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();
