# nebula
Service to manage bootstrap and convergence of hosts.

## Web UI
... work in progress

## CLI Usage

### Bootstrap
`fab init_chef_zero:https://buzzbot:{token}@github.com/scc-gatech/chef.git`

### Converge
`fab converge`

### Change branch/role
`fab set_chef_{branch,role}:{value}`
