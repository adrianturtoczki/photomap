export function loadImages(id,imagediv){
    //load images test
  
    fetch('https://dev.adrianturtoczki.com/get-photos')
  .then(
    function(response) {
      response.json().then(function(data) {
          data = JSON.parse(data);
        for (var row of data){
            if (row.marker==id){
              var image = document.createElement("img");
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
