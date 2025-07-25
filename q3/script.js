const storageKey = "applicants";

const form = document.getElementById("registrationForm");
const message = document.getElementById("message");
const list = document.getElementById("applicantsList");
const filterGenre = document.getElementById("filterGenre");
const filterWing = document.getElementById("filterWing");
const stats = document.getElementById("stats");

if (form !== null) {
  form.addEventListener("submit", handleSubmit);
}

if (filterGenre !== null) {
  filterGenre.addEventListener("input", renderItems);
}
if (filterWing !== null) {
  filterWing.addEventListener("change", renderItems);
}

function handleSubmit(event) {
  event.preventDefault();
  clearMessage();

  const nameInput = document.getElementById("name").value.trim();
  const emailInput = document.getElementById("email").value.trim();
  const wingInput = document.getElementById("wingType").value;
  const genreInput = document.getElementById("genre").value.trim();
  const songInput = document.getElementById("song").value.trim();
  const experienceInput = document.getElementById("experience").value.trim();
  const verifiedInput = document.getElementById("verified").checked;

  const newItem = {
    name: nameInput,
    email: emailInput,
    wing: wingInput,
    genre: genreInput,
    song: songInput,
    experience: experienceInput,
    verified: verifiedInput,
    status: "ממתין לאודישן"
  };

  const errors = validateItem(newItem);
  if (errors.length > 0) {
    showMessage(errors.join(" | "), "error");
    return;
  }

  if (list !== null) {

    renderSingleItem(newItem);
    showMessage("הטופס נשלח בהצלחה!", "success");
    form.reset();
  } else {

    const existingItems = getItems();
    existingItems.push(newItem);
    localStorage.setItem(storageKey, JSON.stringify(existingItems));
    renderItems();
    showMessage("הטופס נשלח בהצלחה!", "success");
    form.reset();
  }
}

function validateItem(item) {
  const errors = [];
  if (item.name === "") {
    errors.push("שדה שם הוא חובה");
  }
  if (item.email === "" || item.email.indexOf("@") === -1) {
    errors.push("יש להזין אימייל תקין");
  }
  if (item.wing === "") {
    errors.push("יש לבחור סוג כנפיים");
  }
  if (parseInt(item.experience) < 0 || parseInt(item.experience) > 50) {
    errors.push("ניסיון חייב להיות בין 0 ל־50");
  }
  return errors;
}

function showMessage(msg, type) {
  if (message !== null) {
    message.textContent = msg;
    message.className = type;
  }
}

function clearMessage() {
  if (message !== null) {
    message.textContent = "";
    message.className = "";
  }
}

function getItems() {
  const stored = localStorage.getItem(storageKey);
  if (stored !== null) {
    return JSON.parse(stored);
  }
  return [];
}

function renderItems() {
  if (list === null) return;

  const allItems = getItems();

  let genreValue = filterGenre ? filterGenre.value.trim() : "";
  let wingValue = filterWing ? filterWing.value : "";

  const filtered = allItems.filter(function (item) {
    const genreMatch = genreValue === "" || item.genre.includes(genreValue);
    const wingMatch = wingValue === "" || item.wing === wingValue;
    return genreMatch && wingMatch;
  });

  list.innerHTML = "";
  filtered.forEach(renderSingleItem);
  updateStats(filtered);
}

function renderSingleItem(item) {
  if (list === null) return;

  const li = document.createElement("li");
  li.innerHTML =
    "<strong>" + item.name + "</strong> - " + item.song + " (" + item.genre + ")<br>" +
    "כנפיים: " + item.wing + " | סטטוס: " + item.status;

  const btns = document.createElement("div");
  btns.className = "status-btns";

  const passBtn = document.createElement("button");
  passBtn.textContent = "עבר אודישן";
  passBtn.onclick = function (event) {
    updateItem(item, "עבר אודישן", event);
  };

  const failBtn = document.createElement("button");
  failBtn.textContent = "לא עבר";
  failBtn.onclick = function (event) {
    updateItem(item, "לא עבר", event);
  };

  const delBtn = document.createElement("button");
  delBtn.textContent = "מחק";
  delBtn.onclick = function () {
    deleteItem(item);
  };

  const errorMsg = document.createElement("div");
  errorMsg.className = "error-message";
  errorMsg.style.display = "none";

  btns.appendChild(passBtn);
  btns.appendChild(failBtn);
  btns.appendChild(delBtn);
  li.appendChild(btns);
  li.appendChild(errorMsg);
  list.appendChild(li);
}

function updateItem(item, newStatus, event) {
  const items = getItems();
  const index = items.findIndex(i =>
    i.name === item.name && i.email === item.email && i.song === item.song
  );

  if (index === -1) return;

  const currentItem = items[index];

  if (newStatus === "עבר אודישן" && currentItem.verified !== true) {
    const li = event.target.closest("li");
    const errorMsg = li.querySelector(".error-message");
    if (errorMsg) {
      errorMsg.textContent = "לא ניתן לעבור אודישן ללא אישור נשר מוסמך";
      errorMsg.style.display = "block";
    }
    return;
  }

  currentItem.status = newStatus;
  localStorage.setItem(storageKey, JSON.stringify(items));
  renderItems();
}

function deleteItem(item) {
  const items = getItems();
  const index = items.findIndex(i =>
    i.name === item.name && i.email === item.email && i.song === item.song
  );

  if (index !== -1) {
    items.splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(items));
    renderItems();
  }
}

function updateStats(items) {
  if (stats === null) return;

  const total = items.length;
  const passed = items.filter(i => i.status === "עבר אודישן").length;

  const wingsStats = {};
  for (const i of items) {
    wingsStats[i.wing] = (wingsStats[i.wing] || 0) + 1;
  }

  const wingsText = Object.entries(wingsStats)
    .map(([wing, count]) => `${wing}: ${count}`)
    .join(" | ");

  stats.textContent = `סה"כ נרשמים: ${total} | עברו אודישן: ${passed} | ${wingsText}`;
}

document.addEventListener("DOMContentLoaded", function () {
  if (list !== null) {
    renderItems();
  }
});
