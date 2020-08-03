let promise1 = fetch('/get-markers').then(response=>response.json());
let promise2 = fetch('/api/user-data').then(response=>response.json());

/*
let user = promise2.then(function(data){
    console.log("asd");
    console.log(data);
});
*/

let markers = [];
let user = {};

Promise.all([promise1,promise2]).then(data=>{
    markers = JSON.parse(data[0]);
    console.log(markers);
    console.log(markers.length);
    user = data[1];

    console.log(data);
    setLoginstatus(user.username,document.querySelector('#loginstatus'));

    loadMap(markers,user);
    console.log("finished loading both fetches:",markers,"\n",user);
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

function loadMap(markers,user){

    mapLink = 
        '<a href="https://openstreetmap.org">OpenStreetMap</a>';
    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; ' + mapLink + ' Contributors',
        maxZoom: 18,
        }).addTo(map);


    for (let i = 0; i < markers.length; i++) {
        if (markers[i].user==user.id){
            marker = new L.marker([markers[i].lat,markers[i].lon])
                .bindPopup(
                    "<p>"+markers[i].name+"</p>"+"<p>"+markers[i].description+"</p>"+
                    "<button class='delete_button' name='"+i+"'>delete</button>"+"<br>"+
                    "<button class='modify_button' name='"+i+"'>modify</button><br>"+
                    "<a href='/id?id="+markers[i].id+"'>link</a>")
                .addTo(map);
        } else {
            marker = new L.marker([markers[i].lat,markers[i].lon])
            .bindPopup(
                "<p>"+markers[i].name+"</p>"+"<p>"+markers[i].description+"</p>"+
                "<a href='/id?id="+markers[i].id+"'>link</a>")
            .addTo(map);
        }
    }
}

    map.on('click', function(e) {
        console.log("test");

        if (confirm("Do you want to place a marker here?")){
            let name = prompt("name of marker");
            let description = prompt("description of marker");

                    console.log(markers);
                    const data_to_send = {name:name,description:description,lat:e.latlng.lat,lng:e.latlng.lng};
                    console.log(data_to_send);
    
    
                    fetch('/add-marker',{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data_to_send)
                        }).then(response=>{
                        console.log(response);
                        window.location.reload();
                        }).catch(error=>console.error(error));
    }
});

    map.on('popupopen',function(){
        const delete_button = document.querySelector('.delete_button');
        console.log("check if delete exists:"+delete_button);
        if (delete_button&&markers[delete_button.getAttribute("name")].user==user.id){
            let current_marker = markers[delete_button.getAttribute("name")];
            delete_button.addEventListener('click', function(e) {
                console.log('button '+current_marker.id+' was clicked');
    
                const data_to_send = {id:current_marker.id};
    
                //console.log(data_to_send);
    
                fetch('/delete-marker',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data_to_send)
                    }).then(response=>{
                    console.log(response);
                    window.location.reload();
                    }).catch(error=>console.error(error));
                }, {passive:true});
    
                    const modify_button = document.querySelector('.modify_button');
                    modify_button.addEventListener('click',function(e) {
                        let modify_type = prompt("write 'name' to modify name, 'description' to modify description, 'lat' to modify latitude, 'lon' to modify longitude");
                        let modify_to = prompt("What do you want to modify it to?");
                        console.log('button '+modify_button.getAttribute("name")+' was clicked');
            
                        const data_to_send = {modify_type:modify_type,modify_to:modify_to,id:current_marker.id};
            
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
                                window.location.reload();
                                }).catch(error=>console.error(error));
                        } else {
                            console.log("Error: wrong modify_type or empty modify_to")
                        }
                    }, {passive:true});
        }
    
    });
