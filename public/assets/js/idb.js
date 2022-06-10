//create variable to hole db connection
let db;
//establish a connection to IndexDb database called "pizza_hunt" and set it to version 1
const request = indexedDB.open('pizza_hunt', 1);
//this event will emit if the database version changes
request.onupgradeneeded = function(event) {
    //save a reference to the database
    const db = event.target.result;
    //create an object store, set it to have auto incrementing promary key of sorts
    db.createObjectStore('new_pizza', {autoIncrement: true });
};

//upon a succesful
request.onsuccess = function(event) {
    db = event.target.result;

    // check if app is online, if yest run upload pizza 
    if (navigator.onLine) {
        //uploadPizza();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

//this function will be executed if we attempt to submit a new pizza with no internet connection
function saveRecord(record) {
    //open a new transaction with the database with read a write permission
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access the object store for new `new_pizza`
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    // add record to your store with add method
    pizzaObjectStore.add(record);
};

function uploadPizza() {
    // open a transaction on your db
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access your object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    // get all records from store and set to a variable
    const getAll = pizzaObjectStore.getAll();

    //upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        //if there was data in indexedDb, lets send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                //open one more transaction
                const transaction = db.transaction(['new_pizza'], 'readwrite');
                //access the new_pizza store
                const pizzaObjectStore = transaction.objectStore('new_pizza');
                //clear all items in your store
                pizzaObjectStore.clear();

                alert('all saved pizza has been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
}

//listen for app coming back online
window.addEventListener('online', uploadPizza);
