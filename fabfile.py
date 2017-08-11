from fabric.api import run, sudo, cd, env, task, get
from io import BytesIO

CHEF_DIR = "/etc/chef"


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
def get_chef_status():
    return read_remote_file(f"{CHEF_DIR}/status").strip()


@task
def converge():
    with cd(CHEF_DIR):
        status = get_chef_status()
        set_chef_status("converging")
        sudo("git fetch --all")
        sudo(f"git checkout $(head -n 1 {CHEF_DIR}/branch)")
        sudo("git pull")
        sudo(f"chef-client -z -r \"role[$(head -n 1 {CHEF_DIR}/role)]\" -c {CHEF_DIR}/client.rb")
        set_chef_status(status)


@task
def init_chef_zero(chef_repo_uri: str, role: str = "base", branch: str = "master"):
    install_chef()
    clone_chef_repo(chef_repo_uri)
    set_chef_status("cloned")
    set_chef_branch(branch)
    set_chef_role(role)
    converge()
    set_chef_status("ready")
