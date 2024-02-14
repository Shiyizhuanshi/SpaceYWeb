const db = config.db;
async function register(deviceID, deviceOwner, deviceName) {
    const path = `devices/${deviceID}.json`;
    try {
        // Update data with new values
        const updateResponse = await fetch(db + path, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deviceID, deviceOwner, deviceName}),
        });

        if (updateResponse.ok) {
            console.log('Device registered successfully.');
        } else {
            console.log('Device registration failed.');
        }
    } catch (error) {
        console.error(error);
    }
}

async function changeDeviceName() {
    const deviceID = document.getElementById('DeviceID').value;
    const deviceName = document.getElementById('DeviceName').value;
    event.preventDefault();
    try {
        // Fetch the existing device data
        const response = await fetch(db + `devices/${deviceID}.json`);
        if (!response.ok) {
            console.log('Failed to fetch existing device data.');
        }

        const existingData = await response.json();

        // Update the device name with the new value
        const { deviceOwner } = existingData;  // Assuming deviceOwner remains unchanged
        await register(deviceID, deviceOwner, deviceName);

        // Fetch the updated device data
        const updatedResponse = await fetch(db + `devices/${deviceID}.json`);
        if (!updatedResponse.ok) {
            console.log('Failed to fetch updated device data.');
        }

        console.log('Device name updated successfully.');
        window.location.href = "userPanel.html";
    } catch (error) {
        console.error(error);
    }
}

