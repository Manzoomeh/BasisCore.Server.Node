# BasisCore Node Webserver

- For ten years, Manzomeh Negaran Company specialized in developing websites using C# as the primary web server technology. However, as the Node.js community grew and the language demonstrated its extensive capabilities, a strategic decision was made to adopt and develop a Node.js version of their web server.
- BasisCore Node represents a robust implementation of a Node.js web server, carefully crafted to match and even exceed the functionality set by its C# predecessor. It boasts a comprehensive array of features specifically tailored to cater to the demands of modern web applications.
This versatile web server empowers developers to seamlessly retrieve data from diverse sources and databases on the server side. It then facilitates the efficient rendering and display of this data using a set of intuitive basis commands, optimizing both development efficiency and application performance.

- Additionally, our [academy](https://academy.basiscore.com/)  and [docs](https://docs.basiscore.com/index.html) page offers tutorials, guides, and best practices designed to enhance your proficiency in utilizing BasisCore Node effectively. Whether you're new to Basiscore or seeking newer techniques, our academy resources are tailored to support your learning journey.
Together, these resources not only facilitate a thorough grasp of our web server's capabilities but also empower developers to leverage its features to build robust and efficient web applications.

---
If you encounter any bugs, issues, or have ideas for additional features, please feel free to:

- **Report an Issue:** Add a new issue detailing the problem or suggestion.
- **Submit a Pull Request:** If you have a fix or feature to add, submit a pull request.

Your contributions are greatly appreciated!

---

## Features

### Connectivity

- This web server supports a diverse array of data sources, enabling robust integration into web pages. By leveraging these connections, developers can ensure the creation of well-built websites that are responsive and efficient in data handling.
- From traditional SQL databases to modern NoSQL solutions like MongoDB, the web server accommodates various types of data storage. This versatility allows developers to choose the most suitable data source for their application's specific needs, whether it involves transactional integrity, flexible schema design, or high scalability.
- **MongoDB:** Integrate with MongoDB for scalable, flexible NoSQL data storage.
- **[Edge](https://github.com/Manzoomeh/BasisCore.Server.Edge):** Python base gateway for communicate with BasisCore webserver. The BasisEdge framework is an ideal tool for developers who prioritize ease of access and security in their network development projects. As the name suggests, BasisEdge sits at the edge of the network.
- **MySQL:** Utilize MySQL for robust, relational database management.
- **Sccket:** Use it to connect and show datas from socket connections.
- **SQLite:** Employ SQLite for lightweight, file-based database operations.
- **SQL:** Use Sql Connection for commands easily and with high performance.

### Advanced Command and Caching System
- **Basis Command:** Utilize built-in Basis commands to streamline operations and development workflows.
- **External Commands:** Want your own commands? no problems! you can implement your own commands and add it to external commands directory.
- **Built-in Caching System:** Optimize performance and speed with a sophisticated caching mechanism that reduces database load and speeds up response times.

### Compatible with basiccore client version 
- basiscore node webserver works well with [BasisCore-Client](https://github.com/Manzoomeh/BasisCore.Client-v2) . BasisCore-Client is a versatile library designed specifically for client-side development across various types of web pages. It offers a rich set of commands that facilitate dynamic rendering and interactive functionalities directly within the user's browser environment.

- These commands enable developers to seamlessly integrate complex data handling, and interactive elements into their web applications without relying solely on server-side processing. By leveraging BasisCore-Client, developers can enhance user experiences through responsive interfaces and efficient data management strategies.
Whether you're building single-page applications, interactive dashboards, or complex forms, BasisCore-Client empowers you to create compelling web experiences with ease. Its documentation ensure that developers can quickly grasp its capabilities and implement sophisticated client-side functionalities effectively.

### Endpoint Management
- This endpoint manager provides advanced capabilities for scheduling layer seven routings, offering precise control over various parameters crucial for network and application management. Administrators can seamlessly modify IP addresses, ports, routing rules, request methods, services, and SSL certificates as needed.

- By scheduling these routings at the application layer (layer seven), This flexibility enables dynamic adjustments to accommodate changing traffic patterns, and support seamless failover strategies.
Moreover, the ability to manage SSL certificates ensures compliance with security standards and enhances data protection during data transmission. This comprehensive endpoint management empowers IT teams to maintain optimal network operations and deliver reliable, secure services to users and clients.

- Whether configuring routing for microservices architectures or ensuring robust security protocols, this endpoint manager facilitates precise control and flexibility essential for modern network infrastructures.
  
### File Streamer
-FileStreamer is your ultimate solution for handling diverse file processing tasks with ease. Whether you need to resize images, change formats, convert files for REST APIs, or distribute them to edge servers, FileStreamer offers a versatile platform to streamline your workflows.

- At its core, FileStreamer operates by defining jobs through arrays of steps. These steps can encompass a wide range of operations tailored to your specific requirements—whether it's resizing images to  converting documents into different formats for compatibility, or preparing media files for use across edge servers.

- Once a job is defined and executed, FileStreamer diligently processes each step, ensuring precise and efficient handling of your files. Whether you're dealing with high-resolution images, complex media files, or critical documents, FileStreamer's robust capabilities ensure that tasks are completed reliably and in accordance with your specifications.

After processing, FileStreamer securely saves the resulting files, ready for deployment or further integration into your applications. This streamlined approach not only enhances operational efficiency but also empowers you to deliver optimized content and data across your network, meeting the demands of modern web applications and services effectively.

### Security and Protocol Handling
- **Non-Secure and Secure Requests:** Handle both non-secure (HTTP) and secure (HTTPS) requests to ensure data integrity and security.
- **HTTP/2 Support:** Benefit from the performance improvements and features offered by HTTP/2.
### Debug Mode 
- Because the data is received from several sources, we have implemented a debug mode to simplify the debugging process on our pages. This mode is activated by adding a key called debug with a boolean value of true. When debug is set to true, the web server provides detailed information such as data sources, retrieval times for each source, and rendering times for each command. This helps us effectively monitor and optimize the performance of our application during development and testing phases.
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
Or you can install it as a package on your project using this 
```sh
npm install basiscore.webserver
```
```javascript
import HostManager from "basiscore.webserver";
/** @type {HostManagerOptions} */
const host = {
    Lazy: true,
    EndPoints: {
      Main01: {
        Type: "http",
        id: "fingerfood",
        Addresses: [
          {
            EndPoint: "0.0.0.0:443",
          },
          { EndPoint: "0.0.0.0:80" },
        ],
        Active: true,
        Routing: "mainService",
        CacheSettings: {
          requestMethods: "GET",
          responseHeaders: ["content-type"],
          isEnabled: true,
          connectionType: "sqlite",
          connectionSetting: {
            dbPath: "test.db",
            tableName: "cache_results",
            isFileBase: true,
            filesPath: "C:\\webservercache",
          },
        },
      },
    },
    Services: {
      mainService: {
        Type: "http",
        Settings: {
          LibPath : "F:\\AliBazregar\\BasisCore.Server.Node\\ExternalCommands",
          "Connections.edge.RoutingData": {
            endpoint: "127.0.0.1:2002",
          },
        },
      },
    },
  };
  
  const service = HostManager.fromJson(host);
  service.listenAsync();
```
or you can use this : 
```javascript
import HostManager from "basiscore.webserver";

HostManager.startManagementServer(
  "./config.json",
  {
   Type: "http",
    Settings: {
      LibPath:
        "C:\\Users\\bazrgar\\Desktop\\finger\\BasisCore.Server.Node\\ExternalCommands",
      "Connections.edge.RoutingData": {
        endpoint: "185.44.36.77:1025",
      },
    },
  },
  "185.44.36.77",
  2020,{
    LibPath : "C:\\Users\\bazrgar\\Desktop\\FINGERFOOD-MAIN\\BasisCore.Server.Node\\ExternalCommands"
  }
);
```
**⚠️ Warning: You must have the [ImageMagick](https://imagemagick.org/script/download.php) library installed on your PC to use Index4 and File Streamer..**
### Configuration
Configure your database connections and server settings in the `config.json` or `index.js` file or if you dont want to use management you can use index.js.

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

- **Type**: Specifies the type of service, such as `File`, `Sql`
- **ReadBodyTimeOut**: Specifies the maximum time allowed for reading the request body. Default is `15` seconds.
- **ProcessTimeOut**: Specifies the maximum time allowed for processing the request. Default is `30` seconds.
- **MaxBodySize**: Specifies the maximum size of the request body. Default is `1024` bytes.
- **MaxMultiPartSize**: Specifies the maximum size of multipart bodies. Default is `2048` bytes.
- **Multipart**: Settings related to managing multipart requests, of type `MultipartOptions`.
- **Settings**: Lists settings in key-value pairs used.
