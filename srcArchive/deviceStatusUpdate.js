const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const os = require('os');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

var deviceStatus = 'offline';

function randomizeDeviceStatus() {
  const randomStatus = Math.random() < 0.5 ? 'online' : 'offline';
  deviceStatus = randomStatus;
  console.log('Device status changed:', deviceStatus);
}

app.post('/api/sendDeviceStatus', (req, res) => {
  deviceStatus = req.body.deviceStatus;
  console.log('Received message from device:', deviceStatus);

  res.json({ success: true, message: 'Message received successfully' });
});

app.get('/api/getDeviceStatus', (req, res) => {
  res.json({ status: deviceStatus });
});

app.post('/api/deviceRegister', (req, res) => {
  const deviceID = req.body.deviceID;
  const deviceOwner = req.body.deviceOwner;
  console.log('deviceID:', message, 'deviceOwner', deviceOwner);

  res.json({ success: true, message: 'Message received successfully' });
});

app.get('/', (req, res) => {
  res.json({ status: deviceStatus });
});

// 获取本地 IP 地址
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
