let markers = {};
let marker = {};

let datadiv = document.createElement("div");
let imagediv = document.createElement("div");

const request = async() => {
    const response = await fetch('https://dev.adrianturtoczki.com/get-markers');
    const json = await response.json();
    markers = JSON.parse(json);

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');

    marker = markers.find(e=>e.id==id);

    document.getElementById('marker').value=id;

    createMarker();
}

request();

function createMarker(){

        const markerdiv = document.querySelector('#markerdiv');
        let h1 = document.createElement("h1");
        h1.innerHTML = marker.name;
        let p = document.createElement("p");
        p.innerHTML = marker.description;
        datadiv.style="border:solid";

        markerdiv.appendChild(datadiv);
        markerdiv.appendChild(imagediv);
        datadiv.appendChild(h1);
        datadiv.appendChild(p);
        let pimages = document.createElement("p");
        pimages.innerHTML = "Uploaded images:";
        imagediv.appendChild(pimages);
        loadImages(marker.id,imagediv);
        };

    async function loadImages(id,imagediv){
      fetch('https://dev.adrianturtoczki.com/get-photos')
    .then(
      function(response) {
        response.json().then(function(data) {
            data = JSON.parse(data);
          for (let row of data){
              if (row.marker==id){
                let image = document.createElement("img");
                image.src = "/uploads/"+row.id;
                image.alt = row.marker;
                image.style = "max-width:200px; max-height:200px height:auto;";
                imagediv.appendChild(image);
              }
          }
        });
        
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
    }