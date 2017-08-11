from flask import Flask, jsonify
from fabric.api import execute
from fabfile import read_remote_file

app = Flask(__name__)


@app.route('/')
def hello_world():
    host = 'ubuntu@ec2-52-91-74-197.compute-1.amazonaws.com'
    jsonify()
    return jsonify({
        "file_content": execute(read_remote_file, "/etc/hosts", host=host)
    })

