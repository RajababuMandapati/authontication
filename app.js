const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();

const dbPath = path.join(__dirname, "userData.db");

let database = null;

const initilizeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initilizeDbAndServer();

// post user API
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);

  const selectUserQuery = `
    SELECT *
    FROM user
    WHERE username = '${username}';`;
  const dbUser = await database.get(selectUserQuery);

  if (dbUser === undefined) {
    if (request.body.password.length() < 5) {
      response.status(400);
      response.send("password is to short");
    } else {
      const postUserQuery = `
    INSERT INTO 
        user (username, name, password, gender, location) 
      VALUES 
        (
          '${username}', 
          '${name}',
          '${hashedPassword}', 
          '${gender}',
          '${location}'
        )`;
      await database.run(postUserQuery);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("user already exists");
  }
});
