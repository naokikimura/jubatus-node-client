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
            config = 'regression_config.json',
            port = process.env.npm_package_config_test_port || 9199,
            host = 'localhost',
            name = 'test';
        async.series([
            function (callback) {
                /*jslint nomen: true */
                var command = 'jubaregression',
                    args = ['-p', port, '-n', name, '-f', config],
                    options = { cwd: __dirname },
                    jubaregression = spawn(command, args, options);
                jubaregression.on('exit', function (code, signal) {
                    debug({ code: code, signal: signal });
                    if (code === null) {
                        callback(new Error(signal));
                        callback = function () {};
                    }
                });
                jubaregression.stderr.on('data', function (data) {
                    if (/RPC server startup/.test(data.toString())) {
                        callback(null);
                        callback = function () {};
                    }
                });
                if (isDebugEnabled) {
                    jubaregression.stderr.on('data', function (data) {
                        process.stderr.write(data);
                    });
                }
                self.jubaregression = jubaregression;
            },
            function (callback) {
                self.regression = new jubatus.regression.client.Regression(port, host, name);
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
        this.regression.getClient().close();
        this.jubaregression.kill();
        callback();
    },
    train: function (test) {
        var datum = [ [ ["foo", "bar"] ], [] ],
            value = 1.01,
            data = [ [value, datum] ];
        this.regression.train(data, function (error, result) {
            debug({ error: error, result: result });
            test.equal(error, null, error);
            test.equal(result, data.length);
            test.done();
        });
    },
    estimate: function (test) {
        var self = this;
        async.series([
            function (callback) {
                var datum = [ [ ["foo", "bar"] ], [] ],
                    data = [ datum ];
                self.regression.estimate(data, function (error, result) {
                    debug({ error: error, result: result });
                    test.equal(error, null, error);
                    test.equal(result.length, data.length);
                    callback(error, result);
                });
            },
            function (callback) {
                var datum = [ [ ["foo", "bar"] ], [] ],
                    value = new msgpack.type.Double(1),
                    data = [ [value, datum] ];
                self.regression.train(data, callback);
            },
            function (callback) {
                var datum = [ [ ["foo", "bar"] ], [] ],
                    data = [ datum ];
                self.regression.estimate(data, function (error, result) {
                    debug({ error: error, result: result });
                    test.equal(error, null, error);
                    test.equal(result.length, data.length);
                    result.forEach(function (estimate) {
                        test.equal("number", typeof estimate);
                    });
                    callback(error, result);
                });
            }
        ], function (error) {
            test.done();
        });
    }
};
