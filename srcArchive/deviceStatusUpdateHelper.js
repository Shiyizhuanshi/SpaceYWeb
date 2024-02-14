function updateDeviceStatus() {
    const backendApi = config.backEndApi;
    fetch(backendApi + '/getDeviceStatus') // Update with your server URL
        .then(response => response.json())
        .then(data => {
            const deviceStatusElement = document.getElementById('deviceStatus');
            deviceStatusElement.textContent = data.status;
        })
        .catch(error => console.error('Error fetching device status:', error));
}

// Function to periodically update device status
function startUpdating() {
    setInterval(updateDeviceStatus, 1000); // Update every 5 seconds (adjust as needed)
}