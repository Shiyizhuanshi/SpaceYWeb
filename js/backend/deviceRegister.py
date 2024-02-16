import requests
import json
import time
import random
import time
import math


database_url = "https://es-cw1-default-rtdb.europe-west1.firebasedatabase.app"
path = "backendInfo"

def fetch_ip_and_port_from_firebase(database_url, path):
    url = f"{database_url}/{path}.json"
    try:
        response = requests.get(url)

        if response.status_code == 200:
            print("get configuration successfully")
            data = response.json()
            # print(data)
            # ip = data.get('IP')
            # port = data.get(data.get('port'))
            # print(ip, port)
            return f"{data.get('backendIP')}:{data.get('backendPort')}"
        else:
            print(f"Failed to fetch data. Status code: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error during request: {e}")
        return None

backendAPI = fetch_ip_and_port_from_firebase(database_url, path)
# backendAPI = "https://spacey-backend-7nqu.onrender.com:3000"
api__status_url = "http://" + backendAPI + "/api/updateDeviceStatusToDatabase"
api_register_url= "http://" + backendAPI + "/api/deviceRegister"
api_sensor_url= "http://" + backendAPI + "/api/sensorData"

def send_message(payload, url):
    # payload = {payload}
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        if response.status_code == 200:
            print(f"Message sent successfully: {payload}")
            print(response.json())
        else:
            print(f"Failed to send message. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

    return response.json


def randomDevicesWithStatus(num):
    for n in range(num):
        deviceSeatNum = 4#random.randint(1, 4)
        
        payload1={"deviceID": "IC" + str(n+1) ,  
            "deviceName":"table"+str(n+2),
            "deviceOwner":"admin",
            "deviceSeatNum": deviceSeatNum,
            "deviceIP": random.randint(100,200),
            "devicePort": random.randint(3000,4000),}
        send_message(payload1, api_register_url)
        if(n==3):
            time.sleep(5)
        else:
            time.sleep(0.1)
        for i in range(deviceSeatNum):
            payload2={"deviceID": "IC" + str(n+1),  
                 "buttonID": i+1,
                 "buttonStatus": "lightgreen",#random.choice(["red", "lightgreen"]),
                 "sensorTemp": random.randint(20,30),
                 "sensorHum": random.randint(40,60),}
            send_message(payload2, api__status_url)
            time.sleep(0.1)
        


def randomStatus(num):
    for n in range(num):
        randomInt1 = random.randint(1, 4)
        randomInt2 = random.randint(1, 4)
        payload={
            "deviceID": "IC" + str(randomInt1),
            "buttonID": str(randomInt2),  
            "buttonStatus": random.choice(["red", "lightgreen"]),
            "sensorTemp": random.randint(20,30),
            "sensorHum": random.randint(40,60),}
        
        send_message(payload, api__status_url)
        time.sleep(0.1)

def testStatus():
    time.sleep(5)
    for n in range(4):
        payload={
            "deviceID": "IC" + str(3),
            "buttonID": str(n+1),  
            "buttonStatus": "red",
            "sensorTemp": 22,
            "sensorHum": 40}
        
        send_message(payload, api__status_url)
        time.sleep(3)

# randomDevicesWithStatus(4)
# randomStatus(600)
testStatus()