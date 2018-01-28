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
                jubaclassifier.stdout.on('data', function (data) {
                    if (/RPC server startup/.test(data.toString())) {
                        callback(null);
                        callback = function () {};
                    }
                });
                if (isDebugEnabled) {
                    jubaclassifier.stdout.on('data', function (data) {
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
        var datum = [ [ ["foo", "bar"] ], [ ["qux", 1] ] ],
            data = [ datum ];
        self.classifier.classify(data).then(([ result ]) => {
            debug({ result: result });
            test.equal(result.length, 1);

            let datum = [ [ ["foo", "bar"] ], [ ["qux", 1] ] ],
                label = "baz",
                data = [ [ label, datum ] ];
            return self.classifier.train(data);
        }).then(([ result ]) => {
            let datum = [ [ ["foo", "bar"] ], [] ],
                data = [ datum ];
            return self.classifier.classify(data);
        }).then(([ result ]) => {
            debug({ result: result });
            test.equal(result.length, 1);
            result.forEach(estimates => {
                test.equal("string", typeof estimates[0][0]);
                test.equal("number", typeof estimates[0][1]);
            });
            test.done();
        }).catch(error => {
            debug({ error: error });
            test.ok(false, error);
            test.done();
        });
    }
};
