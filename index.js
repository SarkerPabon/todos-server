const express = require("express");
const cors = require("cors");
require("dotenv").config();
// const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { connectDB, getDb } = require("./db");

const port = process.env.PORT || 5000;
const app = express();

// Database
let db;
connectDB((err) => {
	if (!err) {
		app.listen(port, () => console.log(`Server is running on port ${port}`));

		db = getDb();
	}
});

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Running Server");
});

app.get("/tasks", (req, res) => {
	let tasks = [];

	db.collection("tasks")
		.find()
		.forEach((task) => tasks.push(task))
		.then(() => res.status(200).json(tasks))
		.catch((error) =>
			res.status(500).json({ error: "Could not fetch the documents" })
		);
});
