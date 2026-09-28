# npm Edition Guide

This document explains how `basiscore.server` `2.0.0` differs from the previous npm release and how to use it. The new npm edition runs directly on Node.js. Docker remains supported, but it is no longer required to install or run the package.

## What Changed

| Area | Previous npm release | New npm edition |
| --- | --- | --- |
| Startup | Depended on a Docker-oriented entry point and environment variables such as `CONFIG_PATH` | Uses the standalone `basiscore-webserver` CLI and an explicit config file |
| Config creation | No standard config-generation command | `basiscore-webserver init` creates a safe sample without secrets |
| Config checks | Most errors appeared during bootstrap | `basiscore-webserver validate` reports structural errors before startup |
| Relative paths | Depended on the process working directory | Certificate, cache, and `LibPath` paths resolve relative to the config file directory |
| Service loading | Some declared service types were not reachable during bootstrap | `http`, `sql`, `file`, and `proxy` are explicitly loaded |
| Port binding errors | Could be hidden after process startup | A bind or listen failure makes `start` fail with a non-zero exit code |
| Published files | Development and deployment files could be included | The npm tarball includes only runtime code, the CLI, examples, README, and LICENSE |

## Benefits of the New Version

- **Standard installation:** Run the server with `npm install` or `npx`, without first building a Docker image.
- **Low-risk migration:** The established `config.json` model remains intact: `EndPoints`, `Services`, `Settings`, and `Connections.*` keys are unchanged.
- **Earlier failure detection:** Validate endpoint addresses, service types, and routing references before restarting production.
- **Predictable paths:** Starting the CLI from a different directory does not change the meaning of relative paths in the config.
- **Better npm compatibility:** Importing and running the server does not require deployment-specific environment variables for normal `http`, `sql`, `file`, or `proxy` service usage.
- **Smaller, cleaner package:** The `files` allowlist keeps Docker, deployment, and test artifacts out of the published package.

## Requirements

- Node.js `>= 18.18.0`; Node.js 20 LTS is recommended.
- npm `>= 9`.
- A reachable BasisCore Edge endpoint for `http` or `sql` services.
- Certificate files only when enabling HTTPS or HTTP/2.
- `sharp` and `sqlite3` are native dependencies. On platforms without a prebuilt binary, install Python 3, a C/C++ toolchain, and the platform build prerequisites.

## Install and Quick Start

Install globally:

```bash
npm install --global basiscore.server
mkdir my-webserver && cd my-webserver
basiscore-webserver init
```

Or install locally:

```bash
mkdir my-webserver && cd my-webserver
npm install basiscore.server
npx basiscore-webserver init
```

The command creates `basiscore.webserver.json`. Update the Edge endpoint for the target environment:

```json
{
  "Connections.edge.RoutingData": {
    "endpoint": "127.0.0.1:2001"
  }
}
```

Validate and start the server:

```bash
basiscore-webserver validate
basiscore-webserver start
```

The bundled sample listens on `0.0.0.0:8080` and forwards requests to Edge at `127.0.0.1:2001`.

## Run From the Repository

When working directly from the source repository, install dependencies from the lockfile and use the repository scripts:

```bash
npm ci
npm run validate
npm run dev
```

`npm run validate` validates the default `basiscore.webserver.json` in the repository root. `npm run dev` starts the same standalone CLI with deprecation tracing enabled. For a normal start without deprecation tracing, use:

```bash
npm start
```

## CLI Reference

```text
basiscore-webserver init [--config <path>] [--force]
basiscore-webserver validate [--config <path>]
basiscore-webserver start [--config <path>]
```

- `init` creates a sample config and refuses to overwrite an existing file unless `--force` is specified.
- `validate` checks JSON, active endpoints, `host:port` addresses, service types, and each service's required settings.
- `start` performs the same validation before starting the server.

Use `BASISCORE_WEBSERVER_CONFIG` to define the default config location:

```bash
export BASISCORE_WEBSERVER_CONFIG=/etc/basiscore/webserver.json
basiscore-webserver start
```

## Config Compatibility and Migration

In most cases, reuse an existing config without converting it:

```bash
basiscore-webserver validate --config ./config.json
basiscore-webserver start --config ./config.json
```

Review the following before migration:

1. `EndPoints` and `Services` must be objects.
2. Every active endpoint must have valid `Addresses` and `Routing` values.
3. Each `EndPoint` must use `host:port`, for example `0.0.0.0:8080`.
4. `http` and `sql` services require `Settings["Connections.edge.RoutingData"]`.
5. A `proxy` service requires `Settings.BaseUrl`.
6. A `file` service requires `Settings.Directory`.
7. Existing absolute `LibPath` values remain valid. Relative paths now resolve from the config file directory.

`LibPath` is not required for the external commands bundled with the package. Configure it only for custom commands. When `basiscore.server` is installed as a dependency, the package path is normally:

```text
./node_modules/basiscore.server/ExternalCommands
```

When running directly from this source repository, the repository copy is available at:

```text
./ExternalCommands
```

## Minimal HTTP/Edge Config

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
      "Settings": {
        "Connections.edge.RoutingData": {
          "endpoint": "127.0.0.1:2001"
        }
      }
    }
  }
}
```

## npm and Docker

The npm package does not replace the Docker image. Docker remains appropriate when a deployment needs a reproducible image, orchestration, volume mounts, secret injection, or network isolation.

The npm edition provides a standard entry point outside a container. Docker-only conventions such as `CONFIG_PATH` are not required by the CLI. When Docker and npm use the same configuration, keep it in a mounted volume or secret manager and pass it through `--config` or `BASISCORE_WEBSERVER_CONFIG`.

## Programmatic Use

Use `HostManager` directly in an ESM application:

```js
import HostManager from "basiscore.server";

const server = HostManager.fromJson(config);
await server.listenAsync();
```

CLI validation is not executed automatically in programmatic use. Validate the configuration with `basiscore-webserver validate` before deploying it.

## Operational Notes

- Do not commit Edge endpoints, database credentials, TLS passwords, or certificate files.
- Validate every configuration change before a production restart.
- Bind private services to `127.0.0.1` or a private network interface.
- Use a `proxy` service for a conventional HTTP upstream. `http` services are designed for BasisCore Edge.
- The package has been tested and packed successfully, but native dependencies and Edge connectivity must also be tested in the destination environment.
- Review `npm audit --omit=dev` before public release. Vulnerability fixes that require major dependency upgrades should be released separately after compatibility testing.

## Maintainer Publishing Checklist

```bash
npm ci
npm test
npm run validate -- --config ./examples/config.json
npm pack --dry-run
npm publish
```
