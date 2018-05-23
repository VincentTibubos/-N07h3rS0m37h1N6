var dbPromise = idb.open('employees-store', 1, function (db) {
  if (!db.objectStoreNames.contains('employees')) {
    db.createObjectStore('employees', {keyPath: 'id'});
  }
  if (!db.objectStoreNames.contains('loggedInAccount')) {
    db.createObjectStore('loggedInAccount', {keyPath: 'id'});
  }
  if (!db.objectStoreNames.contains('time_log')) {
    db.createObjectStore('time_log', {keyPath: 'id'});
  }
  if (!db.objectStoreNames.contains('sync-timeIn')) {
    db.createObjectStore('sync-timeIn', {keyPath: 'id'});
  }
  if (!db.objectStoreNames.contains('sync-timeOut')) {
    db.createObjectStore('sync-timeOut', {keyPath: 'id'});
  }
  if (!db.objectStoreNames.contains('sync-breakIn')) {
    db.createObjectStore('sync-breakIn', {keyPath: 'id'});
  }
  if (!db.objectStoreNames.contains('sync-breakOut')) {
    db.createObjectStore('sync-breakOut', {keyPath: 'id'});
  }
  if (!db.objectStoreNames.contains('break_log')) {
    db.createObjectStore('break_log', {keyPath: 'id'});
  }
  if (!db.objectStoreNames.contains('company_break')) {
    db.createObjectStore('company_break', {keyPath: 'id'});
  }
});

function writeData(st, data) {
  return dbPromise
    .then(function(db) {
      var tx = db.transaction(st, 'readwrite');
      var store = tx.objectStore(st);
      store.put(data);
      return tx.complete;
    });
}

function readAllData(st) {
  return dbPromise
    .then(function(db) {
      var tx = db.transaction(st, 'readonly');
      var store = tx.objectStore(st);
      return store.getAll();
    })
    .catch(function(err){
      console.log(err);
    });
}
function clearAllData(st) {
  return dbPromise
    .then(function(db) {
      var tx = db.transaction(st, 'readwrite');
      var store = tx.objectStore(st);
      store.clear();
      return tx.complete;
    });
}

function deleteItemFromData(st, id) {
  dbPromise
    .then(function(db) {
      var tx = db.transaction(st, 'readwrite');
      var store = tx.objectStore(st);
      store.delete(id);
      return tx.complete;
    })
    .then(function() {
      console.log('Item deleted!',id);
    });
}