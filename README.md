# BasisCore Server

A configuration-driven Node.js web server for BasisCore Edge applications. It supports HTTP, HTTPS, HTTP/2, SNI certificates, request routing, reverse proxies, file services, upload handling, and optional cache backends.

This package runs directly on Node.js. Docker is optional and is not required for installation or use.

## Requirements

- Node.js `>= 18.18.0` (Node.js 20 LTS is recommended)
- npm `>= 9`
- A reachable BasisCore Edge endpoint when using a service with `Type: "http"`
- Certificate files only when configuring HTTPS or HTTP/2

The package includes native dependencies (`sharp` and `sqlite3`). Prebuilt binaries are downloaded for common Linux, macOS, and Windows targets. If npm must compile them locally, install a C/C++ build toolchain, Python 3, and the platform build prerequisites before installing.

## Install

Install globally to use the CLI from any project:

```bash
npm install --global basiscore.server
```

Or install it in an application project:

```bash
npm install basiscore.server
npx basiscore-webserver init
```

The CLI creates `basiscore.webserver.json` in the current directory. It contains no secrets and is safe to use as a starting point.

## Quick Start

1. Create a configuration file:

```bash
basiscore-webserver init
```

2. Update the sample Edge endpoint in `basiscore.webserver.json`:

```json
{
  "Connections.edge.RoutingData": {
    "endpoint": "127.0.0.1:2001"
  }
}
```

3. Validate the configuration before starting the server:

```bash
basiscore-webserver validate
```

4. Start the server:

```bash
basiscore-webserver start
```

The bundled example listens on `http://0.0.0.0:8080` and forwards requests to `127.0.0.1:2001`.

## CLI

```text
basiscore-webserver start [--config <path>]
basiscore-webserver validate [--config <path>]
basiscore-webserver init [--config <path>] [--force]
```

You can also set the default config location with `BASISCORE_WEBSERVER_CONFIG`:

```bash
BASISCORE_WEBSERVER_CONFIG=/etc/basiscore/webserver.json basiscore-webserver start
```

Paths inside a configuration file are resolved relative to the configuration file directory. This applies to certificates, cache files, and `LibPath`.

## Configuration

The npm release uses the established `config.json` structure used by earlier releases. Existing configurations can be reused by pointing the CLI at their file:

```bash
basiscore-webserver validate --config ./config.json
basiscore-webserver start --config ./config.json
```

A minimal Edge-backed server configuration looks like this:

```json
{
  "Lazy": true,
  "EndPoints": {
    "public": {
      "Type": "http",
      "Addresses": [{ "EndPoint": "0.0.0.0:8080" }],
      "Active": true,
      "Routing": "gateway"
    }
  },
  "Services": {
    "gateway": {
      "Type": "http",
      "ReadBodyTimeout": 300000,
      "ProcessTimeout": 300000,
      "MaxBodySize": 50000000,
      "Settings": {
        "Connections.edge.RoutingData": {
          "endpoint": "127.0.0.1:2001"
        },
        "Default.MultiPart.CookieName": "uploadcookie"
      }
    }
  }
}
```

### Endpoints

Each active endpoint needs an address and routing target:

```json
{
  "Type": "http",
  "Addresses": [{ "EndPoint": "0.0.0.0:8080" }],
  "Active": true,
  "Routing": "gateway"
}
```

`EndPoint` uses `host:port`. Set `Active` to `false` to keep an endpoint in the file without binding its port.

### Services

Supported service types are:

- `http`: forwards the request lifecycle to a BasisCore Edge routing endpoint.
- `proxy`: forwards regular HTTP/HTTPS requests to an upstream `BaseUrl`.
- `file`: serves files from the configured root path. Directory requests serve `index.html`; missing files return 404.

The standalone CLI uses only the configuration file and the optional standalone environment settings documented in the root `.env.example`.

A proxy service example:

```json
{
  "backend": {
    "Type": "proxy",
    "Settings": {
      "BaseUrl": "http://127.0.0.1:3000",
      "TimeoutMs": 120000,
      "MaxResponseSize": 50000000
    }
  }
}
```

A router can select services by hostname and path using `Routing.Items`. Keep one item without `Url` as the fallback.

### HTTPS, HTTP/2, and SNI

Add a certificate to an endpoint address to enable TLS. Set `Http2` to `true` to use HTTP/2:

```json
{
  "EndPoint": "0.0.0.0:443",
  "Certificate": {
    "Type": "ssl",
    "PfxPath": "./certs/example.pfx",
    "PfxPassword": "read-this-from-a-secret",
    "Http2": true
  }
}
```

Use `Type: "sni"` and `Hosts` for multiple hostnames. Do not commit certificate files or passwords. Prefer secret stores, environment-based config generation, or restrictive filesystem permissions.

## Migration From Older npm Releases

The format remains compatible with the previous `config.json` model:

- `EndPoints`, `Services`, `Settings`, and `Connections.*` keys are unchanged.
- Existing absolute paths remain valid.
- Relative paths now consistently resolve from the config file directory when started through the CLI.
- `LibPath` is optional. Set it only when a deployment uses custom external commands; for bundled commands use `./node_modules/basiscore.server/ExternalCommands`.
- Docker-only environment variables such as `CONFIG_PATH` are not required by the npm CLI.

Before upgrading a production instance, run `basiscore-webserver validate --config <path>` and test the configuration on a non-production port.

## Programmatic Usage

The server can also be embedded in an ESM application:

```js
import HostManager from "basiscore.server";

const config = {
  Lazy: true,
  EndPoints: {
    public: {
      Type: "http",
      Addresses: [{ EndPoint: "127.0.0.1:8080" }],
      Active: true,
      Routing: "gateway"
    }
  },
  Services: {
    gateway: {
      Type: "http",
      Settings: {
        "Connections.edge.RoutingData": { endpoint: "127.0.0.1:2001" }
      }
    }
  }
};

const server = HostManager.fromJson(config);
await server.listenAsync();
```

## Operational Notes

- Keep database connection strings, Edge addresses, and TLS passwords outside source control.
- Bind private services to `127.0.0.1` or a private network interface.
- Place a reverse proxy or load balancer in front of public deployments when you need rate limiting, managed certificates, or access logs.
- Use an explicit `proxy` service for conventional HTTP upstreams. Do not use an Edge service for an HTTP-only upstream.
- Validate every configuration change before restarting a production server.

## Publishing

Maintainers can verify the package contents before publishing:

```bash
npm ci
npm run validate -- --config ./examples/config.json
npm pack --dry-run
npm publish
```

Publish a prerelease first when testing a new major version:

```bash
npm version prerelease --preid=next
npm publish --tag next
```

## License

ISC
