#!/usr/bin/env python

# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on available packages.
async_mode = None

if async_mode is None:
    try:
        import eventlet
        async_mode = 'eventlet'
    except ImportError:
        pass

    if async_mode is None:
        try:
            from gevent import monkey
            async_mode = 'gevent'
        except ImportError:
            pass

    if async_mode is None:
        async_mode = 'threading'

    print('async_mode is ' + async_mode)

# monkey patching is necessary because this application uses a background
# thread
if async_mode == 'eventlet':
    import eventlet
    eventlet.monkey_patch()
elif async_mode == 'gevent':
    from gevent import monkey
    monkey.patch_all()

import time
from flask import Flask, render_template, session, request, send_from_directory
from flask_socketio import SocketIO, emit, disconnect
import ultide.config as config
from flask_user import login_required, UserManager, UserMixin, SQLAlchemyAdapter
from datetime import datetime
from ultide.models import db, User
import os
import os.path
import ultide.core as core
import uuid
import ultide.common as common


app = Flask(__name__)
app.config.from_object(config)
socketio = SocketIO(app, async_mode=async_mode)
thread = None


db.app = app
db.init_app(app)
# Create all database tables
db.create_all()

# Setup Flask-User
db_adapter = SQLAlchemyAdapter(db, User)        # Register the User model
common.user_manager = UserManager(db_adapter, app)     # Initialize Flask-User

if not User.query.filter(User.username=='root').first():
    user1 = User(username='root', email='root@example.com', confirmed_at=datetime.now(), active=True,
            password=common.user_manager.hash_password('root'))
    db.session.add(user1)
    db.session.commit()

sessions_data = {}

def get_init_session_data():
    data = {}
    data['modules_infos'] = {'core': {'main': core}}
    return data


@app.route('/')
def index():
    session['uuid'] = str(uuid.uuid4())
    return render_template('index.html')

@socketio.on('msg', namespace='/uide')
def msg_received(message):
    session_data = sessions_data[session['uuid']]
    request_id = message['request_id']
    method = 'on_' + message['request']
    response = {'request_id': request_id}
    if ('user' in session_data or method == 'on_login'):
        data = message['data']
        response_data = {}
        for module_key in session_data['modules_infos']:
            module_infos = session_data['modules_infos'][module_key]
            if ('main' in module_infos):
                module_py = module_infos['main']
                if (hasattr(module_py, method)):
                    getattr(module_py, method)(data, response_data, session_data)
        response['data'] = response_data
    else:
        response['auth_error'] = True
    
    emit('msg', response)
    
@app.route('/static/modules/<path:path>', methods=['GET'])
def modules_static(path):
    session_data = sessions_data[session['uuid']]
    splitted_path = path.split('/')
    module = splitted_path.pop(0)
    
    module_path = session_data['modules_infos'][module]['path'] + os.path.sep + 'static'
    return send_from_directory(module_path, '/'.join(splitted_path))
  


@socketio.on('connect', namespace='/uide')
def test_connect():
    sessions_data[session['uuid']] = get_init_session_data()

@socketio.on('disconnect', namespace='/uide')
def test_disconnect():
    sessions_data.pop(session['uuid'], None)
    print('Client disconnected', request.sid, session['uuid'])


if __name__ == '__main__':
    socketio.run(app, debug=True)
