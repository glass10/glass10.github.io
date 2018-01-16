var CLIENT_ID = '741003728693-o30686b65lf3np0fd6lbhngfhmv5oqkh.apps.googleusercontent.com'
var API_KEY = 'AIzaSyAtQULaPG_AsmOKmsWESJEESDuqOPs8IdU'
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Committee Spreadsheet IDS
var sheetIDS = {
                "artsAndCulture":'1mbu-7VK5mqQk2FNKwwk0b5CGbXt1nGaW53rVa4lbvPc',
                "currentEvents":'12a9SZndguVFyRlO8xbAj9vLQ5J45Dmn8DIeEBenVOSY',
                "entertainment":'1CwhXGiTaf8QZHMfSOiBkF2CrqQlPRYPiB0-j-BHADRI',
                "publicity":'1rU7315Nl-fZpTU2YCRcKWUmYUBqlSLMfhFEJ7e8slf8',
                "purdueAfterDark":'1cYa09UftGhaE8ExG9bJnuxwAgalSbY4-t5abFZY1QPQ',
                "spiritAndTraditions":'1r7cxTeWDccKVAp4_cd9BKSnhxqRxQv9goxEYafTPv5I'
}

//All Committee Data
var committees = {"artsAndCulture": [], 
                    "currentEvents": [], 
                    "entertainment": [],
                    "publicity": [],
                    "purdueAfterDark": [], 
                    "spiritAndTraditions": []};

var committeeList = ["artsAndCulture", "currentEvents", "entertainment", "publicity", "purdueAfterDark", "spiritAndTraditions"];

//All Intercommittee Points
var points = {"artsAndCulture": 0, 
                    "currentEvents": 0,
                    "entertainment": 0, 
                    "publicity": 0,
                    "purdueAfterDark": 0,
                    "spiritAndTraditions": 0
    }

//Current Information
var currentCommittee = "";
var currentName = "";
var currentData = {};

function load(){
    for(var i = 0; i < committeeList.length; i++){
        data(committeeList[i]);
    }
}

function data(committee){
    console.log('Loading ' + committee + ' data');
    if(committees[committee].length !== 0){
        committees[committee] = [];
    }

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": 'https://spreadsheets.google.com/feeds/list/' + sheetIDS[committee] + '/1/public/full?alt=json-in-script',
        "method": "GET",
        "headers": {
            // "id": CLIENT_ID,
            // "secret": API_KEY,
            // "Access-Control-Allow-Origin": "*",
            // "Access-Control-Allow-Credentials": "true",
            // "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
            // "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"

        }
    }
          
    $.ajax(settings).done(function (response) {
        //console.log(response);
        response = response.substring(response.indexOf("{"), response.length-2)
        var response = JSON.parse(response);
        console.log(response);
        for(var i = 0; i < response.feed.entry.length; i++){
            if(i !== response.feed.entry.length-1){
                var tempName = response.feed.entry[i].gsx$name.$t;
                var tempPin = response.feed.entry[i].gsx$pin.$t;
                var tempID = response.feed.entry[i].gsx$sheetid.$t;
                var tempHours = response.feed.entry[i].gsx$hours.$t;
                var tempPoints = response.feed.entry[i].gsx$points.$t;
    
                committees[committee].push({name: tempName, pin: tempPin, id: tempID, number: i+2, hours: tempHours, points: tempPoints});
                
            }
            else{
                var tempHours = response.feed.entry[i].gsx$committeehours.$t
                var tempPoints = response.feed.entry[i].gsx$committeepoints.$t
                
                committees[committee].push({totalHours: tempHours, totalPoints: tempPoints});

                if(tempPoints > 100){
                    var height = 100;
                }
                else{
                    var height = tempPoints;
                }

                points[committee] = tempPoints; //for intercommittee points
                document.getElementById(committee + "LI").style = "height: " + height + "%"
                document.getElementById(committee + "LI").title = tempPoints;
                document.getElementById(committee + "TXT").textContent = tempPoints;
            }
        }
        console.log(committees[committee]);
    });
    console.log("Data Loaded Successfully");
}
    

function committeeChange(){
    $("#memberSelect").empty();
    var select = document.getElementById("committeeSelect");
    var text = select.options[select.selectedIndex].text; //committee Text
    text = text.substring(0,1).toLowerCase() + text.substring(1, text.length);
    text = text.replace(/\s/g, '') //Manipulation Done

    var optionsAsString = "";
    for(var i = 0; i < committees[text].length-1; i++){
        optionsAsString += "<option value='" + committees[text][i].name + "'>" + committees[text][i].name + "</option>";
    }
    $("#memberSelect").html(optionsAsString);
    console.log("Members Updated");

}

function login(){
    console.log("Login Attempted");
    var selectedCommittee = document.getElementById("committeeSelect");
    var selectedUser = document.getElementById("memberSelect");

    var committee = selectedCommittee.options[selectedCommittee.selectedIndex].text;
    var user = selectedUser.options[selectedUser.selectedIndex].text;

    if(committee === 'Select Your Committee' || user === 'Committee Not Selected'){
        unsuccessfulLogin("Committee and/or Member Information Missing");
    }
    else{
        
        committee = committee.substring(0,1).toLowerCase() + committee.substring(1, committee.length);
        committee = committee.replace(/\s/g, '') //Manipulation Done

        var pinInput = document.getElementById("pinText").value;

        console.log(committee + ", " + user + ", " + pinInput);

        for(var i = 0; i < committees[committee].length; i++){
            if(committees[committee][i].name === user){
                if(committees[committee][i].pin === pinInput){
                    console.log("Successful Login");
                    successfulLogin(committees[committee][i], committee);
                }
                else{
                    unsuccessfulLogin("Incorrect PIN");
                }
                i = committees[committee].length;
            }
        }
    }

    
}

function successfulLogin(data, committee){
    document.getElementById("memberArea").style.display = "block"
    //Populate Member Section 
    document.getElementById("currentMember").textContent = data.name;
    document.getElementById("userHours").textContent = data.hours;
    document.getElementById("userPoints").textContent = data.points;

    //Setting Globals
    currentCommittee = committee;
    currentName = data.name;
    currentData = data;

    //Display Hour Sheet
    updateHoursSheet(data, committee);
}

function updateHoursSheet(data, committee){
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": 'https://spreadsheets.google.com/feeds/list/' + sheetIDS[committee] + '/' + data.number + '/public/full?alt=json-in-script',
        "method": "GET",
        "headers": {
            // "id": CLIENT_ID,
            // "secret": API_KEY,
        }
    }
          
    $.ajax(settings).done(function (response) {
        response = response.substring(response.indexOf("{"), response.length-2)
        var response = JSON.parse(response);
        console.log(response);

        var totalHours = 0;
        var totalPoints = 0;
        var tableHTML = `
            <thead>
                <tr class="table-expand-row"> 
                    <th width="200">Date</th>
                    <th>Event</th>
                    <th width="150">Hours</th>
                    <th width="150">Points</th>
                </tr>
            </thead>
        <tbody>`;

        for(var i = 0; i < response.feed.entry.length; i++){
            var data = response.feed.entry[i];
            if(i == 0){
                totalHours = data.gsx$hourstotal.$t;
                totalPoints = data.gsx$pointstotal.$t;
            }

            if(data.gsx$hourstotal.$t === "" || i === 0 ){
                var date = data.gsx$date.$t;
                var event = data.gsx$event.$t;
                var hours = data.gsx$hours.$t;
                var points = data.gsx$points.$t;
    
                tableHTML += 
                    `<tr class="table-expand-row" data-open-details>
                        <td>` + date + `</td>
                        <td>` + event + `</td>
                        <td>` + hours + `</td>
                        <td>` + points + `</td>
                    </tr>`;
            }
        }
            

        tableHTML += 
            `<tr class="table-expand-row" data-open-details>
                <td style="visibility:hidden"></td>
                <td style="visibility:hidden"></td>
                <td><b>` + totalHours + `</b></td>
                <td><b>` + totalPoints + `</b></td>
             </tr>
        </tbody>`;

        $('#hoursTable').html(tableHTML);

        document.getElementById("userHours").textContent = totalHours;
        document.getElementById("userPoints").textContent = totalPoints;
    });
    console.log("Member Hours Updated Successfully");
}

function unsuccessfulLogin(reason){
    console.log("Unsuccessful Login");
    alert("Login Unsuccessful: " + reason)
}

function addHours(){
    var date = document.getElementById("dateInput").value;
    var event = document.getElementById("eventInput").value;
    var hours = document.getElementById("hoursInput").value;

    var select = document.getElementById("eventType");
    var multiplier = select.options[select.selectedIndex].value; 

    var intercommitteeOptions = ["No", "", "Yes"];
    var intercommittee = intercommitteeOptions[multiplier];
    var points = hours * multiplier;

    var settings = {
        // "async": true,
        // "crossDomain": true,
        "url": 'https://script.google.com/macros/s/AKfycbxsLiZpXYRBjCN2Eo5GYvxmv-BDoMu9JcX2CX2LSRldleYlxPM/exec',
        "type": "post",
        //"dataType": "json",
        "data":{
            "Member": currentName,
            "Date": date,
            "Event": event,
            "Hours": hours,
            "Intercommittee": intercommittee,
            "Points": points
        }
    }
          
    $.ajax(settings).done(function (response) {
        updateHoursSheet(currentData, currentCommittee); //called after POST made successfully
    });
    
}

