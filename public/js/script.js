const socket = io();
const markers = {}; // store markers for each user

if(navigator.geolocation){
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("sent-location", { latitude, longitude });
        }, 
        (error) => {
            console.error("Error getting location:", error);
        }, 
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© 2025 Raj kunwar"
}).addTo(map);

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }

    map.setView([latitude, longitude], 14);
    console.log(`Location received: ${latitude}, ${longitude}`);
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
    console.log("user-disconnected", id);
});

console.log("Client is running and connected to server");
