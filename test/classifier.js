/*jslint node: true, passfail: false */

var jubatus = require('../index.js'),
    spawn = require('child_process').spawn,
    async = require('async');

var isDebugEnabled = process.env.NODE_DEBUG && (/test/).test(process.env.NODE_DEBUG),
    debug = isDebugEnabled ? function (x) { console.error('TEST:', x); } : function () {};

module.exports = {
    setUp: function (callback) {
        var self = this,
            config = 'classifier_config.json',
            port = process.env.npm_package_config_test_port || 9199,
            host = 'localhost';
        self.name = 'test';
        async.series([
            function (callback) {
                /*jslint nomen: true */
                var command = 'jubaclassifier',
                    args = ['-p', port, '-n', self.name, '-f', config],
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
                self.classifier = new jubatus.classifier.client.Classifier(port, host);
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
        this.classifier.get_client().close();
        this.jubaclassifier.kill();
        callback();
    },
    train: function (test) {
        var datum = [ [ ["foo", "bar"] ], [] ],
            label = "baz",
            data = [ [label, datum] ];
        this.classifier.train(this.name, data, function (error, result) {
            debug(result);
            test.equal(error, null, result);
            test.equal(result, 1);
            test.done();
        });
    },
    classify: function (test) {
        var datum = [ [ ["foo", "bar"] ], [] ],
            data = [ datum ];
        this.classifier.classify(this.name, data, function (error, result) {
            debug(result);
            test.equal(error, null, result);
            test.equal(result.length, 1);
            test.done();
        });
    }
};
