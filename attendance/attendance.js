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
        updateHoursSheet(storageObj, storageObj.committee);
    }
}