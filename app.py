import os
from flask import Flask, jsonify, request, session
from flask_session import Session

from fabric.api import execute
from redis import Redis

import memoize.redis

from fabfile import read_remote_file, get_machine_info

import firebase_admin
from firebase_admin import credentials, auth, db
from flask_wtf.csrf import CSRFProtect
from celery import Celery

import requests
from github import Github


def make_celery(app):
    celery = Celery(app.import_name, backend=app.config['CELERY_RESULT_BACKEND'],
                    broker=app.config['CELERY_BROKER_URL'])
    celery.conf.update(app.config)
    TaskBase = celery.Task

    class ContextTask(TaskBase):
        abstract = True

        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)

    celery.Task = ContextTask
    return celery


gh = Github(os.getenv('GITHUB_ACCESS_TOKEN'))

cred = credentials.Certificate(os.path.join(os.path.dirname(__file__), '.firebase-admin.json'))
firebase_app = firebase_admin.initialize_app(cred, options={
    "databaseURL": "https://sc17-gatech-optica.firebaseio.com"
})
root = db.reference()
whitelist_ref = root.child('whitelist')

app = Flask(__name__)
# csrf = CSRFProtect(app)
SESSION_TYPE = 'redis'
app.config.from_object(__name__)
Session(app)
app.config.update(
    CELERY_BROKER_URL='redis://localhost:6379',
    CELERY_RESULT_BACKEND='redis://localhost:6379'
)
celery = make_celery(app)

db = Redis()
store = memoize.redis.wrap(db)

memo = memoize.Memoizer(store)

# @app.after_request
# def set_x_csrf_cookie(response):
#     response.set_cookie('X-CSRF', csrf.generate_csrf())
#     print(csrf.generate_csrf())
#     return response


@memo
def get_gh_username_by_id(gh_id: str) -> str:
    return requests.get(f"https://api.github.com/user/{gh_id}").json()['login']


@memo(max_age=3600 * 24 * 30)
def is_token_authorized(gh_uid: str) -> bool:
    gh_login = get_gh_username_by_id(gh_uid)
    gh_user = gh.get_user(gh_login)
    return gh.get_organization('scc-gatech').has_in_members(gh_user)


@memo(max_age=3600 * 24)
def get_whitelist_emails():
    return whitelist_ref.get()


@memo(max_age=3600 * 24)
def get_roles_info():
    return root.child('roles').get()


def assemble_host_strings(hosts):
    roles = get_roles_info()
    return [f"{roles[h['chefRole']]['username']}@{h['hostname']}" for h in hosts]


def host_to_index(hostname):
    return hostname.replace('.', ',')


def resolve_host_list(resolve_rule):
    hosts = root.child('hosts').get()
    ret_hosts = []
    if 'all' in resolve_rule and resolve_rule['all']:
        ret_hosts = [h for _, h in hosts.items()]
    if 'hosts' in resolve_rule:
        ret_hosts = [h for _, h in hosts.items() if h['hostname'] in resolve_rule['hosts']]
    if 'roles' in resolve_rule:
        ret_hosts = [h for _, h in hosts.items() if h['chefRole'] in resolve_rule['roles']]

    return ret_hosts, assemble_host_strings(ret_hosts)


@app.route('/auth', methods=['POST'])
def firebase_auth():
    id_token = request.json['auth_data']
    decoded_token = auth.verify_id_token(id_token)
    encoded_email = decoded_token['email'].replace('.', ',').replace('+', '%')
    gh_uid = decoded_token['firebase']['identities']['github.com'][0]
    authorized = is_token_authorized(gh_uid)

    if authorized:
        whitelist = get_whitelist_emails()
        if whitelist is None or not whitelist.get(encoded_email):
            get_whitelist_emails.delete()
            root.child(f'whitelist').child(encoded_email).set(True)

    return jsonify({
        "authorized": authorized
    })


@celery.task()
def refresh_machine_status(hosts, jobid):
    # TODO: jobid is not used yet
    hosts, hoststrs = resolve_host_list(hosts)
    ret = execute(get_machine_info, hosts=hoststrs)
    updates = {}

    for host, result in ret.items():
        host = host_to_index(host.split('@')[-1])
        for k, v in result.items():
            updates[f"{host}/{k}"] = v

    root.child('hosts').update(updates)
    return ret


@app.route('/run_task', methods=['POST'])
def run_task():
    req = request.json
    task_name = req['task_name']
    jobid = root.child('jobs/count').transaction(lambda x: x + 1 if x else 1)
    if task_name == 'refresh_machine_status':
        refresh_machine_status.delay(req['hosts'], jobid)
        return jsonify({'success': True})
    if task_name == 'read_remote_file':
        hosts = resolve_host_list(req['hosts'])
        return jsonify(list(hosts))


@app.route('/')
def hello_world():
    host = 'ubuntu@ec2-52-91-74-197.compute-1.amazonaws.com'
    jsonify()
    return jsonify({
        "file_content": execute(read_remote_file, "/etc/hosts", host=host)
    })
