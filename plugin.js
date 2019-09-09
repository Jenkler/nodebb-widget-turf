'use strict';

const meta = require.main.require('./src/meta');
const request = require('request');

let nodebb = {};
let turf = {};
turf.updated = Math.round(new Date().getTime() / 1000);

async function updateUsers(force = false) {
  turf.now = Math.round(new Date().getTime() / 1000);
  if(force || turf.now - turf.updated > 300) {
    let config = meta.config['turf:users'].split(',');
    let users = [];
    for(let value of config) {
      users.push({'name': value.trim()});  
    }
    request.post('http://api.turfgame.com/v4/users', {
      json: users
    }, (error, res, output) => {
      if(error) {
        console.error(error);
        return false;
      }
      turf.data = [];
      for(let value2 of output) {
        let values = {
          Blocktime: value2.blocktime + 's',
          Country: value2.country,
          Id: numberSpace(value2.id),
          Medals: value2.medals.length,
          Name: value2.name,
          Place: numberSpace(value2.place),
          Points: numberSpace(value2.points),
          PointsPerHour: numberSpace(value2.pointsPerHour),
          Rank: numberSpace(value2.rank),
          Taken: numberSpace(value2.taken) + 'z',
          TotalPoints: numberSpace(value2.totalPoints),
          UniqueZonesTaken: numberSpace(value2.uniqueZonesTaken) + 'z',
          Zones: numberSpace(value2.zones.length) + 'z'
        }
        turf.data.push(values);
      }
      turf.updated = Math.round(new Date().getTime() / 1000);
      return true;
    })
  }
  else { return false }
}

function keyExists(data) {
  let args = Array.prototype.slice.call(arguments, 1);
  for(let arg of args) {
    if(!data || !data.hasOwnProperty(arg)) {
      return false;
    }
    data = data[arg];
  }
  return true;
}

function numberSpace(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function renderAdmin(req, res, next) {
  res.render('admin/turf', {});
}

exports.filterAdminHeaderBuild = function(header, callback) {
  header.plugins.push({
    route: '/turf',
    icon: 'fa-link',
    name: 'Turf'
  });
  callback(null, header);
};

exports.filterWidgetRenderTurf = function(data, callback) {
  if(keyExists(meta.config, 'turf:users')) updateUsers();
  let tbody = '';
  let thead = ''; 
  for(let x = 0; x < turf.data.length; x++) {
    thead += '<div class="td">' + turf.data[x].Name + '</div>';
    if(x == 0) for(let key in turf.data[x]) {
      if(key != 'Name') {
        tbody += '<div class="tr"><div class="name td">' + key + '</div>';
        for(let x2 = 0; x2 < turf.data.length; x2++) { 
          tbody += '<div class="td">' + turf.data[x2][key] + '</div>';
        }
        tbody += '</div>';
      }
    }
  }
  nodebb.app.render('widgets/turf', { tbody: tbody, thead: thead }, function(err, html) {
    data.html = html;
    callback(err, data);
  });
};

exports.filterWidgetsGetWidgets = function(data, callback) {
  data = data.concat([
  {
    widget: 'turf',
    name: 'Turf',
    content: '',
    description: 'A widget that shows your turf user list'
  }]);
  callback(null, data);
};

exports.staticAppLoad = function(data, callback) {
  console.log('Loading Jenkler Turf widget ' + require('./package.json').version);
  data.router.get('/admin/turf', data.middleware.admin.buildHeader, renderAdmin);
  data.router.get('/api/admin/turf', renderAdmin);
  nodebb.app = data.app;
  if(keyExists(meta.config, 'turf:users')) updateUsers(true);
  callback();
};
