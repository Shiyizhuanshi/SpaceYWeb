const body = document.querySelector("body");
let currentDeviceID = '';

function showDeviceNameForm() {
  console.log("showDeviceNameForm");
  const form = document.createElement("form");
  form.classList.add("device-name-form");
  form.innerHTML = `
  <input type="text" id="deviceName" name="deviceName" placeholder="Enter new device name">
  <button type="submit" onclick="changeDeviceName()">Change</button>
  `;
  body.appendChild(form);
  return form;
}

const ContextMenu = function (options) {
    let instance;
    function createMenu() {
        const ul = document.createElement("ul");
        ul.classList.add("custom-context-menu");
        const { menus } = options;
        if (menus && menus.length > 0) {
            for (let menu of menus) {
            const li = document.createElement("li");
            li.textContent = menu.name;
            li.onclick = menu.onClick;
            ul.appendChild(li);
            }
        }
        const body = document.querySelector("body");
        body.appendChild(ul);
        return ul;
    }
    return {
        getInstance: function () {
        if (!instance) {
            instance = createMenu();
        }
        return instance;
        },
    };
};

const menuSinglton = ContextMenu({
    menus: [
      {
        name: "ChangeDeviceName",
        onClick: function (e) {
          showDeviceNameForm();
        },
      },
      {
        name: "custom menu 2",
        onClick: function (e) {
          console.log("menu2 clicked");
        },
      },
      {
        name: "custom menu 3",
        onClick: function (e) {

          console.log("menu3 clicked");
        },
      },
    ],
  });

function showMenu(e) {
    const menus = menuSinglton.getInstance();
    menus.style.position = "fixed";
    menus.style.top = `${e.clientY}px`;
    menus.style.left = `${e.clientX}px`;
    menus.style.display = "block";
}

function hideMenu(e) {
    const menus = menuSinglton.getInstance();
    menus.style.display = "none";
}

function getData(deviceID){
  currentDeviceID = deviceID;
}
document.addEventListener("click", hideMenu);

async function register(deviceID, deviceOwner, deviceName, deviceSeatNum) {
  const path = `devices/${deviceID}.json`;
  try {
      // Update data with new values
      const updateResponse = await fetch(config.db + path, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deviceID, deviceOwner, deviceName, deviceSeatNum}),
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
  event.preventDefault();
  const deviceID = currentDeviceID;
  const deviceName = document.getElementById('deviceName').value;
  try {
      // Fetch the existing device data
      console.log(config.db + `devices/${deviceID}.json`);
      const response = await fetch(config.db + `devices/${deviceID}.json`);
      if (!response.ok) {
          console.log('Failed to fetch existing device data.');
      }

      const existingData = await response.json();
      console.log(existingData);

      // Update the device name with the new value
      const { deviceOwner } = existingData;  // Assuming deviceOwner remains unchanged
      const { deviceSeatNum } = existingData;  // deviceSeatNum deviceOwner remains unchanged
      await register(deviceID, deviceOwner, deviceName, deviceSeatNum);

      // Fetch the updated device data
      const updatedResponse = await fetch(config.db + `devices/${deviceID}.json`);
      if (!updatedResponse.ok) {
          console.log('Failed to fetch updated device data.');
      }

      console.log('Device name updated successfully.');
      window.location.href = "userPanel.html";
  } catch (error) {
      console.error(error);
  }
}