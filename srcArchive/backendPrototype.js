const express = require('express');
const bodyParser = require('body-parser');
const os = require('os');

const app = express();
const port = 3000; // 选择一个合适的端口

// 使用 bodyParser 中间件解析请求体
app.use(bodyParser.json());

// 用于存储接收到的消息的数据结构
const messages = [];

// 处理 POST 请求
app.post('/api/messages', (req, res) => {
    const receivedMessage = req.body.message;

    // 存储消息
    messages.push(receivedMessage);

    console.log('Received message:', receivedMessage);

    // 获取服务器的 IP 地址
    const serverIp = getServerIpAddress();
    
    // 返回确认，并包含服务器的 IP 地址和端口
    res.status(200).json({ 
        message: 'Message received and stored successfully.',
        serverIp: serverIp,
        port: port
    });
});

// 获取服务器的 IP 地址
function getServerIpAddress() {
    const ifaces = os.networkInterfaces();
    let serverIp = 'Unknown';

    Object.keys(ifaces).forEach((ifname) => {
        ifaces[ifname].forEach((iface) => {
            if (iface.family === 'IPv4' && !iface.internal) {
                serverIp = iface.address;
            }
        });
    });

    return serverIp;
}

// 启动服务器
app.listen(port, () => {
    serverIp2 = getServerIpAddress();
    console.log(`Server is running on ${serverIp2}:${port}`);
});
