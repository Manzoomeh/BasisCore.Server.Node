# BasisCore NodeJS Webserver

BasisCore is a robust NodeJS webserver designed to parallel the functionality and performance of its C# counterpart. It offers a comprehensive suite of features tailored to meet the needs of modern web applications.

## Features

### Database Connectivity
- **MongoDB:** Integrate with MongoDB for scalable, flexible NoSQL data storage.
- **Edge:** Python base gateway for communicate with BasisCore webserver. The BasisEdge framework is an ideal tool for developers who prioritize ease of access and security in their network development projects. As the name suggests, BasisEdge sits at the edge of the network.
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

### Configuration
Configure your database connections and server settings in the `config.json` file or if you dont want to use management you can use index.js.

### Running the Server

To start the server, run:
```sh
npm start
``
or
```sh
npm run dev
