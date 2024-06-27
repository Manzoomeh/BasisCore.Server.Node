# BasisCore NodeJS Webserver

BasisCore is a robust NodeJS webserver designed to parallel the functionality and performance of its C# counterpart. It offers a comprehensive suite of features tailored to meet the needs of modern web applications.

## Features

### Database Connectivity
- **MongoDB:** Integrate with MongoDB for scalable, flexible NoSQL data storage.
- **[Edge](https://github.com/Manzoomeh/BasisCore.Server.Edge):** Python base gateway for communicate with BasisCore webserver. The BasisEdge framework is an ideal tool for developers who prioritize ease of access and security in their network development projects. As the name suggests, BasisEdge sits at the edge of the network.
- **MySQL:** Utilize MySQL for robust, relational database management.
- **Sccket:** Use it to connect and show datas from socket connections.
- **SQLite:** Employ SQLite for lightweight, file-based database operations.
- **Redis:** Integrate with Redis for efficient, in-memory data caching and messaging.
- **SQL:** Use Sql Connection for commands easily and with high performance.

### Advanced Command and Caching System
- **Basis Command:** Utilize built-in Basis commands to streamline operations and development workflows.
- **External Commands:** Want your own commands? no problems! you can implement your own commands and add it to external commands directory.
- **Built-in Caching System:** Optimize performance and speed with a sophisticated caching mechanism that reduces database load and speeds up response times.

### Endpoint Management
- Efficiently manage and route endpoints, ensuring scalable and organized handling of API requests.
  
### File Streamer
- A FileStreamer that can handle all of your needs; resize, change format, convert use it in rest or send to edge.

### Security and Protocol Handling
- **Non-Secure and Secure Requests:** Handle both non-secure (HTTP) and secure (HTTPS) requests to ensure data integrity and security.
- **HTTP/2 Support:** Benefit from the performance improvements and features offered by HTTP/2.
### Debug Mode 
- if you want to check the work of database and check what is wrong with data sources you only need to add debug=true and by this the webserver shows you information on the end of web page with time of each command
## Getting Started

### Prerequisites
- Node.js (v20.12.1 or higher)
- npm (v10 or higher)
- MongoDB
- MySQL
- SQLite
- Redis

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/Manzoomeh/BasisCore.Server.Node.git
    cd  BasisCore.Server.Node
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```
**⚠️ Warning: You must have the [ImageMagick](https://imagemagick.org/script/download.php) library installed on your PC to use Index4 and File Streamer..**
### Configuration
Configure your database connections and server settings in the `config.json` file or if you dont want to use management you can use index.js.

### Running the Server

To start the server, run:
```sh
npm start
```
 or
```sh
npm run dev
```
### General Structure of Config File

**Lazy**
The web server processes client requests via services defined in the settings file. This property controls the loading sequence of these services. If set to `false`, all services are loaded when the web server starts. If set to `true`, services are loaded only when requested via their respective endpoints, optimizing server startup speed and resource allocation. Default value is `false`.

**Endpoints**
This property contains a list of key-value pairs where the key represents the endpoint name and the value contains settings specific to that endpoint. Each value is of type `HostEndPointOptions`.

**Services**
This property contains an array of `HostServiceOptions`, each defining settings for a host.

### HostEndPointOptions

Defines settings for an endpoint with the following properties:

- **Type**: Either `WebSocket` or `http`, indicating the communication protocol with the client.
- **Addresses**: Lists IP addresses and ports managed by this endpoint, along with their configurations. Each item is of type `PortListenerOptions`.
- **MaxHeaderSize**: Specifies the maximum allowed size for headers in requests managed by this endpoint. Default value is `1024`.
- **Active**: Specifies if the endpoint is active (`true`) or inactive (`false`).
- **DefaultHost**: Sets the default host property for all incoming requests. Used specifically in development environments where subsequent parts rely on a specific domain while the service runs on a high IP. 

### Routing

Specifies which service should process a request and generate output. This property can be a string referring to the respective service name or a list of conditions. This list is of type `ServiceSelectorPredicateOptions`.

- **ReadHeaderTimeOut**: Specifies the timeout period for reading headers in requests. Default is `5` seconds.

### PortListenerOptions

Specifies the settings for an IP and port associated with an endpoint, including:

- **EndPoint**: A string consisting of IP and port to which the endpoint listens for requests.
- **Certificate**: Contains certificate settings, accepting one of two object types based on the `type` property value: `SslCertificateOptions` or `SniCertificateOptions`.
- **ConnectionIdleTime**: Applies only to connections or HTTP2 protocols, specifying when an internal connection should close.

### SslCertificateOptions

Defines SSL certificate settings for a specific site with the following properties:

- **IgnoreValidationError**: Only applicable in `dev` mode. When enabled (`true`), SSL errors are ignored. Default is `false`.
- **Http2**: Boolean value indicating whether requests with HTTP2 protocol are accepted by this endpoint. Default is `false`.
- **http11**: Boolean value indicating whether requests with HTTP1.1 protocol are accepted by this endpoint. Default is `true`.
- **Protocol**: Specifies the SSL protocol type. Default is `none`.

### SniCertificateOptions

Defines SSL certificate settings for a specific set of sites with the following properties:

- **IgnoreValidationError**: Only applicable in `dev` mode. When enabled (`true`), SSL errors are ignored. Default is `false`.
- **Http2**: Boolean value indicating whether requests with HTTP2 protocol are accepted by this endpoint. Default is `false`.
- **http11**: Boolean value indicating whether requests with HTTP1.1 protocol are accepted by this endpoint. Default is `true`.
- **Protocol**: Specifies the SSL protocol type. Default is `none`.
- **Hosts**: Specifies the list of hosts handled by SNI, including a list of `HostCertificateOptions`.

### HostCertificateOptions

Specifies certificate information for a host, including:

- **HostNames**: An array of host names associated with SSL.
- **FilePath**: Specifies the path to the PFX certificate file.
- **Password**: Specifies the password for the PFX file.
- **KeyFilePath**: Specifies the path to the key file.

### ServiceSelectorPredicateOptions

Specifies predicates for selecting the appropriate service to handle requests, including:

- **Async**: If `true`, all predicates are evaluated simultaneously, and the first valid predicate is selected. If `false`, predicates are evaluated sequentially. Priority is given from top to bottom.
- **Items**: Contains a list of predicates, each of type `ServiceSelectorPredicateItemOptions`.

### ServiceSelectorPredicateItemOptions

Contains conditions for selecting a specific service, including:

- **Service**: Specifies the service name to select if all conditions are met.
- **Methode**: Can be a string or an array of strings specifying acceptable methods in web requests, such as post, get, delete, etc.
- **Url**: A string capable of using Regex expressions to specify matching URLs.
- **Cookie**: Specifies one or more cookie keys expected in the web request.
- **MultiPart**: Boolean indicating whether the request should be multipart (`true`) or not (`false`).
- **ClientIP**: Specifies the client's IP address.
- **Field**: Specifies one or more field names in the web request header.

### HostServiceOptions

Specifies settings for a service responsible for handling requests and converting them to output, including:

- **Type**: Specifies the type of service, such as `File`, `Proxy`, `Python`, `Sql`, or `WebSocket`.
- **ReadBodyTimeOut**: Specifies the maximum time allowed for reading the request body. Default is `15` seconds.
- **ProcessTimeOut**: Specifies the maximum time allowed for processing the request. Default is `30` seconds.
- **MaxBodySize**: Specifies the maximum size of the request body. Default is `1024` bytes.
- **MaxMultiPartSize**: Specifies the maximum size of multipart bodies. Default is `2048` bytes.
- **Multipart**: Settings related to managing multipart requests, of type `MultipartOptions`.
- **Settings**: Lists settings in key-value pairs used.
