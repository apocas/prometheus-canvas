# prometheus-canvas

Turnkey canvas status page for [Prometheus](https://prometheus.io)

Each server will be represented by a dot. Green, yellow or red depending on the server's health thresholds.

## Demo

[https://live.ptisp.pt](https://live.ptisp.pt)

## Installation

`git clone https://github.com/apocas/prometheus-canvas`

`npm install`

`PROMETHEUS=http://127.0.0.1:9090 node main.js`

## Env Vars
- PROMETHEUS - Prometheus URL, using default queries. Example: http://127.0.0.1:9090
- SERVERS_QUERY - If PROMETHEUS env var isn't used, full servers list query. Example: http://127.0.0.1:9090/api/v1/query?query=count(node_exporter_build_info)%20by%20(instance)
- ALERTS_QUERY - If PROMETHEUS env var isn't used, alert count query. Example: http://127.0.0.1:9090/api/v1/query?query=count(ALERTS{alertstate=%22firing%22})%20by(instance)
- LOGO - Background logo URL. Example: http://127.0.0.1/logo.png
- RED_THRESHOLD - Number of alerts for a server to be considered red. Default: 4
- YELLOW_THRESHOLD - Number of alerts for a server to be considered yellow. Default: 2

## License

Pedro Dias - [@pedromdias](https://twitter.com/pedromdias)

Licensed under the Apache license, version 2.0 (the "license"); You may not use this file except in compliance with the license. You may obtain a copy of the license at:

    http://www.apache.org/licenses/LICENSE-2.0.html

Unless required by applicable law or agreed to in writing, software distributed under the license is distributed on an "as is" basis, without warranties or conditions of any kind, either express or implied. See the license for the specific language governing permissions and limitations under the license.