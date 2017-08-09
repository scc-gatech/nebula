# nebula
Service to manage bootstrap and convergence of hosts.

## Web UI
... work in progress

## CLI Usage

### Bootstrap
`fab init_chef_zero:https://{username}:{token}@github.com/scc-gatech/chef.git -u {ubuntu,cyclecloud} -h {comma_separated_list}`

Note: 
 - `username`: GitHub username
 - `token`: Personal access token created from [here](https://github.com/settings/tokens). Make sure `repos` is ticked.
 - `-u {ubuntu, cyclecloud}`: Depends on which service you're using. This can be any user that have passwordless sudo access.
 - `-h {comma_separated_list}`: list of hosts. On CycleCloud, this might be different **ports** from the same host (e.g., `13.91.95.209:55100,13.91.95.209:55101,13.91.95.209:55102`)


### Converge
`fab converge`

### Change branch/role
`fab set_chef_{branch,role}:{value}`
