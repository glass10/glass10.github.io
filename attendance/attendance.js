var CLIENT_ID = '769441401372-9llk2flchfa6uusfpqkuer5ai5eahdml.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAsC9gY5zRn5qS_bqTkZBJgsAITmMBpIAQ';

var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

var currentCommittee = "";
var currentName = "";

function logout(){
    console.log("Logout Attempted");
    localStorage.removeItem("psubPortal");
    window.location.replace("../index.html");
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
        let firstName = currentName.substring(0, currentName.indexOf(" "));
        document.getElementById("navName").innerHTML = `Hi, ${firstName}!`;
        
        loadAttendance();
    }   
}
function loadAttendance() {
    var committeeListed = ["artsAndCulture", "currentEvents", "entertainment", "publicity", "purdueAfterDark", "spiritAndTraditions"];
        var committee = 0;
        
        console.log(currentCommittee);
        for(var x = 0; x < committeeListed.length; x++) {
            if(currentCommittee == committeeListed[x]) {
                console.log("found committee %s", x+1);
                committee = x+1;
            }
        }
        console.log("commitee %s", committeeListed[committee-1]);
        
        
        var sheetUrl = 'https://spreadsheets.google.com/feeds/cells/1xHh-igylkYXPXMEArgNJISWYgsJPMqo9ijUM72gmy58/' + committee + '/public/full?alt=json';
        $.getJSON(sheetUrl, function(data){
          var entry = data.feed.entry;
          console.log(entry);
            
            var columns = entry[entry.length-1].gs$cell.col
            console.log("columns: %s", columns);
            
            var eventNames = []; // array of events
            var dates = []; // array of dates
            var attendanceArray = []; // array of attendance
            var row = 0; // row of found row
                        
            //parses member and its attendance values
            for(var x = 0; x < entry.length; x++){
                if(entry[x].gs$cell.row == 1 && entry[x].gs$cell.col != "1") {
                    eventNames.push(entry[x].content.$t);
                }
                if(entry[x].gs$cell.row == 2 && entry[x].gs$cell.col != "1") {
                    dates.push(entry[x].content.$t);
                }
                if(entry[x].gs$cell.col == "1" && entry[x].content.$t == currentName) {
                    row = (x)/columns+1;
                }
                if(entry[x].gs$cell.row == row && entry[x].gs$cell.col != "1"){
                    attendanceArray.push(entry[x].content.$t);
                }
            }
            console.log("dates: %s", dates.toString()); // array of all dates
            console.log("events: %s", eventNames.toString()); // array of all events
            console.log("attendance: %s", attendanceArray.toString()); // array of all attendance
            console.log("row: %s", row); // row of current member
            
            for(var x = 0; x < dates.length; x++) {
                let tempTR = document.createElement("tr");

                    let date = document.createElement("td");
                    date.innerHTML = dates[x];
                    let event = document.createElement("td");
                    event.innerHTML = eventNames[x];
                    let attendance = document.createElement("td");
                    attendance.innerHTML = attendanceArray[x];

                    tempTR.appendChild(date);
                    tempTR.appendChild(event);
                    tempTR.appendChild(attendance);

                    document.getElementById("tableBody").appendChild(tempTR);
            }
        });
}