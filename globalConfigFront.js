const data = 
{"backendIP":"192.168.43.167","backendPort":3000,"wsPort":4000}
;

const backEndIp = "http://"+data.backendIP;
const backEndPort =  ":"+data.backendPort;
const wsPort =  ":"+data.wsPort;

const config = {
    db: "https://es-cw1-default-rtdb.europe-west1.firebasedatabase.app/",
    backEndApi: backEndIp+backEndPort,
    wsApi: backEndIp+wsPort,
    wsApi: (backEndIp+wsPort).replace(/^http/, 'ws'),
    debugMode: true,
};