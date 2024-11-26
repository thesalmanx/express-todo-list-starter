const addButton = document.getElementById("add-btn");
const itemsInput = document.getElementById("items");
const list = document.getElementById("list");
const heading = document.getElementById("heading");

// Get the username from the query parameter in the URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const username = urlParams.get("username");

if (username) {
  heading.innerHTML = `Welcome to ShaperBook ${username}`;
  loadTodoList(username);
}

addButton.addEventListener("click", addItem);

function addItem() {
  const newItemText = itemsInput.value;
  if (newItemText.trim() !== "") {
    const newLi = document.createElement("li");
    newLi.textContent = newItemText;
    list.appendChild(newLi);
    itemsInput.value = "";

    // Save the new item to the server
    saveTodoListItem(username, newItemText);
  }
}

function loadTodoList(username) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `/todolist/${username}`);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onload = function () {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      if (data && data.items && data.items.length > 0) {
        data.items.forEach((item) => {
          const newLi = document.createElement("li");
          newLi.textContent = item;
          list.appendChild(newLi);
        });
      }
    }
  };
  xhr.send();
}

// Save a to-do list item to the server
function saveTodoListItem(username, item) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", `/todolist/${username}`);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify({ item }));
}
