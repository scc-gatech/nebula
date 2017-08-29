from fabric.api import run, sudo, cd, env, task, get, settings
from io import BytesIO
import requests
import os
from os.path import join, dirname, isfile
from dotenv import load_dotenv
import getpass

USER = getpass.getuser()

dotenv_path = join(dirname(__file__), '.env')

if isfile(dotenv_path):
    load_dotenv(dotenv_path)

SHOULD_SLACK = os.getenv('ENABLE_SLACK_NOTIFICATION') == 'True'
SLACK_NOTIFY_CHANNEL = '#nebula-dev'

if SHOULD_SLACK:
    from slacker import Slacker
    slack = Slacker(os.getenv('SLACK_TOKEN'))

CHEF_DIR = "/etc/chef"

env.roledefs = requests.get(
    'https://sc17-gatech-optica.firebaseio.com/roles.json').json()


class FabricException(Exception):
    pass


def notify(func):

    def wrapped(*args, **kwargs):
        if SHOULD_SLACK:
            slack.chat.post_message(
                SLACK_NOTIFY_CHANNEL,
                f"@{USER} started a task: `{func.__name__}` on host(s): `{env.all_hosts}`.\n"
                f"@{USER}: please don't step away!"
            )
            ret = None
            with settings(abort_exception=FabricException):
                try:
                    ret = func(*args, **kwargs)
                except Exception as e:
                    slack.chat.post_message(
                        SLACK_NOTIFY_CHANNEL,
                        f":siren: @{USER}'s task `{func.__name__}` failed! :cry: Please investigate.\n"
                        f"Detailed error:\n"
                        f"```{str(e)}```"
                    )
                    raise e
                slack.chat.post_message(
                    SLACK_NOTIFY_CHANNEL,
                    f":white_check_mark: @{USER}'s task `{func.__name__}` succeeded."
                )
            return ret
        else:
            return func(*args, **kwargs)

    wrapped.__name__ = func.__name__
    return wrapped


@task
def read_remote_file(file_path: str):
    fd = BytesIO()
    get(file_path, fd)
    return fd.getvalue().decode('utf-8')


@task
def install_chef():
    sudo("curl -L https://omnitruck.chef.io/install.sh | bash")


@task
def clone_chef_repo(chef_repo_uri: str):
    sudo(f"rm -rf {CHEF_DIR}")
    sudo(f"git clone {chef_repo_uri} {CHEF_DIR}")


@task
def set_chef_branch(branch: str):
    sudo(f"echo {branch} > {CHEF_DIR}/branch")


@task
def set_chef_role(role: str):
    sudo(f"echo {role} > {CHEF_DIR}/role")


@task
def set_chef_status(status: str):
    sudo(f"echo {status} > {CHEF_DIR}/status")


@task
def get_chef_role():
    return read_remote_file(f"{CHEF_DIR}/role").strip()


@task
def get_chef_branch():
    return read_remote_file(f"{CHEF_DIR}/branch").strip()


@task
def get_chef_status():
    return read_remote_file(f"{CHEF_DIR}/status").strip()


@task
def get_chef_sha():
    with cd(CHEF_DIR):
        output = sudo("git rev-parse HEAD")
    return output.strip()


@task
def get_machine_info():
    return {
        "chefBranch": get_chef_branch(),
        "chefStatus": get_chef_status(),
        "chefSha": get_chef_sha(),
        "chefRole": get_chef_role()
    }


@task
@notify
def converge():
    with cd(CHEF_DIR):
        set_chef_status("converging")
        sudo("git fetch --all")
        sudo(f"git checkout $(head -n 1 {CHEF_DIR}/branch)")
        sudo("git pull")
        sudo(
            f"chef-client -z -r \"role[$(head -n 1 {CHEF_DIR}/role)]\" -c {CHEF_DIR}/client.rb"
        )
        set_chef_status("ready")


@task
@notify
def init_chef_zero(chef_repo_uri: str, role: str="base", branch: str="master"):
    install_chef()
    clone_chef_repo(chef_repo_uri)
    set_chef_status("cloned")
    set_chef_branch(branch)
    set_chef_role(role)
    converge()
    set_chef_status("ready")
