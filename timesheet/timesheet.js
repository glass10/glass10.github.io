var CLIENT_ID = '741003728693-o30686b65lf3np0fd6lbhngfhmv5oqkh.apps.googleusercontent.com'
var API_KEY = 'AIzaSyAtQULaPG_AsmOKmsWESJEESDuqOPs8IdU'
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];


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
            getAttendance(currentCommittee);
        }
        else{
            document.getElementById("attendanceNav").remove();
            document.getElementById("timeNav").remove();
            window.location.replace("../hours/hours.html");
        }
    
    }   
}
var request;

function getAttendance(name){
    console.log(name)
    
}


function logout(){
    console.log("Logout Attempted");
    localStorage.removeItem("psubPortal");
    window.location.replace("../index.html");
}