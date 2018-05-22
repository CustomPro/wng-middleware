# Middleware

User Management system for DeBuNe projects

----

# Docker electrum daemon testnet

This runs a local electrum daemon testnet client

### Build Command: 
```docker build -t electrum-daemon-local .```

### Run Command:
```docker run --rm -d -p 7001:7001 --name electrum-local electrum-daemon-local```