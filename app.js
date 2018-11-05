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
var currentData = {};
let heights = {};
let dataCount = 0;

function load() {
    heights = {};
    for (var i = 0; i < committeeList.length; i++) {
        data(committeeList[i]);
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


function committeeChange() {
    $("#memberSelect").empty();
    var select = document.getElementById("committeeSelect");
    var text = select.options[select.selectedIndex].text; //committee Text
    text = text.substring(0, 1).toLowerCase() + text.substring(1, text.length);
    text = text.replace(/\s/g, '') //Manipulation Done

    var optionsAsString = "";
    for (var i = 0; i < committees[text].length - 1; i++) {
        optionsAsString += "<option value='" + committees[text][i].name + "'>" + committees[text][i].name + "</option>";
    }
    $("#memberSelect").html(optionsAsString);
    console.log("Members Updated");

}

document.getElementById('login-form').onkeydown = function(e){
    // Login on Enter
    if(e.keyCode == 13){
      login();
    }
 };

function login() {
    console.log("Login Attempted");
    var selectedCommittee = document.getElementById("committeeSelect");
    var selectedUser = document.getElementById("memberSelect");

    var committee = selectedCommittee.options[selectedCommittee.selectedIndex].text;
    var user = selectedUser.options[selectedUser.selectedIndex].text;

    if (committee === 'Select Your Committee' || user === 'Committee Not Selected') {
        unsuccessfulLogin("Committee and/or Member Information Missing");
    }
    else {

        committee = committee.substring(0, 1).toLowerCase() + committee.substring(1, committee.length);
        committee = committee.replace(/\s/g, '') //Manipulation Done

        var pinInput = document.getElementById("pinText").value;

        console.log(committee + ", " + user + ", " + pinInput);

        for (var i = 0; i < committees[committee].length; i++) {
            if (committees[committee][i].name === user) {
                if (committees[committee][i].pin === pinInput) {
                    console.log("Successful Login");
                    successfulLogin(committees[committee][i], committee);
                }
                else {
                    unsuccessfulLogin("Incorrect PIN");
                }
                i = committees[committee].length;
            }
        }
    }


}

function successfulLogin(data, committee) {

    document.getElementById("memberArea").style.display = "block";
    $('html, body').animate({
        scrollTop: $("#memberArea").offset().top
    }, 2000);

    //Populate Member Section 
    document.getElementById("currentMember").textContent = data.name;
    // document.getElementById("userHours").textContent = data.hours;
    // document.getElementById("userPoints").textContent = data.points;

    //Setting Globals
    currentCommittee = committee;
    currentName = data.name;
    currentData = data;

    //Display Hour Sheet
    updateHoursSheet(data, committee);
}

function updateHoursSheet(data, committee) {
    document.getElementById("tableBody").innerHTML = "";
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
        response = response.substring(response.indexOf("{"), response.length - 2)
        var response = JSON.parse(response);
        console.log(response);

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
                var event = data.gsx$event.$t;
                var hours = data.gsx$hours.$t;
                var points = data.gsx$points.$t;

                let args = {
                    "date": date,
                    "event": event,
                    "hours": hours,
                    "points": points
                };

                let tempTR = document.createElement("tr");
                tempTR.classList = "table-expand-row";
                tempTR.addEventListener("click", function () {
                    removeHours(args);
                })

                let dateTD = document.createElement("td");
                dateTD.innerHTML = date;
                let eventTD = document.createElement("td");
                eventTD.innerHTML = event;
                let hoursTD = document.createElement("td");
                hoursTD.innerHTML = hours;
                let pointsTD = document.createElement("td");
                pointsTD.innerHTML = points;

                tempTR.appendChild(dateTD);
                tempTR.appendChild(eventTD);
                tempTR.appendChild(hoursTD);
                tempTR.appendChild(pointsTD);

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

function unsuccessfulLogin(reason) {
    console.log("Unsuccessful Login");
    alert("Login Unsuccessful: " + reason)
}

function addHours() {
    var date = document.getElementById("dateInput").value;
    var event = document.getElementById("eventInput").value;
    var hours = document.getElementById("hoursInput").value;

    if (date === "" || event === "" || hours === "") {
        alert("Please provide values for all event details");
    }
    else {
        var select = document.getElementById("eventType");
        var multiplier = select.options[select.selectedIndex].value;

        var intercommitteeOptions = ["No", "Yes", "Yes"];
        var intercommittee = intercommitteeOptions[multiplier];
        var points = hours * multiplier;

        console.log(scripts[currentCommittee]);

        var settings = {
            "url": scripts[currentCommittee],
            "type": "POST",
            //"dataType": "json",
            "data": {
                "Member": currentName,
                "Date": date,
                "Event": event,
                "Hours": hours,
                "Intercommittee": intercommittee,
                "Points": points
            }
        }

        $.ajax(settings).done(function (response) {
            document.getElementById("dateInput").value = "";
            document.getElementById("eventInput").value = "";
            document.getElementById("hoursInput").value = "";
            document.getElementById("eventType").selectedIndex = 0;

            document.getElementById("confirmMessage").innerHTML = event + " Added Successfully";

            updateHoursSheet(currentData, currentCommittee); //called after POST made successfully
        });
    }
}

function removeHours(rowInfo) {
    let verify = confirm("Are you sure you want to remove " + rowInfo.event + "?");

    if (verify) {
        var settings2 = {
            "url": scripts[currentCommittee],
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

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Committee', "Points", { role: 'annotation' }],
        ['Arts and Culture', 1000, 'Test'],
        ['Current Events', 1170, 'Test'],
        ['Entertainment', 660, 'Test'],
        ['Purdue After Dark', 660, 'Test'],
        ['Publicity', 1030, 'Test'],
        ['Spirit and Traditions', 660, 'Test'],
    ]);
    var view = new google.visualization.DataView(data);
    var options = {
        backgroundColor: 'transparent',
        // colors: ['#2196e3', '#909090', '#2196e3', '#2196e3', '#2196e3', '#2196e3'],
        colors: ['white', 'black', 'black', 'black', 'green', 'red'],
        legend: { position: 'none' },
        bars: 'horizontal', // Required for Material Bar Charts.
        vAxis: {
            title: 'Committees',
            titleTextStyle: { color: 'white' }
        },

        bar: { groupWidth: "90%" }
    };

    var chart = new google.charts.Bar(document.getElementById('barchart_material'));

    chart.draw(data, google.charts.Bar.convertOptions(options));
}


function adjustTheme(){
    let button = document.getElementById("themeToggle");
    if(button.innerHTML == "Turn Off Theme"){
        document.getElementsByClassName("body")[0].id = "normalTheme";
        button.innerHTML = "Turn On Theme";
        document.getElementsByTagName("canvas")[0].style.display = "none";
        document.getElementById("logo").src="Logo.png"
    }
    else{
        document.getElementsByClassName("body")[0].id = "particles-js";
        button.innerHTML = "Turn Off Theme";
        document.getElementsByTagName("canvas")[0].style.display = "block";
        document.getElementById("logo").src="Logo-Thanksgiving.png";
    }
}

//   Particles
particlesJS("particles-js", {"particles":{"number":{"value":19,"density":{"enable":true,"value_area":800}},"color":{"value":"#fff"},"shape":{"type":"image","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":5},"image":{"src":"https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/146/maple-leaf_1f341.png","width":100,"height":100}},"opacity":{"value":0.5,"random":true,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":20.042650760819036,"random":true,"anim":{"enable":false,"speed":40,"size_min":1.6241544246026904,"sync":false}},"line_linked":{"enable":false,"distance":500,"color":"#ffffff","opacity":0.4,"width":2},"move":{"enable":true,"speed":3,"direction":"bottom","random":true,"straight":false,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":600,"rotateY":1200}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":false,"mode":"bubble"},"onclick":{"enable":false,"mode":"repulse"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":0.5}},"bubble":{"distance":400,"size":4,"duration":0.3,"opacity":1,"speed":3},"repulse":{"distance":200,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true});var count_particles, stats, update; stats = new Stats; stats.setMode(0); stats.domElement.style.position = 'absolute'; stats.domElement.style.left = '0px'; stats.domElement.style.top = '0px'; document.body.appendChild(stats.domElement); count_particles = document.querySelector('.js-count-particles'); update = function() { stats.begin(); stats.end(); if (window.pJSDom[0].pJS.particles && window.pJSDom[0].pJS.particles.array) { count_particles.innerText = window.pJSDom[0].pJS.particles.array.length; } requestAnimationFrame(update); }; requestAnimationFrame(update);;
