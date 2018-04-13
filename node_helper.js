var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
  start: function() {
    this.config = null;
    this.url = '';
  },

  socketNotificationReceived: function(notification, payload) {
    if(notification == 'GET_WOUT_EVENTS') {
      this.config = payload.config;
      this.url = payload.url;
      this.getEventsFromWout();
    }
  },

  getEventsFromWout: function() {
    var self = this;

    request({
      url: self.url,
      method: 'GET',
      headers: {
        'Authorization': 'Token ' + this.config.token
      }
    }, function(error, response, message) {
      if(!error && (response.statusCode == 200 || response.statusCode == 304)) {
        self.sendSocketNotification('WOUT_EVENTS_DATA', {
          events: JSON.parse(message).results
        });
      }
    });
  }
});
