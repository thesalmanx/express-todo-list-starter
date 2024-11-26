const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");

const port = 3030;

app.use(express.static("public")); // Serve static files from a 'public' directory
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Load user data from the JSON file
let userData = [];
try {
  const data = fs.readFileSync("public/users.json", "utf-8");
  userData = JSON.parse(data);
} catch (err) {
  console.error(err);
}

// Load user to-do lists from the JSON file
let todoLists = {};
try {
  const data = fs.readFileSync("public/todolists.json", "utf-8");
  todoLists = JSON.parse(data);
} catch (err) {
  console.error(err);
}

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/profile", (req, res) => {
  res.sendFile(__dirname + "/public/profile.html");
});

app.get("/todolist/:username", (req, res) => {
  const username = req.params.username;
  const items = loadTodoList(username);
  res.json({ items });
});

app.post("/todolist/:username", (req, res) => {
  const username = req.params.username;
  const newItem = req.body.item;
  const items = loadTodoList(username);
  items.push(newItem);
  saveTodoList(username, items);
  res.sendStatus(200);
});

app.post("/submitlogin", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Find the user by username
  const user = userData.find((user) => user.username === username);

  if (user && user.password === password) {
    // If the user exists and the password matches, log in
    console.log(`Login: Username - ${username}`);

    // Send the user to the profile page with their username as a query parameter
    res.redirect(`/profile?username=${username}`);
  } else {
    // If the user does not exist or the password is incorrect, show an error message
    res.send("Incorrect username or password");
  }
});

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});

app.post("/submitsignup", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if the username already exists
  const existingUser = userData.find((user) => user.username === username);

  if (existingUser) {
    // If the username already exists, show an error message
    res.send("Username already exists. Please choose a different username.");
  } else {
    // Add the new user data to the array
    userData.push({ username, password });

    // Initialize an empty to-do list for the new user
    todoLists[username] = [];

    // Write the updated data back to the JSON files
    fs.writeFile(
      "public/users.json",
      JSON.stringify(userData, null, 2),
      (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error saving data");
        } else {
          console.log(`SignUp: Username - ${username}, Password - ${password}`);
          // Save the to-do lists as well
          saveTodoLists();
          res.send("Data saved successfully");
        }
      }
    );
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Function to load user to-do list items
function loadTodoList(username) {
  return todoLists[username] || [];
}

// Function to save user to-do list items
function saveTodoList(username, items) {
  todoLists[username] = items;
  saveTodoLists();
}

// Function to save all user to-do lists to the JSON file
function saveTodoLists() {
  fs.writeFile(
    "public/todolists.json",
    JSON.stringify(todoLists, null, 2),
    (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("To-do lists saved successfully");
      }
    }
  );
}
