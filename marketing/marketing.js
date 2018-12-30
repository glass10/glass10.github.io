

var currentCommittee = "";
var currentName = "";
var currentData = {};
var startSchedDate = new Date();
var endSchedDate = new Date();

let allDates = [];
let locationInfo = {};
let locationIndex = 0;

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
        getLocations();
        /* todo initialize dates with view date signups and calendar */
    }
}

function addMarketingHours(dateIndex){
    var date = allDates[dateIndex+locationIndex];
    var startSelect = document.getElementById("startHour-"+dateIndex);
    var endSelect = document.getElementById("endHour-"+dateIndex);

    let start = startSelect.options[startSelect.selectedIndex].value;
    let end = endSelect.options[endSelect.selectedIndex].value;
    
    console.log("DATE: " + date + " START: " + start + " END: " + end);

    let allOptions = [startSelect.options[0].value];
    for(let i = 0; i < endSelect.length; i++){
        allOptions.push(endSelect.options[i].value);
    }

    let allTimes = "";
    let hours = 0;
    for(let i = allOptions.indexOf(start); i < allOptions.indexOf(end); i++){
        allTimes += (allOptions[i]) + ",";
        hours += 0.5;
    }
    console.log(allTimes);

    if (date === "" || start === "" || end === "") {
        alert("Please provide values for all event details");
    }
    else {
        var settings = {
            "url": 'https://script.google.com/macros/s/AKfycbxTmGRbhyv56t3assM_urWIxMwGmnR82ltDsy_LnG0_oczCkQck/exec',/* TODO:  */
            "type": "POST",
            //"dataType": "json",
            "data": {
                "Member": currentName,
                "Committee": currentCommittee,
                "Date": date,
                "Times": allTimes,
                // "StartTime": start,
                // "EndTime": end,
                "Hours": hours
            }
        }

        $.ajax(settings).done(function (response) {
            alert("Marketing successfully added on " + date);
            // Update 
            viewScheduleForDate(0);
            // Start Spinner
            document.getElementById("topSpinner").style.visibility = "visible";
        });
    }
}

function getMembers(date, time){
    document.getElementById("topSpinner").style.visibility = "visible";
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
        
        var dateChosen = date;
        let allMembers = "";
        for (var i = 0; i < response.feed.entry.length; i++) {
            let data = response.feed.entry[i];
            let name = data.gsx$member.$t;
            let committee = data.gsx$committee.$t;
            let date = data.gsx$date.$t;
            let allTimes = data.gsx$times.$t;
            // console.log("All Times: " + allTimes);
            if(date === dateChosen){
                if(allTimes.includes(time)){
                    allMembers += name + ", ";
                }
            }
        }
        // console.log(allMembers);
        if(allMembers != ""){
            document.getElementById(dateChosen+"-"+time).innerHTML = allMembers;
            // document.getElementById("topSpinner").style.visibility = "hidden";
        }
        document.getElementById("topSpinner").style.visibility = "hidden";
    });
}

function viewScheduleForDate(direction){
    let allData = locationInfo;
    let dataKeys = Object.keys(allData);
    let locationNumber = dataKeys.length;
    locationIndex += direction;
    let pageCount = Math.ceil(locationNumber / 5);
    let currentPage = (locationIndex / 5) + 1;
    document.getElementById("pageIndicator").innerHTML = `Page ${currentPage} / ${pageCount}`;
    if(currentPage === 1){
        document.getElementById("prevButton").classList.add("disable");
    }
    else if(currentPage === pageCount){
        document.getElementById("nextButton").classList.add("disable");
    }
    else{
        document.getElementById("prevButton").classList.remove("disable");
        document.getElementById("nextButton").classList.remove("disable");
    }

    for(let i = locationIndex; i < locationIndex+5; i++){
        let dateInfo = allData[dataKeys[i]];
        if(dateInfo !== undefined){
            let cardHTML = `<td>${dateInfo.date}</td>
                            <td>${dateInfo.location}</td>
                            <td>${dateInfo.timeStr}</td>`;

            // Reset Values
            document.getElementById("date-" + (i-locationIndex)).style.visibility = "visible";
            document.getElementById("startHour-"+(i-locationIndex)).innerHTML = "";
            document.getElementById("endHour-"+(i-locationIndex)).innerHTML = "";
            document.getElementById("date-"+ (i-locationIndex) + "-sub-tab").innerHTML = document.getElementById("date-"+ (i-locationIndex) + "-sub-tab").parentElement.rows[0].innerHTML;

            // Set main table
            document.getElementById("date-" + (i-locationIndex)).innerHTML = cardHTML;

            // Append times to table and select
            for(let j = 0; j < dateInfo.allTimes.length; j++){
                let newRow = document.createElement("tr");
                let timeTD = document.createElement("td");
                let memberTD = document.createElement("td");
                memberTD.setAttribute("colspan", 2);
                memberTD.setAttribute("id", dateInfo.date+"-"+dateInfo.allTimes[j]);
                timeTD.innerHTML = dateInfo.allTimes[j];
                memberTD.innerHTML = "Empty";

                newRow.appendChild(timeTD);
                newRow.appendChild(memberTD);
                if(j !== dateInfo.allTimes.length-1){
                    //Call to update
                    getMembers(dateInfo.date, dateInfo.allTimes[j]);

                    // Append to table
                    document.getElementById("date-"+ (i-locationIndex) + "-sub-tab").appendChild(newRow);
                }

                // Select options
                let optionString = "<option value='" + dateInfo.allTimes[j] + "'>" + dateInfo.allTimes[j] + "</option>";
                if(j !== dateInfo.allTimes.length-1){
                    document.getElementById("startHour-"+(i-locationIndex)).innerHTML += (optionString);
                }
                if(j !== 0){
                    document.getElementById("endHour-"+(i-locationIndex)).innerHTML += (optionString);
                }

                // if(j === dateInfo.allTimes.length-1){
                    document.getElementById("topSpinner").style.visibility = "hidden";
                // }
            }
        }
        else{
            document.getElementById("date-" + (i-locationIndex)).style.visibility = "hidden";
        }
    }
}


function getLocations(){
    document.getElementById("topSpinner").style.visibility = "visible";

    startSchedDate = new Date();/* TODO */
    endSchedDate = new Date();
    endSchedDate.setDate(endSchedDate.getDate() + (7-endSchedDate.getDay()) - (endSchedDate.getDay() == 0?7:1));
    startSchedDate.setDate(startSchedDate.getDate() - startSchedDate.getDay() + (startSchedDate.getDay() == 0? -6:1));

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
            let dateObj = {};
            var data = response.feed.entry[i];
            var date = data.gsx$date.$t;
            var location = data.gsx$location.$t;
            var time = data.gsx$timerange.$t;
            var dateStr = new Date( date.split("-")[0], date.split("-")[1]-1, date.split("-")[2],0,0,0,0);    
            
            let currentDate = new Date();
            currentDate.setHours(0, 0, -1, 999);
            if(dateStr.getTime() >= currentDate.getTime()){

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

                // console.log(allTimes);
                dateObj = {
                    "date": date,
                    "location": location,
                    "timeStr": time,
                    "startTime": new Date(timeObj[0]),
                    "endTime": new Date(timeObj[1]),
                    "allTimes": allTimes
                };
                locationInfo[date] = dateObj;
                document.getElementById("topSpinner").style.visibility = "hidden";
            }     
        }
       viewScheduleForDate(0);
    });
}