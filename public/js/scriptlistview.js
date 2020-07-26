import {loadImages} from './util.js';

let markers = {};


const request = async() => {
    const response = await fetch('https://dev.adrianturtoczki.com/get-markers');
    const json = await response.json();
    markers = JSON.parse(json);
    //console.log(markers[markers.length-1].id+1);
    createMarkers();
}

request();

function createMarkers(){

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