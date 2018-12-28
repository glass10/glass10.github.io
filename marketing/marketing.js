

var currentCommittee = "";
var currentName = "";
var currentData = {};
var startSchedDate = new Date();
var endSchedDate = new Date();

let allDates = [];

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
        //viewHoursForDate();
        viewScheduleForDate();
        /* todo initialize dates with view date signups and calendar */
    }
}

function addMarketingHours(dateIndex){
    var date = allDates[dateIndex];
    var startSelect = document.getElementById("startHour-"+dateIndex);
    var endSelect = document.getElementById("endHour-"+dateIndex);

    let start = startSelect.options[startSelect.selectedIndex].value;
    let end = endSelect.options[endSelect.selectedIndex].value;
    
    console.log("DATE: " + date + " START: " + start + " END: " + end);

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

function viewHoursForDate(dateServer, startTime, endTime){
    document.getElementById("tableBodyDate0").innerHTML = "";
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
        
        var dateChosen = dateServer;
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
            //console.log(dateChosen);
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

                document.getElementById("tableBodyDate0").appendChild(tempTR);
            }
        }

    });
}


function viewScheduleForDate(){
    startSchedDate = document.getElementById("dateStartInputView").value;
    endSchedDate = document.getElementById("dateEndInputView").value;


    if(startSchedDate === "" || endSchedDate === ""){
        startSchedDate = new Date();/* TODO */
        endSchedDate = new Date();
        endSchedDate.setDate(endSchedDate.getDate() + (7-endSchedDate.getDay()) - (endSchedDate.getDay() == 0?7:1));
        startSchedDate.setDate(startSchedDate.getDate() - startSchedDate.getDay() + (startSchedDate.getDay() == 0? -6:1));
    }
    else{
        startSchedDate = new Date( startSchedDate.split("-")[0], 
                                startSchedDate.split("-")[1]-1, 
                                    startSchedDate.split("-")[2],0,0,0,0);
        endSchedDate = new Date( endSchedDate.split("-")[0], 
                                endSchedDate.split("-")[1]-1, 
                                    endSchedDate.split("-")[2],0,0,0,0);
    }

    // document.getElementById("schedTableBody").innerHTML = "";
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
        //console.log(response);

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

                let cardHTML = `<td>${date}</td>
                                <td>${location}</td>
                                <td>${time}</td>`;

                document.getElementById("date-" + i).innerHTML = cardHTML;
                allDates.push(date);

                // Get all 30 min times from range
                let timeObj = time.replace(/\s+/g, '');
                timeObj = timeObj.split("-");
                timeObj[0] = "1/1/2000 " + timeObj[0].toUpperCase();
                timeObj[0] = timeObj[0].replace("AM", " AM");
                timeObj[1] = "1/1/2000 " + timeObj[1].toUpperCase();
                timeObj[1] = timeObj[1].replace("PM", " PM");
                
                let startDate = new Date(timeObj[0]);
                let endDate = new Date(timeObj[1]);

                let allTimes = [startDate.toTimeString().split(' ')[0]];
                while(startDate.getTime() != endDate.getTime()){
                    startDate.setMinutes(startDate.getMinutes() + 30);
                    allTimes.push(startDate.toTimeString().split(' ')[0])
                }

                console.log(allTimes);

                // Append times to table and select
                for(let j = 0; j < allTimes.length; j++){
                    let newRow = document.createElement("tr");
                    let timeTD = document.createElement("td");
                    timeTD.innerHTML = allTimes[j];
                    newRow.appendChild(timeTD);
                    document.getElementById("date-"+ i + "-sub-tab").appendChild(newRow);

                    // Select options
                    let optionString = "<option value='" + allTimes[j] + "'>" + allTimes[j] + "</option>";
                    document.getElementById("startHour-"+i).innerHTML += (optionString);
                    document.getElementById("endHour-"+i).innerHTML += (optionString);
                }
                
            }
            
        }
    });

}

function expandDate(row){
    console.log(row);
    var date = row.substring(0,row.indexOf("	"));
    row = row.substring(row.indexOf("	")+1);
    var startTime = row.split(" ")[1];
    var endTime = "";
    
    // viewHoursForDate(date, startTime, endTime);
}