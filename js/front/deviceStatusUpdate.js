const reservationModal = document.getElementById('reservationModal');
const confirmButton = document.getElementById('reserveConfirmButton');
const cancelButton = document.getElementById('reserveCancelButton');

let button = null;
let banerMessage = 'Seat occupied';

var deviceStatus = "deafult";
var deviceID = "default";
var buttonIDNum = "default";

function putbackStatus(deviceID, buttonID, status, username) {
    console.log("deviceID: "+ deviceID + " buttonID: "+ buttonID + " status: "+ status);    

    const path = `deviceStatus/${deviceID}/${buttonID}.json`;
    console.log("path: "+ path);
    fetch(db + path, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(status),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log("Data written successfully:", data);
        })
        .catch(error => {
          console.error("Error writing data:", error);
        });
}

function putbackStatus2(deviceID, buttonID, deviceStatus, username) {
  const path = config.backEndApi + '/api/updateDeviceStatusFromFront';
  fetch(path,{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({deviceID,buttonID,deviceStatus}),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("device status written successfully:", data);
    })
    .catch(error => {
      console.error("Error writing data:", error);
    });
}

function showInfoBanner() {
    infoBanner.textContent = banerMessage;
    infoBanner.style.display = 'block';

    setTimeout(() => {
        hideInfoBanner();
    }, 3000);
}

function hideInfoBanner() {
    infoBanner.style.display = 'none';
}

function closeModal() {
    reservationModal.style.display = 'none';
}

function openModal(buttonID) {
    button = document.getElementById(buttonID);
    deviceID = buttonID.split('.')[0];
    buttonIDNum = buttonID.split('.')[1];
    reservationModal.style.display = 'block';
}

confirmButton.addEventListener('click', () => {
    closeModal();
    console.log('Confirmed');
    button.style.backgroundColor = 'red';
    console.log("onclick: "+ button.style.backgroundColor);
    // putbackStatus(deviceID, buttonIDNum, button.style.backgroundColor);
    putbackStatus2(deviceID, buttonIDNum, button.style.backgroundColor);

});

cancelButton.addEventListener('click', () => {
    closeModal();
    console.log('Canceled');
});

