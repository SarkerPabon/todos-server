const { MongoClient } = require("mongodb");

let dbConnection;

module.exports = {
	connectDB: (cb) => {
		MongoClient.connect(
			`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@todos-heros.dukfu.mongodb.net/todos?retryWrites=true&w=majority`
		)
			.then((client) => {
				dbConnection = client.db();
				return cb();
			})
			.catch((error) => {
				console.log(error);
				return cb(error);
			});
	},
	getDb: () => dbConnection,
};
