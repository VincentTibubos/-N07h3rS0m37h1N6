if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(function(reg) {
        console.log('Service Worker registration succeeded.');
    }).catch(function(error) {
        console.log('Service Worker registration failed with ' + error);
    });
}
function subtractDateToGetTime(a,b){
  return (a.getTime()-b.getTime())/(60*60*1000);
}
var temp,pin='',dateLimit=45;
var newApp = angular.module('appEmployee', ['lbServices']); //myMsgs=ng-app our app now use service lbServices as its dependencies
newApp.controller("appEmployeeController", function($scope,$interval,$timeout,Msg){
    $scope.isTimeIn=false;
    $scope.TimeHour='';
    $scope.isBreakIn=false;
    $scope.syncingTimeIn=[];
    $scope.syncingTimeOut=[];
    $scope.dailyTimeIn=[];
    $scope.dailyBreakIn=[];
    $scope.syncingBreakIn=[];
    $scope.syncingBreakOut=[];
    $scope.isLoggedIn=false;
    $scope.employees=[];//define a blank array and let the getData to change it's value
    $scope.login=function(e){
        e.preventDefault();
        for(var i=0;i<$scope.employees.length;i++){
            if($scope.employees[i].username===$scope.loginName&&$scope.employees[i].password===$scope.loginPass){
                alert("login");
                $scope.isLoggedIn=true;
                $scope.loginPass="";
                $scope.loginName="";
                writeData('loggedInAccount', $scope.employees[i]);
            }
        }
    }
    $scope.logout=function(){
        $scope.isLoggedIn=false;
        alert('loggedout');
    }
    $scope.userId='';
    $scope.refreshEmp=function(){
        for(emp of $scope.employees){
            if(emp.id==$scope.userId){
                emp.isTimeIn=$scope.isTimeIn;
                emp.isBreakIn=$scope.isBreakIn;
                emp.time=$scope.TimeHour;
                break;
            }
        }
    }
    $scope.verify=function(str){
        $scope.userId=str;
        var newDate=new Date();
        $scope.isTimeIn=false;
        $scope.TimeHour='';
        $scope.isBreakIn=false;
        for(var i=0;i<$scope.syncingTimeIn.length;i++){
            if(!('out' in $scope.syncingTimeIn[i])&&$scope.syncingTimeIn[i].employee_id===$scope.userId&&(newDate.getMonth()+1)+'-'+newDate.getDate()+'-'+newDate.getFullYear()==$scope.syncingTimeIn[i].date){
                $scope.isTimeIn=true;
                $scope.TimeHour=$scope.syncingTimeIn[i].in;
                break;
            }
        }
        for(var i=0;i<$scope.dailyTimeIn.length;i++){
            if(!('out' in $scope.dailyTimeIn[i])&&$scope.dailyTimeIn[i].employee_id===$scope.userId&&(newDate.getMonth()+1)+'-'+newDate.getDate()+'-'+newDate.getFullYear()===$scope.dailyTimeIn[i].date_log)    {
                var checker=true;
                for(var j=0;j<$scope.syncingTimeOut.length;j++){
                    if($scope.syncingTimeOut[j].id==$scope.dailyTimeIn[i].id){
                       checker=false;
                        break; 
                    }
                }
                if(checker){
                    $scope.TimeHour=$scope.dailyTimeIn[i].in;
                    $scope.isTimeIn=true;
                    break;
                }
                    
            }
        }
        for(var i=0;i<$scope.syncingBreakIn.length;i++){
            if(!('out' in $scope.syncingBreakIn[i])&&$scope.syncingBreakIn[i].employee_id===$scope.userId&&(newDate.getMonth()+1)+'-'+newDate.getDate()+'-'+newDate.getFullYear()==$scope.syncingBreakIn[i].date){
                $scope.isBreakIn=true;
                $scope.TimeHour=$scope.syncingBreakIn[i].in;
                break;
            }
        }
        for(var i=0;i<$scope.dailyBreakIn.length;i++){
            if(!('out' in $scope.dailyBreakIn[i])&&$scope.dailyBreakIn[i].employee_id===$scope.userId&&(newDate.getMonth()+1)+'-'+newDate.getDate()+'-'+newDate.getFullYear()===$scope.dailyBreakIn[i].date_log)    {
                var checker=true;
                for(var j=0;j<$scope.syncingBreakOut.length;j++){
                    if($scope.syncingBreakOut[j].id==$scope.dailyBreakIn[i].id){
                       checker=false;
                        break; 
                    }
                }
                if(checker){
                    $scope.TimeHour=$scope.dailyBreakIn[i].in;
                    $scope.isBreakIn=true;
                    break;
                }
                    
            }
        }
        $scope.refreshEmp();
        console.log('refresh',$scope.dailyTimeIn,$scope.dailyBreakIn);
    }
    $scope.pin='';
    $scope.pinAdd=function(ch){
        if(ch=='<'){
            if($scope.pin.length>0){
                $scope.pin=$scope.pin.substring(0,($scope.pin.length-1));
            }
        }
        else if($scope.pin.length<6)
            $scope.pin+=ch;
    }
    $scope.checkTime=function(start,end){
        currentDate=new Date();
        startDate=new Date((currentDate.getMonth()+1)+'-'+currentDate.getDate()+'-'+currentDate.getFullYear()+' '+start).getTime();
        endDate=new Date((currentDate.getMonth()+1)+'-'+currentDate.getDate()+'-'+currentDate.getFullYear()+' '+end).getTime();
        //console.log(startDate<=currentDate.getTime()&&endDate>=currentDate.getTime());
        return startDate<=currentDate.getTime()&&endDate>=currentDate.getTime();
    };
    $scope.break=function(break_id){
        if($scope.pin===pin){
            if($scope.isBreakIn){
                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                    navigator.serviceWorker.ready
                    .then(function(sw) {                                     
                        var newDate=new Date();
                        var outPost=false;   
                        var i=0; 
                        for(var i=0;i<$scope.syncingBreakIn.length;i++){
                            if(!('out' in $scope.syncingBreakIn[i])&&$scope.syncingBreakIn[i].employee_id===$scope.userId){
                                outPost=$scope.syncingBreakIn[i];
                                break;
                            }
                        }
                        console.log('Break out');
                        if(outPost){
                            outPost.out= newDate.getHours()+':'+newDate.getMinutes()+':'+newDate.getSeconds();       
                            console.log('BreakOut',outPost);     
                            writeData('sync-breakIn', outPost)
                                .then(function() {
                                    console.log('update');
                                    $scope.syncingBreakIn.push(outPost);
                                    $scope.isBreakIn=false;
                                    $scope.verify($scope.userId);
                                    //$scope.getData()  ;
                                    //$scope.$apply();
                                    return sw.sync.register('sync-new-breakIn');
                                })
                                .catch(function(err) {
                                    console.log(err);
                                });
                        }
                        else{
                            for(i=0;i<$scope.dailyBreakIn.length;i++){
                                if(!('out' in $scope.dailyBreakIn[i])&&$scope.dailyBreakIn[i].employee_id===$scope.userId&&(newDate.getMonth()+1)+'-'+newDate.getDate()+'-'+newDate.getFullYear()===$scope.dailyBreakIn[i].date_log)    {
                                    outPost=$scope.dailyBreakIn[i];
                                    console.log('true');
                                    break;
                                }
                                else{
                                    console.log('false');
                                }
                            }
                            var postBreak={
                                id: outPost.id,
                                employee_id: outPost.employee_id,
                                date: outPost.date_log,
                                in: outPost.in,
                                company_break_id: outPost.company_break_id,
                                out: newDate.getHours()+':'+newDate.getMinutes()+':'+newDate.getSeconds() 
                            }
                            $scope.dailyBreakIn[i]=postBreak;
                            writeData('sync-breakOut', postBreak)
                                .then(function() {
                                    $scope.dailyBreakIn.push(postBreak);
                                    $scope.isBreakIn=false;
                                    $scope.syncingBreakOut.push(postBreak);
                                    $scope.verify($scope.userId);
                                    //$scope.getData();
                                    //$scope.$apply();
                                    return sw.sync.register('sync-new-breakOut');
                                })
                                .catch(function(err) {
                                    console.log(err);
                                });
                        }
                    })
                }
            }
            else{
                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                    navigator.serviceWorker.ready
                    .then(function(sw) {                                     
                        var newDate=new Date();
                        var postBreak={
                            id: $scope.userId+(newDate.getMonth()+1)+'-'+newDate.getDate()+'-'+newDate.getFullYear()+newDate.getHours()+':'+newDate.getMinutes()+':'+newDate.getSeconds(),
                            employee_id: $scope.userId,
                            date: (newDate.getMonth()+1)+'-'+newDate.getDate()+'-'+newDate.getFullYear(),
                            in: newDate.getHours()+':'+newDate.getMinutes()+':'+newDate.getSeconds(),
                            company_break_id: break_id
                        }                                    
                        writeData('sync-breakIn', postBreak)
                            .then(function() {
                                $scope.isBreakIn =true; 
                            $scope.TimeHour=postBreak.in;
                            $scope.refreshEmp();
                                //$scope.getData();
                                $scope.$apply();
                                return sw.sync.register('sync-new-breakIn');
                            })
                            .catch(function(err) {
                                console.log(err);
                            });
                    })
                }
            }
        }
        else{
            console.log('errpo');
        }
    }
    $scope.company_breaks=[];
    $scope.timeIn=function(){
        if($scope.pin===pin){
            console.log('pin'); 
            if ('serviceWorker' in navigator && 'SyncManager' in window) { 
                console.log('in');     
                navigator.serviceWorker.ready
                .then(function(sw) {                
                    console.log('ready');                      
                    var newDate=new Date();
                    var postTime={
                        id: $scope.userId+(newDate.getMonth()+1)+'-'+newDate.getDate()+'-'+newDate.getFullYear()+newDate.getHours()+':'+newDate.getMinutes()+':'+newDate.getSeconds(),
                        employee_id: $scope.userId,
                        date: (newDate.getMonth()+1)+'-'+newDate.getDate()+'-'+newDate.getFullYear(),
                        in: newDate.getHours()+':'+newDate.getMinutes()+':'+newDate.getSeconds()
                    }                                    
                    writeData('sync-timeIn', postTime)
                        .then(function() {
                            $scope.syncingTimeIn.push(postTime);
                            $scope.isTimeIn=true;
                            $scope.TimeHour=postTime.in;
                            $scope.refreshEmp();
                            //$scope.getData();
                            console.log('write');
                            $scope.$apply();
                            return sw.sync.register('sync-new-timeIn');
                        })
                        .catch(function(err) {
                            console.log(err);
                        });
                })
            }
        }
        else{
            console.log('errpo');
        }
    }
    $scope.timeOut=function(){
        if($scope.pin===pin){
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                navigator.serviceWorker.ready
                .then(function(sw) {                                     
                    var newDate=new Date();
                    var outPost=false;   
                    var i=0; 
                    for(var i=0;i<$scope.syncingTimeIn.length;i++){
                        if(!('out' in $scope.syncingTimeIn[i])&&$scope.syncingTimeIn[i].employee_id===$scope.userId){
                            outPost=$scope.syncingTimeIn[i];
                            break;
                        }
                    }
                    console.log('time out');
                    if(outPost){
                        outPost.out= newDate.getHours()+':'+newDate.getMinutes()+':'+newDate.getSeconds();       
                        console.log('timeOut',outPost);     
                        writeData('sync-timeIn', outPost)
                            .then(function() {
                                console.log('update');
                                $scope.syncingTimeIn.push(outPost);
                                $scope.isTimeIn=false;
                                $scope.refreshEmp();
                                //$scope.getData()  ;
                                //$scope.$apply();
                                return sw.sync.register('sync-new-timeIn');
                            })
                            .catch(function(err) {
                                console.log(err);
                            });
                    }
                    else{
                        for(i=0;i<$scope.dailyTimeIn.length;i++){
                            if(!('out' in $scope.dailyTimeIn[i])&&$scope.dailyTimeIn[i].employee_id===$scope.userId&&(newDate.getMonth()+1)+'-'+newDate.getDate()+'-'+newDate.getFullYear()===$scope.dailyTimeIn[i].date_log)    {
                                outPost=$scope.dailyTimeIn[i];
                                console.log('true');
                                break;
                            }
                            else{
                                console.log('false');
                            }
                        }
                        var postTime={
                            id: outPost.id,
                            employee_id: outPost.employee_id,
                            date: outPost.date_log,
                            in: outPost.in,
                            out: newDate.getHours()+':'+newDate.getMinutes()+':'+newDate.getSeconds() 
                        }
                        $scope.dailyTimeIn[i]=postTime;
                        writeData('sync-timeOut', postTime)
                            .then(function() {
                                $scope.dailyTimeIn.push(postTime);
                                $scope.isTimeIn=false;
                                $scope.refreshEmp();
                                $scope.syncingTimeOut.push(postTime);
                                //$scope.getData();
                                $scope.$apply();
                                return sw.sync.register('sync-new-timeOut');
                            })
                            .catch(function(err) {
                                console.log(err);
                            });
                    }
                })
            }
        }
        else{
            console.log('errpo');
        }
    }
   $scope.getData=function(){
        var url = 'https://localhost:8443/api/employees';
        var url2 = 'https://localhost:8443/api/time_logs';
        var url3 = 'https://localhost:8443/api/company_breaks';
        var networkDataReceived = false;
        var networkDataReceived2 = false;
        fetch(url)
            .then(function(res) {
                return res.json();
            })
            .then(function(data) {
                networkDataReceived = true;
                $scope.employees = data;
                console.log('start');
                for(var j=0;j<$scope.employees.length;j++){
                        $scope.verify($scope.employees[j].id);
                        console.log(j,$scope.employees[j].id,$scope.isTimeIn);                        
                }
                console.log('olmessage:' + $scope.employees);
                //$scope.$apply();
            })
            .catch(function(err){
                console.log(err);
            });
        fetch(url3)
            .then(function(res) {
                return res.json();
            })
            .then(function(data) {
                networkDataReceived = true;
                        $scope.company_breaks = data;
                        console.log('olmessage:' + $scope.company_breaks);
                        $scope.$apply();
            })
            .catch(function(err){
                console.log(err);
            });
        fetch(url2)
            .then(function(res) {
                return res.json();
            })
            .then(function(data) {
                for (var key in data) {
                    var newDate=new Date();
                    var limitDate=new Date();
                    limitDate.setHours(limitDate.getHours()-(24*dateLimit));
                    var wdate=((newDate.getMonth()+1)+'-'+newDate.getDate()+'-'+newDate.getFullYear());
                    var indexDate=new Date(data[key].date_log);
                    if(limitDate.getTime()<=indexDate.getTime()&&(newDate.getTime()>=indexDate.getTime())){
                        $scope.dailyTimeIn.push(data[key]);/* 
                        console.log('------------------------------------------');
                        console.log(newDate,' >  ',indexDate);
                        console.log(newDate.getMonth(),' >  ',indexDate.getMonth());
                        console.log(newDate.getTime(),' >  ',indexDate.getTime());
                        console.log(new Date(wdate),' >  ',data[key].date_log); */
                    }/* 
                    else{
                    console.error('date',limitDate.getTime(),'<',indexDate.getTime(),'<',newDate.getTime());
                    console.error('date',limitDate,'<',indexDate,'<',newDate);
                    } */
                }
                networkDataReceived2=true;
                //$scope.dailyTimeIn = data;
                console.log('olmessage:' + $scope.dailyTimeIn);
                $scope.$apply();
            })
            .catch(function(err){
                console.log(err);
            }); 
            
            if ('indexedDB' in window) {
                if (!networkDataReceived) {            
                    readAllData('employees')
                        .then(function(data) {
                            //if(data.toString()!=$scope.employees.toString()){
                            if(data.length>0){
                                $scope.employees = data;
                                console.log('offmessage: ' + $scope.employees);
                                $scope.$apply(); //this triggers a $digest
                            // }
                            }
                        });
                }
                if (!networkDataReceived2) {     
                    readAllData('time_log')
                        .then(function(data) {
                            //if(data.toString()!=$scope.employees.toString())
                                console.log('omessage:' + $scope.dailyTimeIn);
                            if(data.length>0){
                                $scope.dailyTimeIn = data;
                                console.log('omessage:' + $scope.dailyTimeIn);
                                $scope.$apply(); //this triggers a $digest
                            // }
                            }
                        });
                    }
                        readAllData('loggedInAccount')
                    .then(function(data){
                        if(data.length>0){
                            $scope.isLoggedIn=true;
                            $scope.$apply();
                        }
                    });
                readAllData('sync-timeIn')
                    .then(function(data){
                        if(data.length>0){
                            $scope.syncingTimeIn=data;
                            $scope.$apply();
                        }
                    });
                readAllData('time_log')
                .then(function(data){
                    if(data.length>0){
                        $scope.dailyTimeIn=data;
                        $scope.$apply();
                    }
                });
            }

        /*
        readAllData('sync-posts')
        .then(function(data) {
            $scope.syncing_msgs=data;
            $scope.$apply();
        });*/
    }
    $scope.getData();
    $interval(function(){
        if('indexedDB' in window){
            readAllData('sync-timeIn')
            .then(function(data){
               // console.log('update');
                $scope.syncingTimeIn=data;
                $scope.$apply();
                return;
            });
            readAllData('sync-timeOut')
            .then(function(data){
               // console.log('update');
                $scope.syncingTimeOut=data;
                $scope.$apply();
                return;
            });
            readAllData('sync-breakIn')
            .then(function(data){
               // console.log('update');
                $scope.syncingBreakIn=data;
                $scope.$apply();
                return;
            });
            readAllData('sync-breakOut')
            .then(function(data){
               // console.log('update');
                $scope.syncingBreakOut=data;
                $scope.$apply();
                return;
            });
        }
        var url2 = 'https://localhost:8443/api/time_logs';
        fetch(url2)
            .then(function(res) {
                return res.json();
            })
            .then(function(data) {
                for (var key in data) {
                    var newDate=new Date();
                    var limitDate=new Date();
                    limitDate.setHours(limitDate.getHours()-(24*dateLimit));
                    var wdate=(newDate.getMonth()+'-'+newDate.getDate()+'-'+newDate.getFullYear());
                    var indexDate=new Date(data[key].date_log);
                    if(/* !('out' in data[key]) &&*/limitDate.getTime()<=indexDate.getTime()&&(newDate.getTime()>=indexDate.getTime())){
                      //console.log(wdate,' sdfsadfsaf  ',data[key].date_log);
                    }
                    else{
                        data.remove(key);
                      //console.log(limitDate.getTime(),newDate.getTime(),indexDate.getTime(),dateLimit);
                    }
                  }
                $scope.dailyTimeIn=data;
                $scope.$apply();
                return;
            })
            .catch(function(err){
                //console.log(err);
            });
            fetch("https://localhost:8443/api/break_logs")
                .then(function(res) {
                    return res.json();
                })
                .then(function(data) {
                    for (var key in data) {
                        var newDate=new Date();
                        var limitDate=new Date();
                        limitDate.setHours(limitDate.getHours()-(24*dateLimit));
                        var wdate=(newDate.getMonth()+'-'+newDate.getDate()+'-'+newDate.getFullYear());
                        var indexDate=new Date(data[key].date_log);
                        if(/* !('out' in data[key]) &&*//* limitDate.getTime()<=indexDate.getTime()&&(newDate.getTime()>=indexDate.getTime()) */true){
                          //console.log(wdate,' sdfsadfsaf  ',data[key].date_log);
                        }
                        else{
                            data.remove(key);
                          //sconsole.log(limitDate.getTime(),newDate.getTime(),indexDate.getTime(),dateLimit);
                        }
                    }
                    $scope.dailyBreakIn=data;
                    $scope.$apply();
                    return;
                })
                .catch(function(err){
                    //console.log(err);
                }); 
        /* fetch('https://localhost:8443/api/employees')
            .then(function(res) {
                return res.json();
            })
            .then(function(data) {
                networkDataReceived = true;
                for(var i=0;i<data.length;i++){
                    $scope.verify(data[i]);
                    data[i].isTimeIn=$scope.isTimeIn;
                }
                $scope.employees = data;
                    console.log('olmessage:' + $scope.employees);
                    $scope.$apply();
            })
            .catch(function(err){
                console.log(err);
            }); */
    },200);
    //$scope.sample=$scope.getData();
    //$interval(function(){$scope.$apply();},3000);//gets new data from the server every 3 seconds

   $scope.newMsg='';//the model we will use to input new message
   
   $scope.loginName='';
   $scope.loginPass='';
   $scope.syncing_msgs=[];  
   $scope.sendMsg=function(e){//function that adds a new message to the loopback database
    e.preventDefault(); 
       if($scope.newMsg!=""){
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                navigator.serviceWorker.ready
                .then(function(sw) {                                     
                    var post = {
                        date_created: new Date().toString(),
                        id: new Date().toString(),
                        content: $scope.newMsg
                    };           
                    writeData('sync-posts', post)
                        .then(function() {
                            $scope.newMsg="";
                            $scope.syncing_msgs.push(post);
                            $scope.$apply();
                            return sw.sync.register('sync-new-posts');
                        })
                        .catch(function(err) {
                            console.log(err);
                        });
                })
            }
       }
   }
   
    $scope.tlDecrypt =function(){
        $scope.loginPass=tlDecrypt($scope.loginPass);
    }
    $scope.tlEncrypt=function(str){
        $scope.loginPass=tlEncrypt($scope.loginPass);
    }
});

    function tlDecrypt(str){
        return 'Decrypt';  
    }
    function tlEncrypt(str){
        return 'Encrypt';  
    }
