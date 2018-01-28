jubatus-node-client
===================

Jubatus client for Node.js (unofficial)

Usage
-----

See also <http://jubat.us/en/api/index.html>

### Classifier

    var jubatus = require("jubatus"),
        classifier = new jubatus.classifier.client.Classifier(9199, "localhost");

#### Train

    var stringValues = [ ["foo", "bar"] ],
        numValues = [ ["quux", 0.1] ],
        datum = [stringValues, numValues],
        label = "baz",
        data = [ [label, datum] ];

    classifier.train(data).then(([ result ] ) => {
        console.error(result);
    }).catch(error => {
        console.error(error);
    });

#### Classify

    var stringValues = [ ["foo", "qux"] ],
        numValues = [ ["quux", 1] ],
        datum = [stringValues, numValues],
        data = [datum];

    classifier.classify(data).then(([ result ] ) => {
        result.forEach(estimateResults => {
            var mostLikely = estimateResults
                    .map(([ label, score ]) =>({ label, score })
                    .reduce((previous, current) => {
                        return previous.score > current.score ? previous : current;
                    }, { label: null, score: NaN });
            console.log("estimate = %j", mostLikely);
        });
    }).catch(error => {
        console.error(error);
    });

Tutorial
--------

see <https://github.com/naokikimura/jubatus-tutorial-node>
