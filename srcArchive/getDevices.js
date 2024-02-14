const config = require('../../globalConfig.js');
const express = require('express');
const cors = require('cors'); // Import the cors middleware
const app = express();
const port = 3000;
const os = require('os');

const path = `devices.json`;
const db = config.db;
const query = `?orderBy="deviceOwner"&equalTo="admin"`;

app.use(cors());

// Your existing route
app.get('/api/getUserDevices', (req, res) => {
    fetch(db + path + query)
    .then(response => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 404) {
            throw new Error('User not found');
        } else {
            throw new Error(`Could not fetch user data: ${response.statusText}`);
        }
    })
    .then(data => {
        const deviceIDs = [];

        for (const deviceId in data) {
            if (data.hasOwnProperty(deviceId)) {
                const device = data[deviceId];
                const deviceID = device.deviceID;
                deviceIDs.push(deviceID);
                console.log(`Device ID ${deviceId}: ${deviceID}, Owner: ${device.deviceOwner}`);
            }
        }

        console.log('All Device IDs:', deviceIDs);
        res.json({ deviceIDs });
    })
    .catch(error => {
        console.error(error);
    });
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
  
  // 启动服务器
  app.listen(port, () => {
    const ipAddress = getLocalIpAddress();
    console.log(`Server is running at http://${ipAddress}:${port}`);
  });
  