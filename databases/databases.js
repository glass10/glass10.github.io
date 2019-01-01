var CLIENT_ID = '769441401372-9llk2flchfa6uusfpqkuer5ai5eahdml.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAsC9gY5zRn5qS_bqTkZBJgsAITmMBpIAQ';

var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

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
        let currentCommittee = storageObj.committee;
        let currentName = storageObj.name;
        let firstName = currentName.substring(0, currentName.indexOf(" "));
        document.getElementById("navName").innerHTML = `Hi, ${firstName}!`;
        
        //updateHoursSheet(storageObj, storageObj.committee);
        
        console.log("loading tables");
        loadData();
    }
}

function openTab(members) {
    console.log("hello")
    if(members == "members") {
        document.getElementById("membersTab").style.display = "block";
        document.getElementById("alumniTab").style.display = "none";
    }
    else{
        document.getElementById("membersTab").style.display = "none";
        document.getElementById("alumniTab").style.display = "block";        
    }    
}

function loadData(){
    
    //loads member data
    var sheetUrl = 'https://spreadsheets.google.com/feeds/cells/1TemP9aHFbiopXTMlZkx6AxJ-EEcLGlugC0-n9Mw0mC8/1/public/full?alt=json';
    $.getJSON(sheetUrl, function(data){
          let entry = data.feed.entry;
          console.log(entry);
            
            //shared values between members and alumni arrays
            var nameArray = []; // array of names
            var classArray = []; // array of classes
            var contactArray = []; //array of contact/emails
            
            //values presiding in only members
            var committeeArray = []; // array of commitee
            var majorArray = []; // array of majors
            
            //parses for information
            for(var x = 0; x < entry.length; x++){
                if(entry[x].gs$cell.row != 1){
                    if(entry[x].gs$cell.col == 1){
                        nameArray.push(entry[x].content.$t);
                    }
                    else if(entry[x].gs$cell.col == 5){
                        contactArray.push(entry[x].content.$t);
                    }

                    if(entry[x].gs$cell.col == 2){
                        committeeArray.push(entry[x].content.$t);
                        }
                        else if(entry[x].gs$cell.col == 3){
                        majorArray.push(entry[x].content.$t);
                        }
                        if(entry[x].gs$cell.col == 4){
                        classArray.push(entry[x].content.$t);
                        }
                }
            }
            
            for(var x = 0; x < nameArray.length; x++) {
                    let tempTR = document.createElement("tr");

                        let name = document.createElement("td");
                        name.innerHTML = nameArray[x];
                        let committee = document.createElement("td");
                        committee.innerHTML = committeeArray[x];
                        let major = document.createElement("td");
                        major.innerHTML = majorArray[x];
                        let clss = document.createElement("td");
                        clss.innerHTML = classArray[x];
                        let contact = document.createElement("td");
                        contact.innerHTML = contactArray[x];
                
                        tempTR.appendChild(name);
                        tempTR.appendChild(committee);
                        tempTR.appendChild(major);
                        tempTR.appendChild(clss);
                        tempTR.appendChild(contact);

                        document.getElementById("tableBodyMembers").appendChild(tempTR);
                }
        });
        
        //loads alumni data
        sheetUrl = 'https://spreadsheets.google.com/feeds/cells/1TemP9aHFbiopXTMlZkx6AxJ-EEcLGlugC0-n9Mw0mC8/2/public/full?alt=json';
        $.getJSON(sheetUrl, function(data){
          var entry = data.feed.entry;
          console.log(entry);
            
            //shared values between members and alumni arrays
            var nameArray = []; // array of names
            var classArray = []; // array of classes
            var contactArray = []; //array of contact/emails

            //values presiding in only alumni
            var positionArray = []; //array of positions
            var currentWork = [];
            
            //parses for information
            for(var x = 0; x < entry.length; x++){
                if(entry[x].gs$cell.row != 1){
                    if(entry[x].gs$cell.col == 1){
                        nameArray.push(entry[x].content.$t);
                    }
                    else if(entry[x].gs$cell.col == 5){
                        contactArray.push(entry[x].content.$t);
                    }

                    if(entry[x].gs$cell.col == 2){
                        classArray.push(entry[x].content.$t);
                    }
                    else if(entry[x].gs$cell.col == 3){
                    positionArray.push(entry[x].content.$t);
                    }
                    if(entry[x].gs$cell.col == 4){
                    currentWork.push(entry[x].content.$t);
                    }
                }
            }
            
            for(var x = 0; x < nameArray.length; x++) {
                    let tempTR = document.createElement("tr");

                        let name = document.createElement("td");
                        name.innerHTML = nameArray[x];
                        let clss = document.createElement("td");
                        clss.innerHTML = classArray[x];
                        let position = document.createElement("td");
                        position.innerHTML = positionArray[x];
                        let work = document.createElement("td");
                        work.innerHTML = positionArray[x];
                        let contact = document.createElement("td");
                        contact.innerHTML = contactArray[x];

                        tempTR.appendChild(name);
                        tempTR.appendChild(clss);
                        tempTR.appendChild(position);
                        tempTR.appendChild(work);
                        tempTR.appendChild(contact);

                        document.getElementById("tableBodyAlumni").appendChild(tempTR);
                }
        });
        console.log("finished loading table")
}