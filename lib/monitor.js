var cronParser = require('cron-parser'),
    os = require('os'),
    uhura = require('uhura'),
    util = require('util');

// singleton
module.exports = new Monitor();

function Monitor() {
  this.started = false;
  this.client = null;
  this.connected = false;
};

Monitor.prototype.configure = function (config) {
  if (!config || !config.schedule) return this;

  this.id = config.id;
  this.groupid = config.groupid;

  this.schedule = config.schedule;
  this.interval = cronParser.parseExpression(this.schedule);

  this.eventHost = config.eventHost || 'localhost';
  this.eventPort = config.eventPort || 5555;

  this.connect();

  return this;
};

Monitor.prototype.connect = function() {
  this.client = uhura.createClient({
    host: this.eventHost,
    port: this.eventPort
  });

  this.client.once('connect', function() {
    console.log('connected');
    this.connected = true;
  }.bind(this));
};

Monitor.prototype.start = function () {
  if (this.started || !this.interval) return;
  this.started = true;

  function runProbe() {
    var next = this.interval.next().getTime(),
        now = Date.now(),
        interval = next - now;

    setTimeout(function () {
      this.probe(function (err, data) {
        if (err) console.error(err);

        data = {
          id: this.id,
          groupid: this.groupid,
          timestamp: now,
          stats: data
        };

        this.send(data);

        // repeat
        if (this.started) runProbe.call(this);
      }.bind(this));
    }.bind(this), interval);
  }

  runProbe.call(this);
};

Monitor.prototype.stop = function () {
  if (this.started) {
    this.started = false;
    if (this.client) {
      this.client.close();
      this.client = null;
      this.connected = false;
    }
  }
};

// probing needs to be fast
// for understanding stat values, see:
// http://nodejs.org/api/os.html
// http://nodejs.org/api/process.html
Monitor.prototype.probe = function(callback) {
  var mem = process.memoryUsage();
  var stats = {
    arch: process.arch,
    argv: process.argv,
    cpus: os.cpus(),
    cwd: process.cwd(),
    env: process.env,
    execPath: process.execPath,
    freemem: os.freemem(),
    gid: process.getgid ? process.getgid() : 0,
    heapTotal: mem.heapTotal,
    heapUsed: mem.heapUsed,
    hostname: os.hostname(),
    loadavg: os.loadavg(),
    osUptime: os.uptime(),
    pid: process.pid,
    platform: process.platform,
    release: os.release(),
    rss: mem.rss,
    title: process.title,
    totalmem: os.totalmem(),
    type: os.type(),
    uid: process.getuid ? process.getuid() : 0,
    umask: process.umask(),
    uptime: process.uptime(),
    versions: process.versions
  };

  callback(null, stats);
};

// fire and forget
Monitor.prototype.send = function(data) {
  console.log(JSON.stringify(data, null, 2));
  if (this.client && this.connected) {
    this.client.send('event', data);
  }
};
