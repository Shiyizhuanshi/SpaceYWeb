const socket = new WebSocket(config.wsApi);
// document.addEventListener('DOMContentLoaded', () => {
    const sections = document.getElementById('seriessection');
    const deviceList = document.getElementById('deviceList');
    const section2 = document.getElementById('section2');
    const updateButton = document.getElementById('updateButton');
    const sectionsDiv = document.getElementById('sectionsDiv');

    let currentSectionNumber = 1;    // The current section number
    let devicesInCurrentSection = 0; // The number of devices in the current section
    let sectionBlockLimit = 4;       // The maximum number of devices in a section
    var buttonCount = 0;
    var deviceStatus = "off";

    function createCircle() {
        const circle = document.createElement('div');
        circle.className = 'circle';
        return circle;
    }

    function createCircleButton(ID, status) {
        const circleButton = document.createElement('div');
        circleButton.className = 'circleButton';
        circleButton.id = ID;
        // console.log("status: ", status);
        circleButton.style.backgroundColor = status;
        // console.log(circleButton.style.backgroundColor);
        return circleButton;
    }

    function buttonClick(button) {
        console.log("button ", button.id, " clicked");
        if(button.style.backgroundColor === 'lightgreen') {
            openModal(button.id);
        }
        else {
            showInfoBanner();
        }
    }

    async function getButtonStatus(deviceID, buttonID){
        const response = await fetch(config.db + `/deviceStatus/${deviceID}/${buttonID}.json`);
        const data = await response.json();
        // console.log(data);
        return data;
    }

    async function getSensorData(deviceID){
        const response = await fetch(config.db + `/deviceStatus/${deviceID}/sensorData.json`);
        const data = await response.json();
        // console.log(data);
        return { sensorTemp: data.sensorTemp, sensorHum: data.sensorHum };
    }

    async function getDeviceSeatNum(deviceID) {
        const response = await fetch(config.backEndApi + `/api/getDeviceSeatNum?deviceID=${deviceID}`);
        const data = await response.json();

        const deviceSeatNum = parseInt(data.deviceSeatNum, 10);

        buttonCount =  parseInt(deviceSeatNum);
    }

    async function createDeviceBlock(deviceName, deviceID) {
        const deviceBlock = document.createElement('div');
        deviceBlock.className = 'device-block';

        // console.log(buttonCount);
        const circles = [];
        for (let i = 1; i <= buttonCount; i++) {
            const status = await getButtonStatus(deviceID, i);
            const circle = createCircleButton(deviceID+'.'+i, status);
            circle.addEventListener('click', () => {
                event.preventDefault();
                buttonClick(circle);
            });
            circles.push(circle);
        }
        //get sensor data
        const {sensorTemp, sensorHum} = await getSensorData(deviceID);
        const textDiv = document.createElement('div');
        textDiv.className = 'deviceName';
        textDiv.textContent = deviceName;

        const tempDiv = document.createElement('div');
        tempDiv.className = 'tempDiv';
        tempDiv.textContent = "Temp:" + sensorTemp + "C";
        tempDiv.id = deviceID+'.'+'tempDiv';

        const humDiv = document.createElement('div');
        humDiv.className = 'humDiv';
        humDiv.textContent = "Hum:" + sensorHum + "%";
        humDiv.id = deviceID+'.'+'humDiv';

        // Add contextmenu event listener for right-click on text content
        textDiv.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            // Show your custom context menu here
            showMenu(e);
            getData(deviceID);
        });
        // Append circles, deviceID, and circles to the deviceBlock
        for (let i = 1; i <= buttonCount; i++) {
            deviceBlock.appendChild(circles[i - 1]);
        }

        deviceBlock.appendChild(textDiv);
        deviceBlock.appendChild(tempDiv);
        deviceBlock.appendChild(humDiv);
        return deviceBlock;
    }

    async function updateDeviceIDs() {
        try {
            // Using fetch to get device data from the backend
            const response = await fetch(config.backEndApi + `/api/getUserDevices?username=${dynamicUsername}`);
    
            // Reset section number and device count
            currentSectionNumber = 1;
            devicesInCurrentSection = 0;
    
            if (!response.ok) {
                throw new Error(`Could not fetch device data: ${response.statusText}`);
            }
    
            const data = await response.json();
    
            // Clear previous device blocks
            deviceList.innerHTML = '';
            sectionsDiv.innerHTML = '';
    
            // Handle the empty device list
            // console.log(data);
            if (data.devices.length === 0) {
                deviceList.innerHTML = '';
                const listItem = document.createElement('li');
                listItem.textContent = `No devices found`;
                deviceList.appendChild(listItem);
                console.log('No devices found');
            }
    
            // Handle the empty section
            if (sectionsDiv.childElementCount === 0) {
                currentSectionNumber++;
                const newSection = document.createElement('section');
                newSection.className = `section section${currentSectionNumber}`;
                sectionsDiv.appendChild(newSection);
            }
    
            // Check if data.devices is an array
            if (Array.isArray(data.devices)) {
                for (const device of data.devices) {
                    const deviceID = device.deviceID;
                    const deviceName = device.deviceName;
    
                    // Render new device list items to the page
                    const listItem = document.createElement('li');
                    listItem.textContent = `Device ID: ${deviceID}, Device Name: ${deviceName}`;
                    deviceList.appendChild(listItem);
    
                    // Render new device blocks to the page
                    await getDeviceSeatNum(deviceID);
                    const deviceBlock = await createDeviceBlock(deviceName, deviceID);
    
                    // If the current section is full
                    if (devicesInCurrentSection >= sectionBlockLimit) {
                        // Move to the next section
                        currentSectionNumber++;
                        devicesInCurrentSection = 0;
    
                        // Create a new section element
                        const newSection = document.createElement('section');
                        newSection.className = `section section${currentSectionNumber}`;
                        sectionsDiv.appendChild(newSection);
    
                        // Append the deviceBlock to the new section
                        newSection.appendChild(deviceBlock);
                    } else {
                        // Append the deviceBlock to the current section
                        document.querySelector(`.section${currentSectionNumber}`).appendChild(deviceBlock);
                    }
    
                    devicesInCurrentSection++;
                }
            } else {
                console.error('Invalid data structure: Expected an array under "devices"');
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    // Add an event listener to the button
    updateButton.addEventListener('click', updateDeviceIDs);

    socket.addEventListener('open', (event) => {
        console.log('Connected to WebSocket');
    });

    socket.addEventListener('message', (event) => {
        let packet = JSON.parse(event.data);
        console.log("update button status");
        const buttonID = packet.deviceID + "." + packet.buttonID;
        console.log(buttonID);
        const buttonStatusUpdate = document.getElementById(buttonID);
        var color = packet.buttonStatus;
        buttonStatusUpdate.style.backgroundColor = color;
        // console.log(buttonStatusUpdate.style.backgroundColor);
        console.log("update sensor data");
        const tempDivUpdate = document.getElementById(packet.deviceID+'.'+'tempDiv');
        const humDivUpdate = document.getElementById(packet.deviceID+'.'+'humDiv');
        tempDivUpdate.textContent = "Temp:" + packet.sensorTemp + "C";
        humDivUpdate.textContent = "Hum:" + packet.sensorHum + "%";
    });

    socket.addEventListener('close', (event) => {
        console.log('WebSocket closed');
    });

    // Initial update when the page loads
    (async () => {
        updateDeviceIDs();
    })();
// });
