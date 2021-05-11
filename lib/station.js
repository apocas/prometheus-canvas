var express = require('express'),
  http = require('http'),
  axios = require('axios'),
  crypto = require('crypto'),
  socketio = require('socket.io');

class Station {
  constructor() {
    this.data = {};
    this.app = express();
    this.app.use(express.static('./public'));
  }

  async start() {
    var self = this;
    var httpServer = http.createServer(this.app);
    this.io = socketio(httpServer);
    httpServer.listen(process.env.PORT || 80);
    await this.getData();

    this.io.on('connection', (socket) => {
      socket.emit('servers', self.data);
      socket.emit('logo', process.env.LOGO || 'images/logo.png');
    });

    setInterval(function () {
      self.getData();
    }, 60000);
  }

  async getData() {
    try {
      var serversQuery = process.env.SERVERS_QUERY || '';
      var alertsQuery = process.env.ALERTS_QUERY || '';

      if (process.env.PROMETHEUS) {
        serversQuery = process.env.PROMETHEUS + '/api/v1/query?query=count(node_exporter_build_info)%20by%20(instance)';
        alertsQuery = process.env.PROMETHEUS + '/api/v1/query?query=count(ALERTS{alertstate=%22firing%22})%20by(instance)';
      }

      let servers = await axios.get(serversQuery);
      let alerts = await axios.get(alertsQuery);

      servers = servers.data;
      alerts = alerts.data;

      let output = {};

      for (let alert of alerts.data.result) {
        let instance = alert.metric.instance;
        if (instance !== undefined) {
          let instanceSub = instance.split(':')[0];
          if (instanceSub != '' && instanceSub != 'http' && instanceSub != 'https') {
            if (output[instanceSub] === undefined) {
              output[instanceSub] = parseInt(alert.value[1]);
            } else {
              output[instanceSub] += parseInt(alert.value[1]);
            }
          }
        }
      }

      for (let service of servers.data.result) {
        let instance = service.metric.instance;
        if (instance !== undefined) {
          let instanceSub = instance.split(':')[0]
          if (instanceSub != '' && instanceSub != 'http' && instanceSub != 'https' && output[instanceSub] === undefined) {
            output[instanceSub] = 0;
          }
        }
      }

      this.data = {};
      let serverNames = Object.keys(output);
      for (let serverName of serverNames) {
        let server = output[serverName];

        let hash = crypto.createHash('md5').update(serverName).digest("hex");

        this.data[hash] = 'green';
        if (server >= process.env.RED_THRESHOLD || 4) {
          this.data[hash] = 'red';
        } else if (server >= process.env.YELLOW_THRESHOLD || 2 && server < process.env.RED_THRESHOLD || 4) {
          this.data[hash] = 'yellow';
        }
      }
      this.io.emit('servers', this.data);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Station;
