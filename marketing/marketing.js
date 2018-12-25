

var currentCommittee = "";
var currentName = "";
var currentData = {};
var viewDate = new Date();
var startSchedDate = new Date();
var endSchedDate = new Date();

function logout(){
    console.log("Logout Attempted");
    localStorage.removeItem("psubPortal");
    window.location.replace("../index.html")
}

function load(){
    //Safety Check
    if(localStorage.getItem("psubPortal") === null){
        window.location.replace("../index.html");
    }
    else{
        let storageObj = JSON.parse(localStorage.getItem("psubPortal"));
        currentCommittee = storageObj.committee;
        currentName = storageObj.name;
        currentData = storageObj;
        let firstName = currentName.substring(0, currentName.indexOf(" "));
        document.getElementById("navName").innerHTML = `Hi, ${firstName}!`;
        /* todo initialize dates with view date signups and calendar */
    }
}

function addMarketingHours(){
    var date = document.getElementById("dateInput").value;
    var start = document.getElementById("startHoursInput").value;
    var end = document.getElementById("endHoursInput").value;
    

    if (date === "" || start === "" || end === "") {
        alert("Please provide values for all event details");
    }
    else {
        start = start.split(":");
        end = end.split(":");
        var dateStr = date.split("-");
        var startTime = new Date( dateStr[0], dateStr[1]-1, dateStr[2], start[0],start[1], 0, 0);
        var endTime = new Date( dateStr[0], dateStr[1]-1, dateStr[2], end[0],end[1], 0, 0);
        
        var hours = Math.round((endTime.getTime()-startTime.getTime())/36e5);
        var settings = {
            "url": 'https://script.google.com/macros/s/AKfycbxTmGRbhyv56t3assM_urWIxMwGmnR82ltDsy_LnG0_oczCkQck/exec',/* TODO:  */
            "type": "POST",
            //"dataType": "json",
            "data": {
                "Member": currentName,
                "Committee": currentCommittee,
                "Date": date,
                "StartTime": startTime,
                "EndTime": endTime,
                "Hours": hours
            }
        }

        $.ajax(settings).done(function (response) {
            document.getElementById("dateInput").value = "";
            document.getElementById("startHoursInput").value = "";
            document.getElementById("endHoursInput").value = "";
            //console.log(response);
            document.getElementById("confirmMessage").innerHTML = date + " Added Successfully";

        });
    }
}

function viewHoursForDate(){
    viewDate = document.getElementById("dateInputView").value;
    if(viewDate === ""){
        viewDate = new Date();/* TODO */
    }

    var dateStr = viewDate.split("-");
    viewDate = new Date( dateStr[0], dateStr[1]-1, dateStr[2],0,0,0,0);
    document.getElementById("tableBody").innerHTML = "";
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": 'https://spreadsheets.google.com/feeds/list/11yTZsfcJNa7ta_3iBjwvDo2SSdsbAbWmLMyFsdoBzO0/1/public/full?alt=json-in-script',
        "method": "GET",
        "headers": {
            // "id": CLIENT_ID,
            // "secret": API_KEY,
        }
    }
    $.ajax(settings).done(function (response) {
        response = response.substring(response.indexOf("{"), response.length - 2);
        var response = JSON.parse(response);
        
        var dateChosen = viewDate.getFullYear() + '-' + (viewDate.getMonth() +1)
                            + '-' + viewDate.getDate();
        for (var i = 0; i < response.feed.entry.length; i++) {
            var data = response.feed.entry[i];
            var name = data.gsx$member.$t;
            var committee = data.gsx$committee.$t;
            var date = data.gsx$date.$t;
            var startTime = /* 'Hi'; */new Date(data.gsx$starttime.$t);
            startTime = startTime.getHours() + ':' + ((startTime.getMinutes()< 10)?'0':'') + startTime.getMinutes();
            var endTime = /* 'Hi'; */new Date(data.gsx$endtime.$t);       
            endTime = endTime.getHours() + ':' + ((endTime.getMinutes() < 10)?'0':'') + endTime.getMinutes();
            var hours = data.gsx$hours.$t;
            if(date === dateChosen){
                let tempTR = document.createElement("tr");

                let nameTD = document.createElement("td");
                nameTD.innerHTML = name;
                let committeeTD = document.createElement("td");
                committeeTD.innerHTML = committee;
                let startTD = document.createElement("td");
                startTD.innerHTML = startTime;
                let hoursTD = document.createElement("td");
                hoursTD.innerHTML = hours;
                let endTD = document.createElement("td");
                endTD.innerHTML = endTime;

                tempTR.appendChild(nameTD);
                tempTR.appendChild(committeeTD);
                tempTR.appendChild(startTD);
                tempTR.appendChild(endTD);
                tempTR.appendChild(hoursTD);

                document.getElementById("tableBody").appendChild(tempTR);
            }
        }

    });
}


function viewScheduleForDate(){
    startSchedDate = document.getElementById("dateStartInputView").value;
    endSchedDate = document.getElementById("dateEndInputView").value;


    if(startSchedDate === "" || endSchedDate === ""){
        startSchedDate = new Date();/* TODO */
    }

    startSchedDate = new Date( startSchedDate.split("-")[0], 
                            startSchedDate.split("-")[1]-1, 
                                startSchedDate.split("-")[2],0,0,0,0);
    endSchedDate = new Date( endSchedDate.split("-")[0], 
                            endSchedDate.split("-")[1]-1, 
                                endSchedDate.split("-")[2],0,0,0,0);
    document.getElementById("tableBody").innerHTML = "";
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": 'https://spreadsheets.google.com/feeds/list/11yTZsfcJNa7ta_3iBjwvDo2SSdsbAbWmLMyFsdoBzO0/3/public/full?alt=json-in-script',
        "method": "GET",
        "headers": {
            // "id": CLIENT_ID,
            // "secret": API_KEY,
        }
    }
    $.ajax(settings).done(function (response) {
        response = response.substring(response.indexOf("{"), response.length - 2);
        var response = JSON.parse(response);
        console.log(response);

        for (var i = 0; i < response.feed.entry.length; i++) {
            var data = response.feed.entry[i];
            var date = data.gsx$date.$t;
            var dateStr = new Date( date.split("-")[0], 
                                date.split("-")[1]-1, 
                                    date.split("-")[2],0,0,0,0);    
            //console.log(dateStr,startSchedDate,endSchedDate);
            if(dateStr.getTime() >= startSchedDate.getTime() && dateStr.getTime() <= endSchedDate.getTime()){
                var location = data.gsx$location.$t;
                var time = data.gsx$timerange.$t;
                let tempTR = document.createElement("tr");

                let dateTD = document.createElement("td");
                dateTD.innerHTML = date;
                let locationTD = document.createElement("td");
                locationTD.innerHTML = location;
                let timeTD = document.createElement("td");
                timeTD.innerHTML = time;

                tempTR.appendChild(dateTD);
                tempTR.appendChild(locationTD);
                tempTR.appendChild(timeTD);

                document.getElementById("tableBody").appendChild(tempTR);               
            }
            
        }

    });

}