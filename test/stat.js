/*jslint node: true, passfail: false */

var jubatus = require('../index.js'),
    msgpack = jubatus.msgpack,
    spawn = require('child_process').spawn,
    async = require('async');

var isDebugEnabled = process.env.NODE_DEBUG && (/test/).test(process.env.NODE_DEBUG),
    debug = isDebugEnabled ? function (x) { console.error('TEST:', x); } : function () {};

module.exports = {
    setUp: function (callback) {
        var self = this,
            config = 'stat_config.json',
            port = process.env.npm_package_config_test_port || 9199,
            host = 'localhost',
            name = 'test';
        async.series([
            function (callback) {
                /*jslint nomen: true */
                var command = 'jubastat',
                    args = ['-p', port, '-n', name, '-f', config],
                    options = { cwd: __dirname },
                    jubastat = spawn(command, args, options);
                jubastat.on('exit', function (code, signal) {
                    debug({ code: code, signal: signal });
                    if (code === null) {
                        callback(new Error(signal));
                        callback = function () {};
                    }
                });
                jubastat.stderr.on('data', function (data) {
                    if (/RPC server startup/.test(data.toString())) {
                        callback(null);
                        callback = function () {};
                    }
                });
                if (isDebugEnabled) {
                    jubastat.stderr.on('data', function (data) {
                        process.stderr.write(data);
                    });
                }
                self.jubastat = jubastat;
            },
            function (callback) {
                self.stat = new jubatus.stat.client.Stat(port, host, name);
                callback(null);
            }
        ], function (error) {
            if (error) {
                throw error;
            }
            callback();
        });
    },
    tearDown: function (callback) {
        this.stat.getClient().close();
        this.jubastat.kill();
        callback();
    },
    push: function (test) {
        var key = "foo",
            value = 1.01;
        this.stat.push(key, value, function (error, result) {
            debug({ error: error, result: result });
            test.equal(error, null, error);
            test.ok(result);
            test.done();
        });
    },
    sum: function (test) {
        var self = this,
            key = "foo",
            values = [1, 1.2, 0],
            expected = values.reduce(function (previous, current) { return previous + current; }, 0);
        async.series([
            function (callback) {
                async.each(values, function (value, callback) {
                    self.stat.push(key, new msgpack.type.Double(value), callback);
                }, callback);
            },
            function (callback) {
                self.stat.sum(key, function (error, result) {
                    debug({ error: error, result: result });
                    test.equal(error, null, error);
                    test.equal(result, expected);
                    callback(error, result);
                });
            }
        ], function (error) {
            test.done();
        });
    },
    stddev: function (test) {
        var self = this,
            key = "foo",
            values = [1, 1.2, 0];
        async.series([
            function (callback) {
                async.each(values, function (value, callback) {
                    self.stat.push(key, new msgpack.type.Double(value), callback);
                }, callback);
            },
            function (callback) {
                self.stat.stddev(key, function (error, result) {
                    debug({ error: error, result: result });
                    test.equal(error, null, error);
                    test.equal(typeof result, "number");
                    callback(error, result);
                });
            }
        ], function (error) {
            test.done();
        });
    },
    max: function (test) {
        var self = this,
            key = "foo",
            values = [1, 1.2, 0],
            expected = values.reduce(function (previous, current) { return previous > current ? previous : current; }, 0);
        async.series([
            function (callback) {
                async.each(values, function (value, callback) {
                    self.stat.push(key, new msgpack.type.Double(value), callback);
                }, callback);
            },
            function (callback) {
                self.stat.max(key, function (error, result) {
                    debug({ error: error, result: result });
                    test.equal(error, null, error);
                    test.equal(result, expected);
                    callback(error, result);
                });
            }
        ], function (error) {
            test.done();
        });
    },
    min: function (test) {
        var self = this,
            key = "foo",
            values = [1, 1.2, 0],
            expected = values.reduce(function (previous, current) { return previous < current ? previous : current; }, 0);
        async.series([
            function (callback) {
                async.each(values, function (value, callback) {
                    self.stat.push(key, new msgpack.type.Double(value), callback);
                }, callback);
            },
            function (callback) {
                self.stat.min(key, function (error, result) {
                    debug({ error: error, result: result });
                    test.equal(error, null, error);
                    test.equal(result, expected);
                    callback(error, result);
                });
            }
        ], function (error) {
            test.done();
        });
    },
    entropy: function (test) {
        var self = this,
            key = "foo",
            values = [1, 1.2, 0];
        async.series([
            function (callback) {
                async.each(values, function (value, callback) {
                    self.stat.push(key, new msgpack.type.Double(value), callback);
                }, callback);
            },
            function (callback) {
                self.stat.entropy(key, function (error, result) {
                    debug({ error: error, result: result });
                    test.equal(error, null, error);
                    test.equal(typeof result, "number");
                    callback(error, result);
                });
            }
        ], function (error) {
            test.done();
        });
    },
    moment: function (test) {
        var self = this,
            key = "foo",
            values = [1, 1.2, 0];
        async.series([
            function (callback) {
                async.each(values, function (value, callback) {
                    self.stat.push(key, new msgpack.type.Double(value), callback);
                }, callback);
            },
            function (callback) {
                var degree = 1,
                    center = 1.1;
                self.stat.moment(key, degree, center, function (error, result) {
                    debug({ error: error, result: result });
                    test.equal(error, null, error);
                    test.equal(typeof result, "number");
                    callback(error, result);
                });
            }
        ], function (error) {
            test.done();
        });
    }
};
