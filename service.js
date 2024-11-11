import { Service } from 'node-windows';

var service = new Service({
  name: 'Geoffreys New Releases',
  description: 'Node app to retrieve Spotify new releases.',
  script: 'app.js'
});

service.on('install', function () {
  service.start();
});

service.on('start', function () {
  console.log(`${service.name} started`);
});

service.on('areadyinstalled', function () {
  console.log(`Uninstalling existing service ${service.name}`);
  service.uninstall();
});

export { service };
