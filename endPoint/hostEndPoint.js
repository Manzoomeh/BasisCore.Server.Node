class HostEndPoint {
  /**
   *
   * @param {string} ip
   * @param {number} port
   */
  constructor(ip, port) {
    this._ip = ip;
    this._port = port;
  }
}

export default HostEndPoint;

// class HostEndPointOptions{
// get HostEndPointTypes Type() { get; set; }
//     List<PortListenerOptions> Addresses { get; set; }
//     int MaxHeaderSize { get; set; } = 1024;
//     bool Active { get; set; }
//     string DefaultHost { get; set; }
//     IHostSettingValue Routing { get; set; }
//     int ReadHeaderTimeOut { get; set; } = 5_000;
// }

const HostEndPointTypes = {
  http: 1,
};
