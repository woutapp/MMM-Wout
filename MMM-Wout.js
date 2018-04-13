/* global Log, Module, moment */

/* Magic Mirror
 * Module: MMM-Upwave
 *
 * By Upwave https://www.upwave.io
 * MIT Licensed.
 */
Module.register('MMM-Wout', {

	// Module config defaults.
	defaults: {
		token: '',
    maxItems: 5,
		updateInterval: 10 * 60 * 1000,
    refreshInterval: 10 * 1000,
    fade: true,				     // Set this to true to fade list from light to dark. (default is true)
		fadePoint: 0.25				// Start on 1/4th of the list.
	},

  events: [],

	// Define required scripts.
	getScripts: function() {
		return ['moment.js', 'moment-timezone.js'];
	},

  // Define required styles.
	getScripts: function() {
		return ['MMM-Wout.css', 'font-awesome.css'];
	},

  getTranslations: function() {
		return {
			en: "translations/en.json",
			nb: "translations/nb.json"
		}
	},

	// Define start sequence.
	start: function() {
		Log.info('Starting module: ' + this.name);

    var self = this;

		// Schedule update timer.
		setInterval(function() {
			self.updateEvents();
		}, this.config.updateInterval);

		// Schedule refresh timer.
		setInterval(function() {
			self.updateDom(1000);
		}, this.config.refreshInterval);

    self.updateEvents();
	},

	// Override dom generator.
	getDom: function() {
    var self = this;
    var now = moment();
    var events = this.events;
		var wrapper = document.createElement('table');
		wrapper.className = 'small bright';

		if(events.length === 0) {
			wrapper.innerHTML = (this.loaded) ? this.translate('EMPTY') : this.translate('LOADING');
			wrapper.className = 'small dimmed';
			return wrapper;
		}

    events.forEach(function(event, i) {
      var eventWrapper = document.createElement('tr');

      // Create fade effect. <-- stolen from default "calendar" module
      if(self.config.fade && self.config.fadePoint < 1) {
        if(self.config.fadePoint < 0) {
          self.config.fadePoint = 0;
        }
        var startingPoint = events.length * self.config.fadePoint;
        var steps = events.length - startingPoint;
        if(i >= startingPoint) {
          var currentStep = i - startingPoint;
          eventWrapper.style.opacity = 1 - (1 / steps * currentStep);
        }
      }

      // var symbolWrapper = document.createElement('td');
			// symbolWrapper.className = 'symbol align-right';
      // symbolWrapper.innerHTML = '<i class="fa fa-fw fa-time"></i>';

      var eventContent = document.createElement('td');
      eventContent.appendChild(document.createTextNode(event.title));

      if(now.isAfter(event.start_dt)) {
        eventContent.className = 'dimmed';
      }

      var eventDate = document.createElement('td');
      eventDate.className = 'small dimmed padding-left align-right';

      if(now.isAfter(event.start_dt) && event.end_dt && now.isBefore(event.end_dt)) {
        eventDate.innerHTML = self.translate('NOW');
      } else if(now.isAfter(event.start_dt)) {
        eventDate.innerHTML = self.translate('FINISHED');
      } else {
        eventDate.innerHTML = moment(event.start_dt).calendar();
      }

      // eventWrapper.appendChild(symbolWrapper);
      eventWrapper.appendChild(eventContent);
      eventWrapper.appendChild(eventDate);
      wrapper.appendChild(eventWrapper);
    });

    return wrapper;
	},

  updateEvents: function() {
    var startDate = moment().startOf('day');
    var endDate = moment().add(70, 'days').endOf('day');

    var url = [
      'https://www.wout.net/api/events/',
      '?start_dt__gte='+startDate.format('YYYY-MM-DD HH:mm:ss'),
      '&start_dt__lte='+endDate.format('YYYY-MM-DD HH:mm:ss'),
      '&limit='+this.config.maxItems
    ].join('');

    this.sendSocketNotification('GET_WOUT_EVENTS', {
      url: url,
      config: this.config
    });
  },

  socketNotificationReceived: function(notification, payload) {
    if(notification == 'WOUT_EVENTS_DATA') {
      this.events = payload.events;
      this.loaded = true;
      this.updateDom(1000);
    }
  },

});
