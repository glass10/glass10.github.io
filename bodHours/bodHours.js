var CLIENT_ID = '741003728693-o30686b65lf3np0fd6lbhngfhmv5oqkh.apps.googleusercontent.com'
var API_KEY = 'AIzaSyAtQULaPG_AsmOKmsWESJEESDuqOPs8IdU'
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

//All Committee Data
var committees = {
    "fineArts": [],
    "currentEvents": [],
    "entertainment": [],
    "publicity": [],
    "afterDark": [],
    "spiritAndTraditions": []
};

var committeeList = ["afterDark", "currentEvents", "entertainment", "publicity", "fineArts", "spiritAndTraditions", "boardofDirectors", "alumni", "inactive"];

//All Intercommittee Points
var points = {
    "fineArts": 0,
    "currentEvents": 0,
    "entertainment": 0,
    "publicity": 0,
    "afterDark": 0,
    "spiritAndTraditions": 0
}

var currentData;

var position = "";

var positionID = '1Fw1q1b4g7BZOsbKChoaWLf2QlETS9cxO15omLKBqUXs';
var positionArray = [];

var bodHours = '1qbhzwZuGyq7iwM6RhdtBaJGvXnlZBij-A0bu0EqN3y4';

var eventTypes = ["Required Event", "Office Hours", "Meeting", "Other"];

//Current Information
var currentCommittee = "";
var currentName = "";
var currentData = {};
let heights = {};
let dataCount = 0;

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
        let version = JSON.parse(localStorage.getItem("psubPortal")).version;
        if(version == null || parseInt(version, 10) < 2) {
            logout();
        }
        let firstName = currentName.substring(0, currentName.indexOf(" "));
        document.getElementById("navName").innerHTML = `Hi, ${firstName}!`;
        updateHoursSheet(storageObj, storageObj.committee);
        currentData = storageObj;
        
        // Handle BOD
        if(currentCommittee.localeCompare("boardofDirectors") != 0){
            window.location.replace("../hours/hours.html");
        }
        
        console.log("loading BOD names");
        console.log("currentName: " + currentName);
        loadBOD();
    }
}
    
function calculateHeight() {
    // Dynamic Height
    let maxHeight = 90;
    let tallest = 0;
    let heightValues = Object.values(heights);
    for (let i = 0; i < heightValues.length; i++) {
        if (heightValues[i] - tallest > 0) {
            tallest = heightValues[i];
        }
    }
    if (tallest > maxHeight) {
        // Recalculate heights
        let factor = maxHeight / tallest;
        for (var i = 0; i < committeeList.length; i++) {
            document.getElementById(committeeList[i] + "LI").style = "height: " + heights[committeeList[i]] * factor + "%";
        }
    }
}

function updateHoursSheet(data, committee) {
    document.getElementById("tableBody").innerHTML = "";
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": 'https://spreadsheets.google.com/feeds/list/' + bodHours + '/' +(data.number) + '/public/full?alt=json-in-script',
        "method": "GET",
        "headers": {
            // "id": CLIENT_ID,
            // "secret": API_KEY,
        }
    }

    $.ajax(settings).done(function (response) {
        response = response.substring(response.indexOf("{"), response.length - 2)
        var response = JSON.parse(response);
        console.log("got hours");
        
        var totalHours = 0;
        var totalPoints = 0;

        for (var i = 0; i < response.feed.entry.length; i++) {
            var data = response.feed.entry[i];
            if (i == 0) {
                totalHours = data.gsx$hourstotal.$t;
                totalPoints = data.gsx$pointstotal.$t;
            }

            if (data.gsx$hourstotal.$t === "" || i === 0) {
                var date = data.gsx$date.$t;
                var type = data.gsx$type.$t;
                var name = data.gsx$name.$t;
                var hours = data.gsx$hours.$t;
                var description = data.gsx$description.$t;

                let args = {
                    "date": date,
                    "type": type,
                    "name": name,
                    "hours": hours,
                };

                let tempTR = document.createElement("tr");
                // tempTR.classList = "table-expand-row";
                tempTR.addEventListener("click", function () {
                    removeHours(args);
                })

                let dateTD = document.createElement("td");
                dateTD.innerHTML = date;
                let nameTD = document.createElement("td");
                nameTD.innerHTML = name;
                let hoursTD = document.createElement("td");
                hoursTD.innerHTML = hours;
                let typeTD = document.createElement("td");
                typeTD.innerHTML = type;

                tempTR.appendChild(dateTD);
                tempTR.appendChild(nameTD);
                tempTR.appendChild(hoursTD);
                tempTR.appendChild(typeTD);

                document.getElementById("tableBody").appendChild(tempTR);

            }
        }

        let tempTR = document.createElement("tr");
        tempTR.classList = "table-expand-row-bottom";

        let dateTD = document.createElement("td");
        dateTD.innerHTML = "";
        dateTD.style = "visibility:hidden";
        let eventTD = document.createElement("td");
        eventTD.innerHTML = "";
        eventTD.style = "visibility:hidden";
        let hoursTD = document.createElement("td");
        hoursTD.innerHTML = totalHours;
        hoursTD.style = "font-weight: bold";
        let pointsTD = document.createElement("td");
        pointsTD.innerHTML = totalPoints;
        pointsTD.style = "font-weight: bold";

        tempTR.appendChild(dateTD);
        tempTR.appendChild(eventTD);
        tempTR.appendChild(hoursTD);
        tempTR.appendChild(pointsTD);

        document.getElementById("tableBody").appendChild(tempTR);
    });
    console.log("Member Hours Updated Successfully");
}

function loadBOD() {
    console.log("TEST LOADBOD");
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": 'https://spreadsheets.google.com/feeds/list/1Fw1q1b4g7BZOsbKChoaWLf2QlETS9cxO15omLKBqUXs/1/public/full?alt=json-in-script',
        "method": "GET",
        "headers": {
        }
    }

    $.ajax(settings).done(function (response) {
        response = response.substring(response.indexOf("{"), response.length - 2)
        var response = JSON.parse(response);
        console.log(response);
        console.log("HI");
        
                
        for (var i = 0; i < response.feed.entry.length; i++) {
            if (i !== response.feed.entry.length - 1) {
                var tempPosition = response.feed.entry[i].gsx$position.$t;
                var tempPerson = response.feed.entry[i].gsx$person.$t;
                var tempCommittee = response.feed.entry[i].gsx$previouscommittee.$t;

                positionArray.push({ position: tempPosition, person: tempPerson, previousCommittee: tempCommittee });

            }
        }
        console.log("POSSITION ARRAY");
        console.log("currentName: " + currentName);
        
        for(var z = 0; z < positionArray.length; z++) {
            console.log(positionArray[z].person);
            if(currentName.localeCompare(positionArray[z].person) == 0){
                console.log("match!");
                console.log(positionArray[z].position);
                position = positionArray[z].position;
                break;
            }
        }
        console.log("Position for current BOD Member: " + position);
    });
}

function setToday() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy+ '-' + mm + '-' + dd;
    
    document.getElementById("dateInput").value = today;
    console.log(today);
}

function addHours() {
    console.log("start voting");
    var date = document.getElementById("dateInput").value;
    var type = document.getElementById("eventType").value;
    var name = document.getElementById("eventInput").value;
    var hours = document.getElementById("hoursInput").value;
    var description = document.getElementById("descriptionInput").value;
    
    if (date === "" || event === "" || hours === "") {
        alert("Please provide values for all event details");
    }
    else {
        var select = document.getElementById("eventType");
        var multiplier = select.options[select.selectedIndex].value;

        var intercommitteeOptions = ["No", "Yes", "Yes"];
        var intercommittee = intercommitteeOptions[multiplier];
        var points = hours * multiplier;

        console.log("https://script.google.com/macros/s/AKfycbyPsj1RKE1FoMlUhW7uqFsvYnXGkuCJ8FK2QyuzoYW0FfDPDJ0s/exec");
        
        var settings = {
            "url": "https://script.google.com/macros/s/AKfycbyPsj1RKE1FoMlUhW7uqFsvYnXGkuCJ8FK2QyuzoYW0FfDPDJ0s/exec",
            "type": "POST",
            //"dataType": "json",
            "data": {
                "Member": position,
                "Date": date,
                "Type": eventTypes[type],
                "Name": name,
                "Hours": hours,
                "Description": description
            }
        }
        console.log(settings);

        $.ajax(settings).done(function (response) {
            //document.getElementById("dateInput").value = "";
            //document.getElementById("eventInput").value = "";
            //document.getElementById("eventType").selectedIndex = 0;
            //document.getElementById("hoursInput").value = "";
            //document.getElementById("descriptionInput").value = "";

            document.getElementById("confirmMessage").innerHTML = "Hours Added Successfully";

            console.log(currentData);
            console.log(currentCommittee);
            updateHoursSheet(currentData, currentData.committee); //called after POST made successfully
            
            console.log("worked");
        });
    }
}

function removeHours(rowInfo) {
    let verify = confirm("Are you sure you want to remove " + rowInfo.event + "?");

    if (verify) {
        var settings2 = {
            "url": "https://script.google.com/macros/s/AKfycbzrC5pep9PO0qCrXRS7dOylTt9nl2aGEchtHl1fEA/exec",
            "type": "GET", // not actual GET
            "data": {
                "Member": currentName,
                "Date": rowInfo.date,
                "Event": rowInfo.event,
                "Hours": rowInfo.hours,
                // "Intercommittee": intercommittee,
                "Points": rowInfo.points
            }
        }

        $.ajax(settings2).done(function (response) {
            document.getElementById("confirmMessage").innerHTML = rowInfo.event + " Removed Successfully";

            updateHoursSheet(currentData, currentCommittee); //called after GET made successfully
        });
    }
}

