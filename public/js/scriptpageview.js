const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('id');

let promise1 = fetch('/get-markers').then(response=>response.json());
let promise2 = fetch('/api/user-data').then(response=>response.json());

Promise.all([promise1,promise2]).then(data=>{
    const markers = JSON.parse(data[0]);
    const userdata = data[1];

    let marker = markers.find(e=>e.id==id);

    document.getElementById('marker').value=id;
    document.getElementById('marker2').value=id;

    createMarker(marker,userdata);
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

let datadiv = document.createElement("div");
let imagediv = document.createElement("div");

function createMarker(marker){

        const markerdiv = document.querySelector('#markerdiv');
        let h1 = document.createElement("h1");
        h1.innerHTML = marker.name;
        let p = document.createElement("p");
        p.innerHTML = marker.description;
        datadiv.style="border:solid";

        let prating = document.createElement("p");

        getRating(prating);

        let puser = document.createElement("p");

        puser.innerHTML = "Added by user with id "+marker.user;

        markerdiv.appendChild(datadiv);
        markerdiv.appendChild(imagediv);
        datadiv.appendChild(h1);
        datadiv.appendChild(p);
        datadiv.appendChild(prating);
        datadiv.appendChild(puser);

        let pimages = document.createElement("p");
        pimages.innerHTML = "Uploaded images:";
        imagediv.appendChild(pimages);
        loadImages(marker.id,imagediv);
        };

    async function loadImages(id,imagediv){
      fetch('/get-photos')
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

    function getRating(prating){
      let avg_rating;
      let rating;
      fetch('/get-ratings').then(
        function(response){
          response.json().then(function(data){
            rating = JSON.parse(data);

            let sum = 0;
            let count = 0;
            for (let i=0;i<rating.length;i++){
              if (rating[i].marker==id){
                count++;
                sum+=rating[i].rating;
              }
            }
            avg_rating = sum/count;
            if (count==0){
              prating.innerHTML = "Not rated yet!";
            } else {
              prating.innerHTML = "rating: " + avg_rating + " from " + count + " ratings"; //not ideal..
            }
            //return avg_rating;
          })
        }
      )
    }