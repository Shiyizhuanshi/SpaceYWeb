//import the framework express
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const os = require('os');

//import module fot TCP 
const net = require('net');
// Create servers
// Create an Express application
const app = express();
// Create an HTTP server using the Express application
const server = http.createServer(app);
// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });
// Enable Cross-Origin Resource Sharing (CORS) middleware
app.use(cors());
// Parse incoming JSON requests using the bodyParser middleware
app.use(bodyParser.json());
// Create a TCP socket
const socket = new net.Socket();

const config = {
    db: "https://es-cw1-default-rtdb.europe-west1.firebasedatabase.app/",
    debugMode: 1,
};

const port1 = 3000;
const port2 = 4000;
const db = config.db;
const devicesPath = `devices.json`;
const deviceStatus = `deviceStatus.json`;
const configPath = `../../config.json`;

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

function storeConfigInFile(backendIP, backendPort, wsPort, configPath) {
    // Store the config data in the config.json file
    fs.writeFile(configPath, JSON.stringify({backendIP, backendPort, wsPort}), 'utf8', (err) => {
        if (err) {
            console.error('Error storing config info:', err.message);
        } else {
            console.log('Config info stored successfully\n');
        }
    });
}

function updateBackendInfoToDatabase(backendIP, backendPort, wsPort ,db) {
    const path = 'backendInfo.json';
    fetch(db + path, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backendIP, backendPort, wsPort, db }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to update backend info. Status: ${response.status}`);
        }
        storeConfigInFile(backendIP, backendPort, wsPort, configPath)
        console.log('Backend info updated successfully\n');
    })
    .catch(error => {
        console.error('Error updating backend info:', error.message);
    });
}

//fetch data from database and update local data
async function fetchTempData(path) {
    
    const response = await fetch(db + path);
    if (response.ok) {
        const data = await response.json(); 
        let tempData = JSON.parse(JSON.stringify(data));
        console.log("TempData updated successfully\n")
        // config.debugMode && console.log('tempData:', tempData,'\n');
        
    } else {
        console.error('Fetch failed with status:', response.status);
    }
}

//register device to database
async function register(deviceID, deviceOwner, deviceName, deviceSeatNum, deviceIP, devicePort) {
    const path = `devices/${deviceID}.json`;
    try {
        // Update data with new values
        const updateResponse = await fetch(db + path, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({deviceID, deviceOwner, deviceName, deviceSeatNum,deviceIP,devicePort}),
        });

        if (updateResponse.ok) {
            console.log('Device registered successfully.');
        } else {
            console.log('Device registration failed.\n');
        }
    } catch (error) {
        console.error(error);
    }
}

//update button status of a device to database
async function updateDeviceStatusToDatabase(deviceID, buttonID, buttonStatus) {
    const path = `deviceStatus/${deviceID}/${buttonID}.json`;
    try {
        const updateResponse = await fetch(db + path, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(buttonStatus),
        });

        if (updateResponse.ok) {
            console.log('device: ' + deviceID + ', button: ' + buttonID + ', status: ' + buttonStatus +' \n');
        } else {
            console.log('status update failed.\n');
        }
    } catch (error) {
        console.error(error);
    }
}

//update sensor data of a device to database
async function updateSensorDataToDatabase(deviceID, sensorTemp, sensorHum) {
    const path = `deviceStatus/${deviceID}/sensorData.json`;
    try {
        const updateResponse = await fetch(db + path, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({sensorTemp, sensorHum}),
        });
        if (updateResponse.ok) {
            console.log('device: ' + deviceID + ', sensorTemp: ' + sensorTemp + ', sensorHum: ' + sensorHum +' \n');
        } else {
            console.log('sensor data update failed.\n');
        }
    } catch (error) {
        console.error(error);
    }
}

//update the button status of a device locally
function updateDeviceStatusToDevice (deviceID, buttonID, status) {
    let deviceIP;
    let devicePort;
    const path = `devices.json`;
    const query = `?orderBy="deviceID"&equalTo="${deviceID}"`;
    fetch(db + path + query)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`Could not fetch user data: ${response.statusText}`);
            }
        })
        .then(data => {
            for (const deciveID in data){
                if (data.hasOwnProperty(deciveID)) {
                    const device = data[deciveID];
                    deviceIP = device.deviceIP;
                    devicePort = device.devicePort;
                }
            }
            console.log("update device status to device: ", deviceIP, devicePort, status);

            if (true){
                //create a temporary TCP socket
                socket.connect(devicePort, deviceIP, () => {
                console.log(`Connected to ${deviceIP}:${devicePort}\n`);
                let packet = JSON.stringify({buttonID, status});
                // Send the message to the device
                console.log(packet);
                socket.write(packet);
                // Close the socket after sending the message
                socket.destroy();
              });
            }
        })
        .catch(error => {
            console.error(error);
        });

}

//delete all data in database
async function deleteAllData(path) {
    try {
        const deleteResponse = await fetch(db + path, {
            method: 'DELETE',
        });
        if (deleteResponse.ok) {
            console.log('All data deleted successfully.\n');
        } else {
            console.log('Failed to delete all data.');
        }
        fetchTempData(devicesPath);
    } catch (error) {
        console.error(error);
    }
}

//api for device send its status to backend
app.post('/api/updateDeviceStatusToDatabase', (req, res) => {
    //define headers which forntend can recognise
    // const buttonHeader = "buttonStatus";
    // const sensorHeader = "sensorData";
    const deviceID = req.body.deviceID;
    const buttonID = req.body.buttonID;
    const buttonStatus = req.body.buttonStatus;
    const sensorTemp = req.body.sensorTemp;
    const sensorHum = req.body.sensorHum;
    //update device status to database
    updateDeviceStatusToDatabase(deviceID, buttonID, buttonStatus);
    //update sensor data to database
    updateSensorDataToDatabase(deviceID, sensorTemp, sensorHum);
    //after update database send packet to frontend
    const wsPacket = JSON.stringify({deviceID, buttonID, buttonStatus, sensorTemp, sensorHum});
    wss.clients.forEach((client) => {
        client.send(wsPacket);
    });
    res.json({ success: true, message: 'device status update successfully' });
});

//api for frontend to update device status locally and to database
app.post('/api/updateDeviceStatusFromFront', (req, res) => {
    //define headers which forntend can recognise
    const deviceID = req.body.deviceID;
    const buttonID = req.body.buttonID;
    const deviceStatus = req.body.deviceStatus;
    //update device status to database
    updateDeviceStatusToDatabase(deviceID, buttonID, deviceStatus);
    //update device status to device locally
    updateDeviceStatusToDevice(deviceID,buttonID,deviceStatus);
    //after update database send packet to frontend
    res.json({ success: true, message: 'device status update from frontend successfully' });
});

app.get('/api/getDeviceStatus', (req, res) => {
    const deviceID = req.query.deviceID;
    const buttonID = req.query.buttonID;
    const response = fetch(db + `deviceStatus/${deviceID}/${buttonID}.json`);
    if (response.ok) {
        const data = response.json(); 
        res.json({ deviceStatus: data });
        console.log("\nTempData updated successfully")
        // config.debugMode && console.log('tempData:', tempData,'\n');
        
    } else {
        console.error('Fetch failed with status:', response.status);
    }
});

//api for device register itself
app.post('/api/deviceRegister', async (req, res) => {
    const deviceID = req.body.deviceID;
    const deviceOwner = req.body.deviceOwner;
    const deviceName = req.body.deviceName;
    const deviceSeatNum = req.body.deviceSeatNum;
    const deviceIP = req.body.deviceIP;
    const devicePort = req.body.devicePort;
    config.debugMode && console.log("\nRegistering device:");
    config.debugMode && console.log('{deviceID:', deviceID, 'deviceOwner:', deviceOwner,"}\n");
    await register(deviceID, deviceOwner, deviceName, deviceSeatNum,deviceIP,devicePort);
    res.json({ success: true, message: '\nDevice registered successfully\n' });
    // fetchTempData(devicesPath);
});

//api for frontend to fetch devices list for certain user
app.get('/api/getUserDevices', async (req, res) => {
    const path = `devices.json`;
    const query = `?orderBy="deviceOwner"&equalTo="${req.query.username}"`;
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
            var devices = [];

            for (const deviceId in data) {
                if (data.hasOwnProperty(deviceId)) {
                    const device = data[deviceId];
                    const deviceID = device.deviceID;
                    const deviceName = device.deviceName;

                    devices.push({ deviceID, deviceName });

                    // if (config.debugMode){
                    //     console.log('Device ID:', deviceID, 'Device Name:', deviceName, 'Device Owner:', device.deviceOwner);}
                }
            }

            // if (config.debugMode) {console.log('All Devices:', devices);}
            console.log('Get devices: Success');
            res.json({ devices });
        })
        .catch(error => {
            console.error(error);
        });
});

//api for frontend to get the seatNum for certain device
app.get('/api/getDeviceSeatNum', async (req, res) => {
    const deciveID = req.query.deviceID;
    const path = `devices/${deciveID}.json`;
    // config.debugMode && console.log('Fetching device seat number for device:', deciveID);
    fetch(db + path)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 404) {
                throw new Error('device not found\n');
            } else {
                throw new Error(`Could not fetch device data: ${response.statusText}\n`);
            }
        })
        .then(data => {
            data.deviceSeatNum;
            // if (config.debugMode) {console.log('Device '+ deciveID+': Seat Number: ', data.deviceSeatNum + '\n');}
            res.json({ deviceSeatNum: data.deviceSeatNum });
        })
        .catch(error => {
            console.error(error);
        });
});

app.listen(port1, () => {
    const backendIP = getLocalIpAddress();
    console.log('\nDatabase:', db,'\n');
    console.log(`Server is running at http://${backendIP}:${port1}\n`);
    updateBackendInfoToDatabase(backendIP, port1, port2, db);
    deleteAllData(devicesPath);
    deleteAllData(deviceStatus);
});



wss.on('connection', (ws) => {
    console.log('Client connected');

    // 监听消息事件
    // ws.on('message', (message) => {
    //     console.log(`Received message: ${message}`);

    //     // 发送消息给客户端
    //     ws.send('Server received your message: ' + message);
    // });

    // 监听连接关闭事件
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(port2, () => {
    console.log('Server listening on port:', port2, '\n');
});
