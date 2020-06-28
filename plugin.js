'use strict';

const meta = require.main.require('./src/meta');
const ranks = {0: { b:'10', p:'0', t:'30' }, 1: { b:'10,3', p:'195', t:'29,8' }, 2: { b:'10,5', p:'420', t:'29,6' }, 3: { b:'10,8', p:'700', t:'29,4' },
4: { b:'11', p:'1200', t:'29,2' }, 5: { b:'11,3', p:'1900', t:'29' }, 6: { b:'11,5', p:'3500', t:'28,8' }, 7: { b:'11,8', p:'5500', t:'28,6' },
8: { b:'12', p:'8100', t:'28,4' }, 9: { b:'12,3', p:'12000', t:'28,2' }, 10: { b:'12,5', p:'15000', t:'28' }, 11: { b:'12,8', p:'17500', t:'27,8' },
12: { b:'13', p:'21000', t:'27,6' }, 13: { b:'13,3', p:'27500', t:'27,4' }, 14: { b:'13,5', p:'35000', t:'27,2' }, 15: { b:'13,8', p:'43750', t:'27' },
16: { b:'14', p:'53750', t:'26,8' }, 17: { b:'14,3', p:'65000', t:'26,6' }, 18: { b:'14,5', p:'75000', t:'26,4' }, 19: { b:'14,8', p:'86250', t:'26,2' },
20: { b:'15', p:'100000', t:'26' }, 21: { b:'15,3', p:'112500', t:'25,8' }, 22: { b:'15,5', p:'126250', t:'25,6' }, 23: { b:'15,8', p:'141250', t:'25,4' },
24: { b:'16', p:'158750', t:'25,2' }, 25: { b:'16,3', p:'181250', t:'25' }, 26: { b:'16,5', p:'200000', t:'24,8' }, 27: { b:'16,8', p:'220000', t:'24,6' },
28: { b:'17', p:'241250', t:'24,4' }, 29: { b:'17,3', p:'263750', t:'24,2' }, 30: { b:'17,5', p:'300000', t:'24' }, 31: { b:'17,8', p:'350000', t:'23,8' },
32: { b:'18', p:'410000', t:'23,6' }, 33: { b:'18,3', p:'480000', t:'23,4' }, 34: { b:'18,5', p:'560000', t:'23,2' }, 35: { b:'18,8', p:'650000', t:'23' },
36: { b:'19', p:'750000', t:'22,8' }, 37: { b:'19,3', p:'860000', t:'22,6' }, 38: { b:'19,5', p:'980000', t:'22,4' }, 39: { b:'19,8', p:'1110000', t:'22,2' },
40: { b:'20', p:'1250000', t:'22' }, 41: { b:'20,3', p:'1500000', t:'21,8' }, 42: { b:'20,5', p:'1770000', t:'21,6' }, 43: { b:'20,8', p:'2060000', t:'21,4' },
44: { b:'21', p:'2370000', t:'21,2' }, 45: { b:'21,3', p:'2700000', t:'21' }, 46: { b:'21,5', p:'3000000', t:'20,8' }, 47: { b:'21,8', p:'3500000', t:'20,6' },
48: { b:'22', p:'4000000', t:'20,4' }, 49: { b:'22,3', p:'4500000', t:'20,2' }, 50: { b:'22,5', p:'5000000', t:'20' }, 51: { b:'22,8', p:'5750000', t:'19,8' },
52: { b:'23', p:'6500000', t:'19,6' }, 53: { b:'23,3', p:'7250000', t:'19,4' }, 54: { b:'23,5', p:'8000000', t:'19,2' }, 55: { b:'23,8', p:'9500000', t:'19' },
56: { b:'24', p:'11000000', t:'18,8' }, 57: { b:'24,3', p:'13000000', t:'18,6' }, 58: { b:'24,5', p:'15000000', t:'18,4' },
59: { b:'24,8', p:'25000000', t:'18,2' }, 60: { b:'25', p:'50000000', t:'18' }};
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
          BlockMinutes: ranks[value2.rank]['b'],
          Name: value2.name,
          NextRank: numberSpace(ranks[value2.rank + 1]['p'] - value2.totalPoints),
          Points: numberSpace(value2.points),
          PointsPerHour: numberSpace(value2.pointsPerHour),
          PointsTotal: numberSpace(value2.totalPoints),
          Rank: numberSpace(value2.rank),
          TakenZones: numberSpace(value2.taken),
          TakeoverSeconds: ranks[value2.rank]['t'],
          UniqueZonesTaken: numberSpace(value2.uniqueZonesTaken),
          Zones: numberSpace(value2.zones.length),
          Country: value2.country,
          Id: numberSpace(value2.id),
          Medals: value2.medals.length,
          Place: numberSpace(value2.place)
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
        if(key == 'Country') tbody += '<div>&nbsp;</div>';
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
