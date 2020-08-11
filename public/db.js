let db;

// db request for budget database
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function (event) {
	// pending object store set to autoIncrement
	const db = event.target.result;
	db.createObjectStore('pending', { autoIncrement: true });
};

request.onsuccess = function (event) {
	db = event.target.result;

	if (navigator.onLine) {
		checkDatabase();
	}
};

request.onerror = function (event) {
	console.log('Error: ' + event.target.errorCode);
};

function saveRecord(record) {
	// transaction with readwrite access
	const transaction = db.transaction(['pending'], 'readwrite');
	const store = transaction.objectStore('pending');
	// add method to add record
	store.add(record);
}

function checkDatabase() {
	// open transaction
	const transaction = db.transaction(['pending'], 'readwrite');
	const store = transaction.objectStore('pending');
	// get all records
	const getAll = store.getAll();

	getAll.onsuccess = function () {
		if (getAll.result.length > 0) {
			fetch('/api/transaction/bulk', {
				method: 'POST',
				body: JSON.stringify(getAll.result),
				headers: {
					Accept: 'application/json, text/plain, */*',
					'Content-Type': 'application/json',
				},
			})
				.then((response) => response.json())
				.then(() => {
					const transaction = db.transaction(['pending'], 'readwrite');
					const store = transaction.objectStore('pending');
					// clear all records
					store.clear();
				});
		}
	};
}

window.addEventListener('online', checkDatabase);