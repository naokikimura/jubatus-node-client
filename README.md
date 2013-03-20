jubatus-node-client
===================

Jubatus client for Node.js (unofficial)

Usage
-----

See also <http://jubat.us/en/api.html>

### Classifier

    var jubatus = require("jubatus"),
        classifier = new jubatus.classifier.client.Classifier(9199, "localhost");

#### Train

    var name = "sample",
        stringValues = [ ["foo", "bar"] ],
        numValues = [],
        datum = [stringValues, numValues],
        label = "baz",
        data = [ [label, datum] ];

    classifier.train(name, data, function (error, result) {
        if (error) {
            throw new Error(error);
        }
    });

#### Classify

    var name = "sample",
        stringValues = [ ["foo", "qux"] ],
        numValues = [],
        datum = [stringValues, numValues],
        data = [datum];

    classifier.classify(name, data, function (error, result) {
        if (error) {
            throw new Error(error);
        }

        result.forEach(function (estimateResults) {
            var mostLikely = estimateResults
                    .map(function (estimateResult) {
                        return { label: estimateResult[0], score: estimateResult[1] };
                    })
                    .reduce(function (previous, current) {
                        return previous.score > current.score ? previous : current;
                    }, { label: null, score: NaN });
            console.log("estimate = %j", mostLikely);
        });
    });
