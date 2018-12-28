

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
            viewScheduleForDate();
        });
    }
}

function getMembers(date, time){
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
            console.log("All Times: " + allTimes);
            if(date === dateChosen){
                if(allTimes.includes(time)){
                    allMembers += name + "\n";
                }
            }
        }
        console.log(allMembers);
        if(allMembers != ""){
            document.getElementById(dateChosen+"-"+time).innerHTML = allMembers;
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
                    let memberTD = document.createElement("td");
                    memberTD.setAttribute("colspan", 2);
                    memberTD.setAttribute("id", date+"-"+allTimes[j]);
                    timeTD.innerHTML = allTimes[j];
                    memberTD.innerHTML = "Empty";
                    //Call to update
                    getMembers(date, allTimes[j])

                    newRow.appendChild(timeTD);
                    newRow.appendChild(memberTD);
                    document.getElementById("date-"+ i + "-sub-tab").appendChild(newRow);

                    // Select options
                    let optionString = "<option value='" + allTimes[j] + "'>" + allTimes[j] + "</option>";
                    if(j != allTimes.length-1){
                        document.getElementById("startHour-"+i).innerHTML += (optionString);
                    }
                    if(j != 0){
                        document.getElementById("endHour-"+i).innerHTML += (optionString);
                    }
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