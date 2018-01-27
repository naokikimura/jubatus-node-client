/*jslint node: true, passfail: false */

var jubatus = require('../index.js'),
    spawn = require('child_process').spawn,
    async = require('async');

var isDebugEnabled = process.env.NODE_DEBUG && (/test/).test(process.env.NODE_DEBUG),
    debug = isDebugEnabled ? function (x) { console.error('TEST:', x); } : function () {};

module.exports = {
    setUp: function (callback) {
        var self = this,
            config = 'common_config.json',
            port = process.env.npm_package_config_test_port || 9199,
            host = 'localhost',
            name = 'test';
        async.series([
            function (callback) {
                /*jslint nomen: true */
                var command = 'jubaclassifier',
                    args = ['-p', port, '-n', name, '-f', config],
                    options = { cwd: __dirname },
                    jubaclassifier = spawn(command, args, options);
                jubaclassifier.on('exit', function (code, signal) {
                    debug({ code: code, signal: signal });
                    if (code === null) {
                        callback(new Error(signal));
                        callback = function () {};
                    }
                });
                jubaclassifier.stderr.on('data', function (data) {
                    if (/RPC server startup/.test(data.toString())) {
                        callback(null);
                        callback = function () {};
                    }
                });
                if (isDebugEnabled) {
                    jubaclassifier.stderr.on('data', function (data) {
                        process.stderr.write(data);
                    });
                }
                self.jubaclassifier = jubaclassifier;
            },
            function (callback) {
                self.classifier = new jubatus.classifier.client.Classifier(port, host, name);
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
        this.classifier.getClient().close();
        this.jubaclassifier.kill();
        callback();
    },
    save: function (test) {
        var id = 'test';
        this.classifier.save(id, function (error, result) {
            debug({ error: error, result: result });
            test.equal(error, null, error);
            test.ok(result);
            test.done();
        });
    },
    load: function (test) {
        var id = 'test';
        this.classifier.load(id, function (error, result) {
            debug({ error: error, result: result });
            test.equal(error, null, error);
            test.ok(result);
            test.done();
        });
    },
    clear: function (test) {
        this.classifier.clear(function (error, result) {
            debug({ error: error, result: result });
            test.equal(error, null, error);
            test.ok(result);
            test.done();
        });
    },
    get_config: function (test) {
        this.classifier.getConfig(function (error, result) {
            debug({ error: error, result: result });
            test.equal(error, null, error);
            test.ok(result);
            test.done();
        });
    },
    get_status: function (test) {
        this.classifier.getStatus(function (error, result) {
            debug({ error: error, result: result });
            test.equal(error, null, error);
            test.ok(result);
            test.done();
        });
    },
    get_proxy_status: function (test) {
        this.classifier.getProxyStatus(function (error, result) {
            debug({ error: error, result: result });
            test.equal(error, null, error);
            test.ok(result);
            test.done();
        });
    }
};
