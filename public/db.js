
// TODO: open  indexedDB
const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;
const request = indexedDB.open("budget", 1);

// TODO: create an object store in the open db
request.onupgradeneeded = (event) => {
  db = event.target.result;

  const budgetStore = db.createObjectStore("pending", {
    keypath: "id",
    autoIncrement: true
  });
};

request.onsuccess = function (event) {
  db = event.target.result;
  console.log(db);

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (err) {
  console.log(err.message);
};

function checkDatabase() {
  const transaction = db.transaction("pending", "readwrite");
  const objStore = transaction.objectStore("pending");
  const getAll = objStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then((response) => response.json())
        .then(() => {
          const trans = db.transaction("pending", "readwrite");
          const objStore = trans.objectStore("pending");

          const delRequest = objStore.clear();
          delRequest.onsuccess = (event) =>
            console.log("All records deleted", event.target);
          delRequest.onerror = (err) => console.log(err.message);
        });
    }
  };
}

function saveRecord(record) {
  const transaction = db.transaction("pending", "readwrite");
  const objStore = transaction.objectStore("pending");
  objStore.add(record);
}

window.addEventListener("online", checkDatabase);