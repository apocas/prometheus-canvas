var Station = require('./lib/station');

var station = new Station();

try {
  station.start();
  console.log('Server started...');
} catch (error) {
  console.log(error);
}
