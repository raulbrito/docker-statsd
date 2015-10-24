/*jshint node:true, laxcomma:true */

/* 
 * Simple backend for statsd to flush stats to a json file.
 * It is basically the console backend with a few changes.
 *
 * This backend supports the following options:
 *
 *   jsonout.output:     Name of the while where to flush the stats
 *   jsonout.output_tmp: Name of a tempfile used for atomic writing.
 */

var fs = require('fs');

function JSONOutBackend(startupTime, config, emitter){
  var self = this;
  this.lastFlush = startupTime;
  this.lastException = startupTime;
  this.config = config.jsonout || {output: '/tmp/statsd.json'};
  if (!this.config.output_temp) {
      this.config.output_temp = this.config.output + '.tmp';
  }

  // attach
  emitter.on('flush', function(timestamp, metrics) { self.flush(timestamp, metrics); });
  emitter.on('status', function(callback) { self.status(callback); });
}

JSONOutBackend.prototype.flush = function(timestamp, metrics) {
  console.log('Flushing stats at ', new Date(timestamp * 1000).toString());

  var out = {
    counters: metrics.counters,
    timers: metrics.timers,
    gauges: metrics.gauges,
    timer_data: metrics.timer_data,
    counter_rates: metrics.counter_rates,
    sets: function (vals) {
      var ret = {};
      for (var val in vals) {
        ret[val] = vals[val].values();
      }
      return ret;
    }(metrics.sets),
    pctThreshold: metrics.pctThreshold
  }, data = JSON.stringify(out), self = this;

  console.log(data);

  fs.writeFile(this.config.output_temp, data, function(err) {
    if (!err) {
      fs.rename(self.config.output_temp,
                self.config.output);
    }
  });
};

JSONOutBackend.prototype.status = function(write) {
  ['lastFlush', 'lastException'].forEach(function(key) {
    write(null, 'jsonout', key, this[key]);
  }, this);
};

exports.init = function(startupTime, config, events) {
  var instance = new JSONOutBackend(startupTime, config, events);
  return true;
};
