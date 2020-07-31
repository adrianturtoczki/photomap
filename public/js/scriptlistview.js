import {loadImages} from './util.js';

let promise1 = fetch('/get-markers').then(response=>response.json());
let promise2 = fetch('/api/user-data').then(response=>response.json());

Promise.all([promise1,promise2]).then(data=>{
    const markers = JSON.parse(data[0]);
    const userdata = data[1];
    createMarkers(markers);
    setLoginstatus(userdata.username,document.querySelector('#loginstatus'));
    console.log("finished loading both fetches:",markers,"\n",userdata);
})

function setLoginstatus(user,loginstatus){
    console.log(user);
    if (Object.keys(user).length==0){
        loginstatus.innerHTML="<a href='/login-page'>Login</a> <a href='/signup-page'>Sign up</a>";
    } else {
        loginstatus.innerHTML="Welcome "+user+". Click <a href='/logout'>here</a> to log out";
    }
}

function createMarkers(markers){

  const markerdiv = document.querySelector('#markerdiv');

    for (let i = 0; i < markers.length; i++) {

        let datadiv = document.createElement("div");
        let imagediv = document.createElement("div");
    
        let marker = document.createElement("div");
        marker.style = "border:solid";

        let h1 = document.createElement("h1");
        h1.innerHTML = markers[i].name;
        let p = document.createElement("p");
        p.innerHTML = markers[i].description;

        let a = document.createElement("a");
        a.href = "https://dev.adrianturtoczki.com/id?id="+markers[i].id;
        a.textContent = "link";

        
        datadiv.appendChild(a);
        datadiv.appendChild(h1);
        datadiv.appendChild(p);
        markerdiv.appendChild(marker);
        marker.appendChild(datadiv);
        marker.appendChild(imagediv);

        let p2 = document.createElement("p");
        p2.innerHTML = "test";
        loadImages(markers[i].id,imagediv);

    }
}