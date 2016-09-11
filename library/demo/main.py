import time

def on_demo_ping(data, response, session_data):
    response['demo_response'] = 'Your message was "' + data['message'] + '". Time on server is: ' + str(time.time()) + '.'