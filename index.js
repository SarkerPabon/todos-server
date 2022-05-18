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

// Verify JWT
function verifyJWT(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).send({ message: "Unauthorized Access" });
	}

	const token = authHeader.split(" ")[1];

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
		if (err) {
			return res.status(403).send({ message: "Forbidden Access" });
		}

		console.log("Decoded: ", decoded);
		req.decoded = decoded;
	});

	console.log("Inside VerifyJWT: ", authHeader);
	next();
}

app.get("/", (req, res) => {
	res.send("Running Server");
});

// JWT
app.post("/login", (req, res) => {
	const email = req.body;
	console.log("JWT: ", email);

	const maxAge = 3 * 24 * 60 * 60;

	const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: maxAge,
	});
	res.send({ accessToken });
});

app.get("/tasks", verifyJWT, (req, res) => {
	const email = req.query;
	console.log("Email: ", email);

	let tasks = [];

	db.collection("tasks")
		.find(email)
		.forEach((task) => tasks.push(task))
		.then(() => res.status(200).json(tasks))
		.catch((error) =>
			res.status(500).json({ error: "Could not fetch the documents" })
		);
});

app.post("/tasks", (req, res) => {
	const task = req.body;
	console.log("Add Task: ", task);

	db.collection("tasks")
		.insertOne(task)
		.then((result) => res.status(201).json(result))
		.catch((err) =>
			res.status(500).json({ error: "Could not create new document" })
		);
});

app.patch("/tasks/:id", (req, res) => {
	const updates = req.body;
	console.log("Updates: ", updates);
	console.log("Updating Reuest ID: ", req.params.id);

	if (ObjectId.isValid(req.params.id)) {
		db.collection("tasks")
			.updateOne({ _id: ObjectId(req.params.id) }, { $set: updates })
			.then((result) => res.status(200).json(result))
			.catch((err) =>
				res.status(500).json({ error: "Could not update the document" })
			);
	} else {
		res.status(500).json({ error: "Not valid document ID" });
	}
});

app.delete("/tasks/:id", (req, res) => {
	console.log("Delete Request Id: ", req.params.id);
	if (ObjectId.isValid(req.params.id)) {
		db.collection("tasks")
			.deleteOne({ _id: ObjectId(req.params.id) })
			.then((result) => res.status(200).json(result))
			.catch((err) =>
				res.status(500).json({ error: "Could not delete the document" })
			);
	} else {
		res.status(500).json({ error: "Not valid document ID" });
	}
});
