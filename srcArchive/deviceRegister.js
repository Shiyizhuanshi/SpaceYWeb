const config = require('../../globalConfig.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const os = require('os');
const db = config.db;

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());


async function register(deviceID, deviceOwner) {
    const path = `devices/${deviceID}.json`;
    try {
        // Update data with new values
        const updateResponse = await fetch(db + path, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deviceID, deviceOwner }),
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

app.post('/api/deviceRegister', async (req, res) => {
    const deviceID = req.body.deviceID;
    const deviceOwner = req.body.deviceOwner;
    console.log('deviceID:', deviceID, 'deviceOwner:', deviceOwner);

    await register(deviceID, deviceOwner);

    res.json({ success: true, message: 'Device registered successfully' });
});

app.get('/api/getUserDevices', async (req, res) => {
    const path = `devices.json`;
    const query = `?orderBy="deviceOwner"&equalTo="admin"`;

    try {
        const response = await fetch(db + path + query);

        if (response.ok) {
            const data = await response.json();
            // Process the data and send the response
            res.json({ success: true, adminDevices: data });
        } else if (response.status === 404) {
            res.status(404).json({ success: false, message: 'Device not found' });
        } else {
            throw new Error(`Error: ${response.statusText}`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


  

function getLocalIpAddress() {
  const ifaces = os.networkInterfaces();
  let ipAddress = null;

  Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname].forEach((iface) => {
      if ('IPv4' === iface.family && !iface.internal) {
        ipAddress = iface.address;
      }
    });
  });

  return ipAddress;
}

app.listen(port, () => {
  const ipAddress = getLocalIpAddress();
  console.log(`Server is running at http://${ipAddress}:${port}`);
});
