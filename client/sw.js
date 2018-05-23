importScripts('js/idb.js');
importScripts('js/utility.js');
// The name of the cache to use for this instance of the Service Worker
var cacheName = 'v1';
var dateLimit=45;//45 days ago
// The set of files to cache
var filesToCache = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png',
    "lib/angular/angular.js",
    "lib/jquery/dist/jquery.js",
    "lib/angular-resource/angular-resource.js",
    "lib/bootstrap/dist/js/bootstrap.js",
    "lib/bootstrap/dist/css/bootstrap.css",
    "js/app.js",
    "js/lb-services.js",
    "js/utility.js",
    "js/idb.js",
    "img/emp/decipulo.png",
    "img/emp/Montilla.jpg",
    "img/emp/pepito.jpg",
    "img/emp/tibubos.png",
    "img/emp/velasco.png"
];

// Pre-caches the files when the Service Worker is installed
self.addEventListener('install', function(e) {
  console.log('[Service Worker] installed');
  e.waitUntil(caches.open(cacheName)
    .then(function(cache) {
      return cache.addAll(filesToCache)
        .then(function() {
          self.skipWaiting();
        });
      }));
});

// Deletes old caches when the new Service Worker is activated
self.addEventListener('activate', function(e) {
  console.log('[Service Worker] activated');
  e.waitUntil(caches.keys()
    .then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName)
          return caches.delete(key);
      }));
  }));
  return self.clients.claim();
});

// Returns a response out of cache when fetched, or requests the resource if not already cached
self.addEventListener('fetch', function(e) {
  var url = 'https://localhost:8443/api/employees';
  var url2 = 'https://localhost:8443/api/time_logs';
  var url3 = 'https://localhost:8443/api/company_breaks';
  var url4 = 'https://localhost:8443/api/break_logs';
  if(e.request.method==="POST") return; 
  else if (e.request.url.indexOf(url) > -1) {
    //console.log('request: ',e.request);  
    e.respondWith(fetch(e.request)
      .then(function (res) {
        var clonedRes = res.clone();
        clearAllData('employees')
          .then(function () {
            return clonedRes.json();
          })
          .then(function (data) {
            for (var key in data) {
              writeData('employees', data[key])
            }
          })
          .catch(function(err){
            console.log(err);
          });
        return res;
      })
    );
  }
  else if (e.request.url.indexOf(url2) > -1) {
    //console.log('request: ',e.request); 
    e.respondWith(fetch(e.request)
      .then(function (res) {
        var clonedRes = res.clone();
        clearAllData('time_log')
          .then(function () {
            return clonedRes.json();
          })
          .then(function (data) {
            for (var key in data) {
              var newDate=new Date();
              var limitDate=new Date();
              limitDate.setHours(limitDate.getHours()-(24*dateLimit));
              var wdate=(newDate.getMonth()+'-'+newDate.getDate()+'-'+newDate.getFullYear());
              var indexDate=new Date(data[key].date_log);
              if(/* !('out' in data[key])&& */limitDate.getTime()<=indexDate.getTime()&&(newDate.getTime()>=indexDate.getTime())){
                writeData('time_log', data[key]);
                console.log(wdate,' sdfsadfsaf  ',data[key].date_log);
              }
              else{
                console.log(limitDate.getTime(),newDate.getTime(),indexDate.getTime(),dateLimit);
              }
            }
          })
          .catch(function(err){
            console.log(err);
          });
        return res;
      })
    );
  }
  else if (e.request.url.indexOf(url4) > -1) {
    //console.log('request: ',e.request); 
    e.respondWith(fetch(e.request)
      .then(function (res) {
        var clonedRes = res.clone();
        clearAllData('break_log')
          .then(function () {
            return clonedRes.json();
          })
          .then(function (data) {
            for (var key in data) {
              var newDate=new Date();
              var limitDate=new Date();
              limitDate.setHours(limitDate.getHours()-(24*dateLimit));
              var wdate=(newDate.getMonth()+'-'+newDate.getDate()+'-'+newDate.getFullYear());
              var indexDate=new Date(data[key].date_log);
              if(/* !('out' in data[key])&& */limitDate.getTime()<=indexDate.getTime()&&(newDate.getTime()>=indexDate.getTime())){
                writeData('break_log', data[key]);
                console.log(wdate,' sdfsadfsaf  ',data[key].date_log);
              }
              else{
                console.log(limitDate.getTime(),newDate.getTime(),indexDate.getTime(),dateLimit);
              }
            }
          })
          .catch(function(err){
            console.log(err);
          });
        return res;
      })
    );
  }
  else if (e.request.url.indexOf(url3) > -1) {
    //console.log('request: ',e.request); 
    e.respondWith(fetch(e.request)
      .then(function (res) {
        var clonedRes = res.clone();
        clearAllData('company_break')
          .then(function () {
            return clonedRes.json();
          })
          .then(function (data) {
            for (var key in data) {
              var newDate=new Date();
              var limitDate=new Date();
              limitDate.setHours(limitDate.getHours()-(24*dateLimit));
              var wdate=(newDate.getMonth()+'-'+newDate.getDate()+'-'+newDate.getFullYear());
              var indexDate=new Date(data[key].date_log);
              if(/* !('out' in data[key])&& */limitDate.getTime()<=indexDate.getTime()&&(newDate.getTime()>=indexDate.getTime())){
                writeData('company_break', data[key]);
                console.log(wdate,' sdfsadfsaf  ',data[key].date_log);
              }
              else{
                console.log(limitDate.getTime(),newDate.getTime(),indexDate.getTime(),dateLimit);
              }
            }
          })
          .catch(function(err){
            console.log(err);
          });
        return res;
      })
    );
  }
  else{
    e.respondWith(caches.match(e.request)
    .then(function(response) {
      return response || fetch(e.request)
        .then(function (resp) {
          return caches.open(cacheName)
            .then(function(cache){
              cache.put(e.request, resp.clone());
              return resp;
          })
        }).catch(function(event){
          console.log('Error in Service Worker fetch event!');
        })
      })
    );
  }
});

self.addEventListener("sync",function(event){
  console.log('Service Worker Syncing');
  if(event.tag==='sync-new-timeIn'){
    console.log('time_in');
    event.waitUntil(
      readAllData('sync-timeIn')
        .then(function(data){
          console.log('wew',data);
          for(dt of data){ 
            fetch('https://localhost:8443/api/time_logs', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                employee_id: dt.employee_id,
                date_log: dt.date,
                in: dt.in,
                out: dt.out
              })
            })
              .then(function(res) {
                console.log('Sent data', res);
                if(res.ok){
                  res.json()
                  .then(function(resData){
                    console.log('redata',resData);
                    deleteItemFromData('sync-timeIn', resData.employee_id+resData.date_log+resData.in);
                  });
                  //deleteItemFromData('sync-posts', dt.id); 
                }
              })
              .catch(function(err){
                console.log('sync error: ',err);
              }); 
          }
        })
        .catch(function(err){
          console.log(err);
        })
    );
  }
  else if(event.tag==='sync-new-timeOut'){
    console.log('time_in');
    event.waitUntil(
      readAllData('sync-timeOut')
        .then(function(data){
          console.log('wew',data);
          for(dt of data){
            console.log('data: ',dt); 
            fetch('https://localhost:8443/api/time_logs', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                id: dt.id,
                employee_id: dt.employee_id,
                date_log: dt.date,
                in: dt.in,
                out: dt.out
              })
            })
              .then(function(res) {
                console.log('Sent data', res);
                if(res.ok){
                  res.json()
                  .then(function(resData){
                    console.log('redata',resData);
                    deleteItemFromData('sync-timeOut', resData.id);
                  });
                  //deleteItemFromData('sync-posts', dt.id); 
                }
              })
              .catch(function(err){
                console.log('sync error: ',err);
              }); 
          }
        })
        .catch(function(err){
          console.log(err);
        })
    );
  }
  else if(event.tag==='sync-new-breakIn'){
    console.log('break_in');
    event.waitUntil(
      readAllData('sync-breakIn')
        .then(function(data){
          console.log('wew',data);
          for(dt of data){ 
            fetch('https://localhost:8443/api/break_logs', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                employee_id: dt.employee_id,
                date_log: dt.date,
                in: dt.in,
                company_break_id: dt.company_break_id
              })
            })
              .then(function(res) {
                console.log('Sent data', res);
                if(res.ok){
                  res.json()
                  .then(function(resData){
                    console.log('resdata',resData);
                    deleteItemFromData('sync-breakIn', resData.employee_id+resData.date_log+resData.in);
                  });
                  //deleteItemFromData('sync-posts', dt.id); 
                }
              })
              .catch(function(err){
                console.log('sync error: ',err);
              }); 
          }
        })
        .catch(function(err){
          console.log(err);
        })
    );
  }
  else if(event.tag==='sync-new-breakOut'){
    console.log('break_in');
    event.waitUntil(
      readAllData('sync-breakOut')
        .then(function(data){
          console.log('wew',data);
          for(dt of data){
            console.log('data: ',dt); 
            fetch('https://localhost:8443/api/break_logs', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                id: dt.id,
                employee_id: dt.employee_id,
                date_log: dt.date,
                in: dt.in,
                out: dt.out,
                company_break_id: dt.company_break_id
              })
            })
              .then(function(res) {
                console.log('Sent data', res);
                if(res.ok){
                  res.json()
                  .then(function(resData){
                    console.log('redata',resData);
                    deleteItemFromData('sync-breakOut', resData.id);
                  });
                  //deleteItemFromData('sync-posts', dt.id); 
                }
              })
              .catch(function(err){
                console.log('sync error: ',err);
              }); 
          }
        })
        .catch(function(err){
          console.log(err);
        })
    );
  }
});