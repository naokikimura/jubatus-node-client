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
            config = 'classifier_config.json',
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
    train: function (test) {
        var datum = [ [ ["foo", "bar"] ], [ ["qux", 1.1] ] ],
            label = "baz",
            data = [ [label, datum] ];
        this.classifier.train(data, function (error, result) {
            debug({ error: error, result: result });
            test.equal(error, null, error);
            test.equal(result, 1);
            test.done();
        });
    },
    classify: function (test) {
        var self = this;
        async.series([
            function (callback) {
                var datum = [ [ ["foo", "bar"] ], [ ["qux", new msgpack.type.Double(1)] ] ],
                    data = [ datum ];
                self.classifier.classify(data, function (error, result) {
                    debug({ error: error, result: result });
                    test.equal(error, null, error);
                    test.equal(result.length, data.length);
                    callback(error, result);
                });
            },
            function (callback) {
                var datum = [ [ ["foo", "bar"] ], [ ["qux", new msgpack.type.Double(1)] ] ],
                    label = "baz",
                    data = [ [label, datum] ];
                self.classifier.train(data, callback);
            },
            function (callback) {
                var datum = [ [ ["foo", "bar"] ], [] ],
                    data = [ datum ];
                self.classifier.classify(data, function (error, result) {
                    debug({ error: error, result: result });
                    test.equal(error, null, error);
                    test.equal(result.length, data.length);
                    result.forEach(function (estimates) {
                        test.equal("string", typeof estimates[0][0]);
                        test.equal("number", typeof estimates[0][1]);
                    });
                    callback(error, result);
                });
            }
        ], function (error) {
            test.done();
        });
    }
};
