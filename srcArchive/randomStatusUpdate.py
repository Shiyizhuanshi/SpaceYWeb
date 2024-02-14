import requests
import json
import time
import random

api_url = "http://localhost:3000/api/sendDeviceStatus"

def send_message(deviceStatus):
    payload = {"deviceStatus": deviceStatus}
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(api_url, data=json.dumps(payload), headers=headers)
        if response.status_code == 200:
            print(f"Message sent successfully: {deviceStatus}")
        else:
            print(f"Failed to send message. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

# Example: Sending a message every 5 seconds with random device status
while True:
    random_status = random.choice(['offline', 'online'])
    send_message(random_status)
    time.sleep(1)
