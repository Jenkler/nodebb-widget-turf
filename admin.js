'use strict';

define('admin/turf', ['settings'], function(Settings) {
  let ACP = {};
  ACP.init = function() {
    Settings.load('turf', $('.turf-settings'));
    $('#save').on('click', function() {
      Settings.save('turf', $('.turf-settings'), function() {
        app.alert({
          alert_id: 'turf-saved',
          message: 'Updated Turf settings',
          timeout: 2000,
          title: 'Settings Saved',
          type: 'success'
        });
      });
    });
  };
  return ACP;
});
