# Running ROM inside an Ubuntu LXC (no Docker)

This repo ([`rom/package.json`](../package.json:1)) is a Vite + React app. The safest way to run it in an LXC is:

1. develop with Vite bound to `0.0.0.0` so you can reach it from your LAN
2. or build the static site and serve it behind a normal web server (nginx/caddy)

This guide covers both.

## LXC template + settings (Proxmox)

Use an Ubuntu template (22.04 or 24.04). For a plain Node app you do **not** need a privileged container.

Recommended:

- Unprivileged: yes
- Nesting: no (only needed when running Docker inside LXC)
- Keyctl: no
- Features: nothing special

Networking:

- Give it a static IP or a DHCP reservation
- Ensure inbound TCP is allowed to whichever port you run (5173 for dev, 4173 for preview)

## Option A: Run the dev server (Vite)

### 1) Install Node

Vite 7 works well on Node 18+ (Node 20 LTS recommended).

On Ubuntu 22.04/24.04, easiest is NodeSource packages:

```bash
apt-get update
apt-get install -y ca-certificates curl gnupg

mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" > /etc/apt/sources.list.d/nodesource.list

apt-get update
apt-get install -y nodejs
node --version
npm --version
```

### 2) Copy the app into the container

Any of these work:

- `git clone` inside the LXC
- `scp -r` from your workstation
- bind-mount the repo folder into the container (Proxmox mount point)

Example (clone):

```bash
apt-get install -y git
git clone https://github.com/sortninja/rom.git
cd rom
```

### 3) Install dependencies and run

```bash
cd rom
npm ci

# bind to all interfaces so it is reachable from outside the container
npm run dev:host
```

The `dev:host` script is defined in [`rom/package.json`](../package.json:1).

Access from your LAN:

- `http://<LXC-IP>:5173/`

If you want it only on the Proxmox host, use `npm run dev` and SSH port-forward instead.

## Option B: Build + preview (still Node)

```bash
cd rom
npm ci
npm run build
npm run preview:host
```

Access:

- `http://<LXC-IP>:4173/`

The `preview:host` script is defined in [`rom/package.json`](../package.json:1).

## Production suggestion (static files)

For a real deployment, build static files and serve them with nginx or caddy.

Build:

```bash
cd rom
npm ci
npm run build
ls -la dist
```

Then serve `dist/` with your preferred web server.

## Troubleshooting

### "It works in the container but not from my laptop"

Common causes:

- Vite bound to `localhost` only (use `npm run dev:host`)
- Firewall blocks the port (UFW on the container or network ACLs)
- Proxmox bridge/VLAN rules

### Port already in use

This repo uses `--strictPort` in `dev:host`/`preview:host`. Either stop whatever is using the port, or edit the scripts in [`rom/package.json`](../package.json:1) to use a different port.

