var CLIENT_ID = '741003728693-o30686b65lf3np0fd6lbhngfhmv5oqkh.apps.googleusercontent.com'
var API_KEY = 'AIzaSyAtQULaPG_AsmOKmsWESJEESDuqOPs8IdU'
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Committee Spreadsheet IDS
var sheetIDS = {
    "artsAndCulture": '1mbu-7VK5mqQk2FNKwwk0b5CGbXt1nGaW53rVa4lbvPc',
    "currentEvents": '12a9SZndguVFyRlO8xbAj9vLQ5J45Dmn8DIeEBenVOSY',
    "entertainment": '1CwhXGiTaf8QZHMfSOiBkF2CrqQlPRYPiB0-j-BHADRI',
    "publicity": '1rU7315Nl-fZpTU2YCRcKWUmYUBqlSLMfhFEJ7e8slf8',
    "purdueAfterDark": '1cYa09UftGhaE8ExG9bJnuxwAgalSbY4-t5abFZY1QPQ',
    "spiritAndTraditions": '1r7cxTeWDccKVAp4_cd9BKSnhxqRxQv9goxEYafTPv5I'
}

//All Committee Data
var committees = {
    "artsAndCulture": [],
    "currentEvents": [],
    "entertainment": [],
    "publicity": [],
    "purdueAfterDark": [],
    "spiritAndTraditions": []
};

var committeeList = ["artsAndCulture", "currentEvents", "entertainment", "publicity", "purdueAfterDark", "spiritAndTraditions"];

//All Intercommittee Points
var points = {
    "artsAndCulture": 0,
    "currentEvents": 0,
    "entertainment": 0,
    "publicity": 0,
    "purdueAfterDark": 0,
    "spiritAndTraditions": 0
}

var scripts = {
    "artsAndCulture": "https://script.google.com/macros/s/AKfycbwHZInpf-2XVeATHRFTi2s2KMFh5odvbvGvLYmdVah-Mc0j1ss/exec",
    "currentEvents": "https://script.google.com/macros/s/AKfycbxNNSZ-oIRBXZUm1I6isLwo0LpNQxpI-y6Gur_9-Jmu2Hcwo7E/exec",
    "entertainment": "https://script.google.com/macros/s/AKfycbx5kmyOMiui5joHakz-RDs5AtHYI64I7BBZ_rkLBWVww5RClrw/exec",
    "publicity": "https://script.google.com/macros/s/AKfycbxsLiZpXYRBjCN2Eo5GYvxmv-BDoMu9JcX2CX2LSRldleYlxPM/exec",
    "purdueAfterDark": "https://script.google.com/macros/s/AKfycbwsOqIWytba8oZvq9NaZ1bshNIkKPD2-jwrfOILRVcQVosB0j4/exec",
    "spiritAndTraditions": "https://script.google.com/macros/s/AKfycbyCj7FY0DXRp1T_gTH6mM261puqhUGqIvIXdGo5Yp-FXJ5VUqk/exec"
}

//Current Information
var currentCommittee = "";
var currentName = "";
let heights = {};
let dataCount = 0;
const EVENTS_SHEET_ID = '1py0YY2fFxSNHxGVZcq4deaQspIDGOeyFU5R8_S9TK1s';
var eventsData = []

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

        // Handle BOD
        if(firstName === "Director"){
            document.getElementById("hoursNav").remove();

            if(committeeList.indexOf(currentCommittee) === -1){
                document.getElementById("attendanceNav").remove();
            }
        }
        else{
            document.getElementById("attendanceNav").remove();
        }
    

        // Intercommittee
        heights = {};
        for (var i = 0; i < committeeList.length; i++) {
            data(committeeList[i]);
        }

        //calendar
        getCalendarValues();
    }
    String.prototype.format = function() {
        a = this;
        for (k in arguments) {
          a = a.replace("{" + k + "}", arguments[k])
        }
        return a
      }
}

function pad0(i) {
    return pad(i,2,0);

}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function getCalendarValues(){
    var calendarEl = document.getElementById('calendar');

    //fetch events

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": 'http://spreadsheets.google.com/feeds/list/'+EVENTS_SHEET_ID+'/1/public/full?alt=json-in-script',
        "method": "GET",
        "headers": {
        }
    }

    $.ajax(settings).done(function (response) {
        //console.log('resp',response);
        response = response.substring(response.indexOf("{"), response.length - 2)
        var response = JSON.parse(response);
        //console.log(response);
        for (var i = 0; i < response.feed.entry.length; i++) {
            //console.log(response.feed.entry[i]);
            var eventDate = response.feed.entry[i].gsx$date.$t;
            var eventTimeStart =  response.feed.entry[i].gsx$time.$t;
            if(eventDate!='' && eventTimeStart!=''){
                var eventTimeEnd = eventTimeStart.substring(eventTimeStart.indexOf('- ') + 2)
                eventTimeStart = eventTimeStart.substring(0,eventTimeStart.indexOf(' - '));
                eventTimeEnd = eventTimeEnd.substring(eventTimeEnd.length-2)=='am'?
                                    pad0((parseInt((eventTimeEnd.split(':')[0]))+12)) + ':'
                                        +eventTimeEnd.split(':')[1].substring(0,eventTimeEnd.split(':')[1].length-2)
                                            :pad(eventTimeEnd.substring(0,eventTimeEnd.length-2),5,0); //assuming start and end on everything
                eventTimeStart = eventTimeStart.substring(eventTimeStart.length-2)=='am'?
                                    pad0(parseInt((eventTimeStart.split(':')[0]))+12) + ':'
                                        +eventTimeStart.split(':')[1].substring(0,eventTimeStart.split(':')[1].length-2)
                                            :pad(eventTimeStart.substring(0,eventTimeStart.length-2),5,0); //assuming start and end on everything
                eventDates = eventDate.split('-')
                eventTimeStart += ':00'
                eventTimeEnd += ':00'
                var eventDateStart = (eventDate.split('-').length==1)?eventDate:eventDate.split('-')[0];
                var eventDateEnd = (eventDate.split('-').length==1)?eventDate:eventDate.split('-')[1]
                eventDateStart = eventDateStart.split('/')[2]+'-'+pad0(eventDateStart.split('/')[0])+'-'+pad0(eventDateStart.split('/')[1]);
                eventDateEnd = eventDateEnd.split('/')[2]+'-'+pad0(eventDateEnd.split('/')[0])+'-'+pad0(eventDateEnd.split('/')[1]);
                var startTime = eventDateStart+'T'+eventTimeStart;
                var endTime = eventDateEnd+'T'+eventTimeEnd;
                eventsData.push({
                    title: response.feed.entry[i].gsx$event.$t,
                    timeZone: 'local',
                    start: startTime,
                    end: endTime,
                })
            }

        }

        console.log(eventsData);

        var calendar = new FullCalendar.Calendar(calendarEl, {
            plugins: [ 'dayGrid', 'timeGrid', 'list' ],
            events: /* [
                { // this object will be "parsed" into an Event Object
                title: 'The Test', // a property!
                timeZone: 'local',
                start: '2019-07-01', // a property!
                end: '2019-07-02' // a property! ** see important note below about 'end' **
                },
                { // this object will be "parsed" into an Event Object
                    title: 'The Test time', // a property!
                    timeZone: 'local',
                    start: '2019-07-01T12:30:00', // a property!
                    end: '2019-07-01T16:30:00' // a property! ** see important note below about 'end' **
                }
            ] */eventsData,

        });
        calendar.render();
        
    });
    
}

function data(committee) {
    console.log('Loading ' + committee + ' data');
    if (committees[committee].length !== 0) {
        committees[committee] = [];
    }

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": 'https://spreadsheets.google.com/feeds/list/' + sheetIDS[committee] + '/1/public/full?alt=json-in-script',
        "method": "GET",
        "headers": {
        }
    }

    $.ajax(settings).done(function (response) {
        //console.log(response);
        response = response.substring(response.indexOf("{"), response.length - 2)
        var response = JSON.parse(response);
        console.log(response);
        for (var i = 0; i < response.feed.entry.length; i++) {
            if (i !== response.feed.entry.length - 1) {
                var tempName = response.feed.entry[i].gsx$name.$t;
                var tempPin = response.feed.entry[i].gsx$pin.$t;
                var tempID = response.feed.entry[i].gsx$sheetid.$t;
                var tempHours = response.feed.entry[i].gsx$hours.$t;
                var tempPoints = response.feed.entry[i].gsx$points.$t;

                committees[committee].push({ name: tempName, pin: tempPin, id: tempID, number: i + 2, hours: tempHours, points: tempPoints });

            }
            else {
                var tempHours = response.feed.entry[i].gsx$committeehours.$t
                var tempPoints = response.feed.entry[i].gsx$committeepoints.$t

                committees[committee].push({ totalHours: tempHours, totalPoints: tempPoints });

                var height = tempPoints;

                points[committee] = tempPoints; //for intercommittee points
                document.getElementById(committee + "LI").style = "height: " + height + "%";
                heights[committee] = height;
                document.getElementById(committee + "LI").title = tempPoints;
                document.getElementById(committee + "TXT").textContent = tempPoints;
            }
        }
        console.log(committees[committee]);

        dataCount++;
        if (dataCount === 6) {
            calculateHeight();
        }
    });
    console.log("Data Loaded Successfully");
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

