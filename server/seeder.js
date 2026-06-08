import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectDB } from "./database/db.js";
import { User } from "./models/User.js";
import { Courses } from "./models/Courses.js";
import { Lecture } from "./models/Lecture.js";

dotenv.config();

const PLACEHOLDER_IMAGE = "uploads/placeholder.svg";
const DEFAULT_INSTRUCTOR_PASSWORD = "instructor123";

const dataset = [
  {
    title: "React for Beginners",
    description:
      "Learn the fundamentals of React including components, props, and hooks.",
    category: "Web Development",
    createdBy: "Instructor 1",
    lectures: [
      {
        title: "Introduction to React",
        video: "https://www.youtube.com/embed/Ke90Tje7VS0",
      },
      {
        title: "Setting up React App",
        video: "https://www.youtube.com/embed/w7ejDZ8SWv8",
      },
      {
        title: "Components in React",
        video: "https://www.youtube.com/embed/Y2hgEGPzTZY",
      },
      {
        title: "Props and State",
        video: "https://www.youtube.com/embed/IYvD9oBCuJI",
      },
      {
        title: "React Hooks",
        video: "https://www.youtube.com/embed/f687hBjwFcM",
      },
    ],
  },
  {
    title: "JavaScript Fundamentals",
    description:
      "Master the basics of JavaScript from variables to asynchronous programming.",
    category: "Programming",
    createdBy: "Instructor 2",
    lectures: [
      {
        title: "JavaScript Introduction",
        video: "https://www.youtube.com/embed/W6NZfCO5SIk",
      },
      {
        title: "Variables and Data Types",
        video: "https://www.youtube.com/embed/Bv_5Zv5c-Ts",
      },
      {
        title: "Functions",
        video: "https://www.youtube.com/embed/PoRJizFvM7s",
      },
      {
        title: "Arrays and Objects",
        video: "https://www.youtube.com/embed/R8rmfD9Y5-c",
      },
      {
        title: "Async JavaScript",
        video: "https://www.youtube.com/embed/PoRJizFvM7s",
      },
    ],
  },
  {
    title: "Node.js API Development",
    description: "Build RESTful APIs using Node.js, Express, and MongoDB.",
    category: "Backend",
    createdBy: "Instructor 1",
    lectures: [
      {
        title: "Introduction to Node.js",
        video: "https://www.youtube.com/embed/TlB_eWDSMt4",
      },
      {
        title: "Express Basics",
        video: "https://www.youtube.com/embed/L72fhGm1tfE",
      },
      {
        title: "Routing and Middleware",
        video: "https://www.youtube.com/embed/pKd0Rpw7O48",
      },
      {
        title: "MongoDB Integration",
        video: "https://www.youtube.com/embed/ExcRbA7fy_A",
      },
      {
        title: "Building REST APIs",
        video: "https://www.youtube.com/embed/vjf774RKrLc",
      },
    ],
  },
  {
    title: "HTML & CSS Mastery",
    description:
      "Learn how to build beautiful and responsive websites using HTML and CSS.",
    category: "Web Design",
    createdBy: "Instructor 3",
    lectures: [
      {
        title: "HTML Basics",
        video: "https://www.youtube.com/embed/pQN-pnXPaVg",
      },
      {
        title: "CSS Fundamentals",
        video: "https://www.youtube.com/embed/yfoY53QXEnI",
      },
      { title: "Flexbox", video: "https://www.youtube.com/embed/JJSoEo8JSnc" },
      {
        title: "Grid Layout",
        video: "https://www.youtube.com/embed/jV8B24rSN5o",
      },
      {
        title: "Responsive Design",
        video: "https://www.youtube.com/embed/srvUrASNj0s",
      },
    ],
  },
  {
    title: "MongoDB for Beginners",
    description:
      "Understand MongoDB and how to use it in real-world applications.",
    category: "Database",
    createdBy: "Instructor 2",
    lectures: [
      {
        title: "MongoDB Introduction",
        video: "https://www.youtube.com/embed/-56x56UppqQ",
      },
      {
        title: "CRUD Operations",
        video: "https://www.youtube.com/embed/ofme2o29ngU",
      },
      {
        title: "Mongoose Basics",
        video: "https://www.youtube.com/embed/DZBGEVgL2eE",
      },
      {
        title: "Schema Design",
        video: "https://www.youtube.com/embed/9yS0XgRPvN8",
      },
      {
        title: "Aggregation",
        video: "https://www.youtube.com/embed/Y7cH5bLJtP0",
      },
    ],
  },

  {
    title: "Advanced React Patterns",
    description:
      "Learn advanced React concepts like context, performance optimization, and custom hooks.",
    category: "Web Development",
    createdBy: "Instructor 1",
    lectures: [
      {
        title: "React Context API",
        video: "https://www.youtube.com/embed/35lXWvCuM8o",
      },
      {
        title: "Custom Hooks",
        video: "https://www.youtube.com/embed/6ThXsUwLWvc",
      },
      {
        title: "useReducer Hook",
        video: "https://www.youtube.com/embed/kK_Wqx3RnHk",
      },
      {
        title: "Performance Optimization",
        video: "https://www.youtube.com/embed/0ZJgIjIuY7U",
      },
      {
        title: "Code Splitting",
        video: "https://www.youtube.com/embed/2U3QJYvX4bE",
      },
    ],
  },
  {
    title: "Fullstack MERN Bootcamp",
    description:
      "Build fullstack applications using MongoDB, Express, React, and Node.",
    category: "Fullstack",
    createdBy: "Instructor 2",
    lectures: [
      {
        title: "MERN Stack Overview",
        video: "https://www.youtube.com/embed/7CqJlxBYj-M",
      },
      {
        title: "Backend Setup",
        video: "https://www.youtube.com/embed/Oe421EPjeBE",
      },
      {
        title: "Frontend Setup",
        video: "https://www.youtube.com/embed/bMknfKXIFA8",
      },
      {
        title: "Connecting Frontend & Backend",
        video: "https://www.youtube.com/embed/4UZrsTqkcW4",
      },
      {
        title: "Deploying MERN App",
        video: "https://www.youtube.com/embed/71wSzpLyW9k",
      },
    ],
  },
  {
    title: "Git & GitHub Mastery",
    description:
      "Learn version control using Git and collaborate using GitHub.",
    category: "Tools",
    createdBy: "Instructor 3",
    lectures: [
      {
        title: "Introduction to Git",
        video: "https://www.youtube.com/embed/8JJ101D3knE",
      },
      {
        title: "Git Commands Basics",
        video: "https://www.youtube.com/embed/SWYqp7iY_Tc",
      },
      {
        title: "Branching and Merging",
        video: "https://www.youtube.com/embed/JTE2Fn_sCZs",
      },
      {
        title: "Working with GitHub",
        video: "https://www.youtube.com/embed/RGOj5yH7evk",
      },
      {
        title: "Pull Requests",
        video: "https://www.youtube.com/embed/yk2H3f_t3aI",
      },
    ],
  },
  {
    title: "TypeScript for Beginners",
    description:
      "Learn TypeScript and how to use it with modern JavaScript projects.",
    category: "Programming",
    createdBy: "Instructor 2",
    lectures: [
      {
        title: "What is TypeScript?",
        video: "https://www.youtube.com/embed/BwuLxPH8IDs",
      },
      {
        title: "Types and Interfaces",
        video: "https://www.youtube.com/embed/ahCwqrYpIuM",
      },
      {
        title: "Functions in TypeScript",
        video: "https://www.youtube.com/embed/8pKjULHzs0s",
      },
      {
        title: "Generics",
        video: "https://www.youtube.com/embed/6hXnS7rE2mE",
      },
      {
        title: "TypeScript with React",
        video: "https://www.youtube.com/embed/Z5iWr6Srsj8",
      },
    ],
  },
  {
    title: "UI/UX Design Fundamentals",
    description:
      "Understand the basics of UI/UX design and create user-friendly interfaces.",
    category: "Design",
    createdBy: "Instructor 3",
    lectures: [
      {
        title: "What is UI/UX?",
        video: "https://www.youtube.com/embed/3YzXbIX8H3Q",
      },
      {
        title: "Design Principles",
        video: "https://www.youtube.com/embed/3iV1aYp8pMI",
      },
      {
        title: "Color Theory",
        video: "https://www.youtube.com/embed/1d2kGdX0K1A",
      },
      {
        title: "Typography",
        video: "https://www.youtube.com/embed/sByzHoiYFX0",
      },
      {
        title: "Wireframing",
        video: "https://www.youtube.com/embed/qpH7-KFWZRI",
      },
    ],
  },
];

// find an existing instructor by name, or create one
const findOrCreateInstructor = async (name) => {
  const email = `${name.toLowerCase().replace(/\s+/g, "")}@elearning.com`;

  let instructor = await User.findOne({ email });

  if (!instructor) {
    const password = await bcrypt.hash(DEFAULT_INSTRUCTOR_PASSWORD, 10);
    instructor = await User.create({
      name,
      email,
      password,
      role: "instructor",
    });
    console.log(`  + Created instructor: ${name} (${email})`);
  } else {
    console.log(`  = Instructor already exists: ${name} (${email})`);
  }

  return instructor;
};

const seed = async () => {
  await connectDB();

  console.log("\nSeeding courses...\n");

  for (const item of dataset) {
    const instructor = await findOrCreateInstructor(item.createdBy);

    // idempotent: skip a course that already exists (by title)
    const existing = await Courses.findOne({ title: item.title });
    if (existing) {
      console.log(`  ~ Skipped (already exists): ${item.title}\n`);
      continue;
    }

    const course = await Courses.create({
      title: item.title,
      description: item.description,
      category: item.category,
      createdBy: item.createdBy,
      instructor: instructor._id,
      image: PLACEHOLDER_IMAGE,
      price: "0",
      duration: item.lectures.length,
    });

    await Lecture.insertMany(
      item.lectures.map((lecture) => ({
        title: lecture.title,
        description: `${item.title} — ${lecture.title}`,
        video: lecture.video,
        course: course._id,
      })),
    );

    console.log(
      `  + Created course: ${item.title} (${item.lectures.length} lectures)\n`,
    );
  }

  console.log("Done.\n");
  console.log("Instructor login (all three):");
  console.log(`  password: ${DEFAULT_INSTRUCTOR_PASSWORD}\n`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(async (error) => {
  console.error("Seeding failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
