jubatus-node-client
===================

[![Build Status](https://travis-ci.org/naokikimura/jubatus-node-client.svg?branch=master)](https://travis-ci.org/naokikimura/jubatus-node-client)
[![npm version](https://badge.fury.io/js/jubatus.svg)](https://badge.fury.io/js/jubatus)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5eaec4cefec543a5954dc61d5022f6c4)](https://www.codacy.com/app/n.kimura.cap/jubatus-node-client?utm_source=github.com&utm_medium=referral&utm_content=naokikimura/jubatus-node-client&utm_campaign=badger)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/aa18bb3e6b284c4581068ca070060007)](https://www.codacy.com/app/n.kimura.cap/jubatus-node-client?utm_source=github.com&utm_medium=referral&utm_content=naokikimura/jubatus-node-client&utm_campaign=Badge_Coverage)

Jubatus client for Node.js (unofficial)

Usage
-----

See also <http://jubat.us/en/api/index.html>

### Classifier

```js
const jubatus = require("jubatus");

const classifier = new jubatus.classifier.client.Classifier(9199, "localhost");
```

#### Train

```js
var stringValues = [ ["foo", "bar"] ],
    numValues = [ ["quux", 0.1] ],
    datum = [ stringValues, numValues ],
    label = "baz",
    data = [ [ label, datum ] ];

classifier.train(data).then(([ result ]) => {
    console.error(result);
}).catch(error => {
    console.error(error);
});
```

#### Classify

```js
var stringValues = [ [ "foo", "qux" ] ],
    numValues = [ [ "quux", 1 ] ],
    datum = [ stringValues, numValues ],
    data = [ datum ];

classifier.classify(data).then(([ result ]) => {
    result.forEach(estimateResults => {
        var mostLikely = estimateResults
                .map(([ label, score ]) =>({ label, score })
                .reduce((previous, current) => previous.score > current.score ? previous : current);
        console.log("estimate = %j", mostLikely);
    });
}).catch(error => {
    console.error(error);
});
```

Tutorial
--------

see <https://github.com/naokikimura/jubatus-tutorial-node>
