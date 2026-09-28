#!/usr/bin/env node

import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultConfigName = "basiscore.webserver.json";
const templatePath = path.join(packageRoot, "examples", "config.json");

function printHelp() {
  console.log(`BasisCore Webserver

Usage:
  basiscore-webserver start [--config <path>]
  basiscore-webserver validate [--config <path>]
  basiscore-webserver init [--config <path>] [--force]

Environment:
  BASISCORE_WEBSERVER_CONFIG   Default configuration file path.

The default configuration file is ./${defaultConfigName}.`);
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exitCode = 1;
}

function parseArguments(argv) {
  const result = {
    command: "start",
    configPath: process.env.BASISCORE_WEBSERVER_CONFIG || defaultConfigName,
    force: false,
  };
  const commands = new Set(["start", "validate", "init"]);
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      result.command = "help";
      continue;
    }
    if (argument === "--config" || argument === "-c") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error(`${argument} requires a file path.`);
      }
      result.configPath = value;
      index += 1;
      continue;
    }
    if (argument === "--force") {
      result.force = true;
      continue;
    }
    if (argument.startsWith("-")) {
      throw new Error(`Unknown option '${argument}'.`);
    }
    positional.push(argument);
  }

  if (positional.length > 0) {
    if (commands.has(positional[0])) {
      result.command = positional.shift();
    }
    if (positional.length === 1) {
      result.configPath = positional[0];
    } else if (positional.length > 1) {
      throw new Error("Only one configuration file path may be provided.");
    }
  }

  return result;
}

function resolveConfigPath(configPath) {
  return path.resolve(process.cwd(), configPath);
}

function readConfig(configPath) {
  let content;
  try {
    content = fs.readFileSync(configPath, "utf8");
  } catch (error) {
    throw new Error(`Cannot read '${configPath}': ${error.message}`);
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`'${configPath}' is not valid JSON: ${error.message}`);
  }
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function validateAddress(endpointName, address, errors) {
  if (!isPlainObject(address) || typeof address.EndPoint !== "string") {
    errors.push(`Endpoint '${endpointName}' has an address without an EndPoint string.`);
    return;
  }
  const separator = address.EndPoint.lastIndexOf(":");
  const port = Number(address.EndPoint.slice(separator + 1));
  if (separator < 1 || !Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push(`Endpoint '${endpointName}' has an invalid address '${address.EndPoint}'. Use host:port.`);
  }
}

function validateConfig(config) {
  const errors = [];
  const supportedServiceTypes = new Set(["http", "sql", "file", "proxy"]);
  if (!isPlainObject(config)) {
    return ["Configuration root must be a JSON object."];
  }
  if (!isPlainObject(config.EndPoints)) {
    errors.push("Configuration requires an 'EndPoints' object.");
  }
  if (!isPlainObject(config.Services)) {
    errors.push("Configuration requires a 'Services' object.");
  }
  if (errors.length > 0) return errors;

  Object.entries(config.Services).forEach(([serviceName, service]) => {
    if (!isPlainObject(service) || typeof service.Type !== "string") {
      errors.push(`Service '${serviceName}' requires a Type.`);
      return;
    }
    const type = service.Type.toLowerCase();
    if (!supportedServiceTypes.has(type)) {
      errors.push(`Service '${serviceName}' has unsupported Type '${service.Type}'.`);
      return;
    }
    if (!isPlainObject(service.Settings)) {
      errors.push(`Service '${serviceName}' requires a Settings object.`);
      return;
    }
    if (["http", "sql"].includes(type) && !service.Settings["Connections.edge.RoutingData"]) {
      errors.push(`Service '${serviceName}' requires Connections.edge.RoutingData.`);
    }
    if (type === "file" && !service.Settings.Directory) {
      errors.push(`File service '${serviceName}' requires Settings.Directory.`);
    }
    if (type === "proxy" && !service.Settings.BaseUrl) {
      errors.push(`Proxy service '${serviceName}' requires Settings.BaseUrl.`);
    }
  });

  Object.entries(config.EndPoints).forEach(([endpointName, endpoint]) => {
    if (!isPlainObject(endpoint)) {
      errors.push(`Endpoint '${endpointName}' must be an object.`);
      return;
    }
    if (endpoint.Active === false) return;
    if (!Array.isArray(endpoint.Addresses) || endpoint.Addresses.length === 0) {
      errors.push(`Active endpoint '${endpointName}' requires at least one address.`);
    } else {
      endpoint.Addresses.forEach((address) => validateAddress(endpointName, address, errors));
    }
    if (typeof endpoint.Routing === "string") {
      if (!config.Services[endpoint.Routing]) {
        errors.push(`Endpoint '${endpointName}' references unknown service '${endpoint.Routing}'.`);
      }
    } else if (!isPlainObject(endpoint.Routing)) {
      errors.push(`Active endpoint '${endpointName}' requires a service name or routing object.`);
    }
  });
  return errors;
}

function initConfig(configPath, force) {
  if (fs.existsSync(configPath) && !force) {
    throw new Error(`'${configPath}' already exists. Use --force to replace it.`);
  }
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.copyFileSync(templatePath, configPath);
  console.log(`Created ${configPath}`);
}

async function start(configPath, config) {
  // Config-relative certificate and command paths should not depend on where the CLI was invoked.
  process.chdir(path.dirname(configPath));
  const { default: HostManager } = await import("../hostManager.js");
  const server = HostManager.fromJson(config);
  await server.listenAsync();
  console.log(`BasisCore Webserver started from ${configPath}`);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.command === "help") {
    printHelp();
    return;
  }

  const configPath = resolveConfigPath(options.configPath);
  if (options.command === "init") {
    initConfig(configPath, options.force);
    return;
  }

  const config = readConfig(configPath);
  const errors = validateConfig(config);
  if (errors.length > 0) {
    throw new Error(`Invalid configuration:\n- ${errors.join("\n- ")}`);
  }
  if (options.command === "validate") {
    console.log(`Configuration is valid: ${configPath}`);
    return;
  }
  await start(configPath, config);
}

main().catch((error) => {
  fail(error.message || String(error));
});
