UltIDE
======

UltIDE is a general purpose IDE with a client-server architecture. It was initialy created for its `ultiflow` module,
whose purpose is to provide a general interface for easily managing flowcharts and generating code from them.

Please note this is an Alpha version of UltIDE that was released since multiple people asked to access it. This is still
WIP and basic features are missing. Backward compatibility is NOT guaranteed. Documentation is not up to par.

External contributions for features, documentation, or simply suggestion are very welcome. Don't hesitate to contact us
via the Issue tab.

Requirements
------------
Python and flask must be installed.

On linux, it should look like this:
```
sudo apt-get install python python-dev
sudo apt-get install libffi-dev
sudo pip install flask flask_socketio flask-user
```

Is something missing or did you succeed to install it on other platforms ? Don't hesitate to contact us!

Installation
------------

Download the ZIP [here](https://github.com/ultide/ultide/archive/master.zip).

Unzip it and put it at a custom location.

Usage
-----

Launch the `server.py` script. On linux, it should look like this:

`python server.py`

It will launch a Flask server. Using Firefox / Chrome (IE compatibility not guaranteed), go to the following URL:

`http://localhost:5000`

Flowchart usage
---------------

Since this IDE was created for the flowchart editor, and it only contains it, we will describe it here for the moment.
Please note that we plan to separate the flowchart editor from the IDE in the long run, that is why it has been
implemented in a different module.

