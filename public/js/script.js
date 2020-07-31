let promise1 = fetch('/get-markers').then(response=>response.json());
let promise2 = fetch('/api/user-data').then(response=>response.json());

Promise.all([promise1,promise2]).then(data=>{
    const markers = JSON.parse(data[0]);
    const userdata = data[1];

    console.log(data);
    setLoginstatus(userdata.username,document.querySelector('#loginstatus'));

    loadMap(markers);
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

let map = L.map('map').setView([47.4874728,19.0474751], 8);

function loadMap(markers){

    mapLink = 
        '<a href="https://openstreetmap.org">OpenStreetMap</a>';
    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; ' + mapLink + ' Contributors',
        maxZoom: 18,
        }).addTo(map);


    for (let i = 0; i < markers.length; i++) {
        marker = new L.marker([markers[i].lat,markers[i].lon])
            .bindPopup(
                markers[i].name+"<br>"+markers[i].description+"<br>"+
                "<button class='delete_button' name='"+markers[i].id+"'>delete</button>"+"<br>"+
                "<button class='modify_button' name='"+markers[i].id+"'>modify</button><br>"+
                "<a href='https://dev.adrianturtoczki.com/id?id="+markers[i].id+"'>link</a>")
            .addTo(map);
    }
}

    map.on('click', function(e) {
        console.log("test");
        console.log(user.user);
        if (confirm("Do you want to place a marker here?")){
            let name = prompt("name of marker");
            let description = prompt("description of marker");

            console.log(user);
            const data_to_send = {id:markers[markers.length-1].id+1,name:name,description:description,lat:e.latlng.lat,lng:e.latlng.lng};

            console.log(data_to_send);

            fetch('https://dev.adrianturtoczki.com/add-marker',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data_to_send)
                }).then(response=>{
                console.log(response);
                }).catch(error=>console.error(error));
        }
    } );

    map.on('popupopen',function(){
        const delete_button = document.querySelector('.delete_button');
        delete_button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('button '+delete_button.getAttribute("name")+' was clicked');

            const data_to_send = {id:delete_button.getAttribute("name")};

            //console.log(data_to_send);

            fetch('/delete-marker',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data_to_send)
                }).then(response=>{
                console.log(response);
                }).catch(error=>console.error(error));

        });

        const modify_button = document.querySelector('.modify_button');
        modify_button.addEventListener('click', function(e) {
            let modify_type = prompt("write 'name' to modify name, 'description' to modify description, 'lat' to modify latitude, 'lon' to modify longitude");
            let modify_to = prompt("What do you want to modify it to?");
            e.preventDefault();
            console.log('button '+modify_button.getAttribute("name")+' was clicked');

            const data_to_send = {modify_type:modify_type,modify_to:modify_to,id:modify_button.getAttribute("name")};

            console.log(data_to_send);

            if ((modify_type=="name"||modify_type=="description"||modify_type=="lat"||modify_type=="lon")&&modify_to!=""){
                fetch('/modify-marker',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data_to_send)
                    }).then(response=>{
                    console.log(response);
                    }).catch(error=>console.error(error));
            } else {
                console.log("Error: wrong modify_type or empty modify_to")
            }
        });
    });
