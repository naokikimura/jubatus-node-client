var common = {
    methods: [
        {
            "id": "save",
            "properties": {
                "return": { "type": "boolean" },
                "args": {
                    "type": "array",
                    "minItems": 2,
                    "maxItems": 2,
                    "items": [
                        { "id": "name", "type": "string"},
                        { "id": "id", "type": "string"}
                    ],
                    "additionalItems": false
                }
            }
        },
        {
            "id": "load",
            "properties": {
                "return": { "type": "boolean" },
                "args": {
                    "type": "array",
                    "minItems": 2,
                    "maxItems": 2,
                    "items": [
                        { "id": "name", "type": "string"},
                        { "id": "id", "type": "string"}
                    ],
                    "additionalItems": false
                }
            }
        },
        {
            "id": "get_config",
            "properties": {
                "return": { "type": "string" },
                "args": {
                    "type": "array",
                    "minItems": 1,
                    "maxItems": 1,
                    "items": [
                        { "id": "name", "type": "string"}
                    ],
                    "additionalItems": false
                }
            }
        },
        {
            "id": "get_status",
            "properties": {
                "return": { "type": "object" },
                "args": {
                    "type": "array",
                    "minItems": 1,
                    "maxItems": 1,
                    "items": [
                        { "id": "name", "type": "string"}
                    ],
                    "additionalItems": false
                }
            }
        },
        {
            "id": "clear",
            "properties": {
                "return": { "type": "boolean" },
                "args": {
                    "type": "array",
                    "minItems": 1,
                    "maxItems": 1,
                    "items": [
                        { "id": "name", "type": "string"}
                    ],
                    "additionalItems": false
                }
            }
        }
    ],
    types: [
        {
            "id": "datum",
            "type": "array",
            "items": [
                {
                    "id": "string_values",
                    "type": "array",
                    "items": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [ { "type": "string" }, { "type": "string" } ],
                        "additionalItems": false
                    }
                },
                {
                    "id": "num_values",
                    "type": "array",
                    "items": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [ { "type": "string" }, { "type": "number" } ],
                        "additionalItems": false
                    }
                }
            ],
            "additionalItems": false
        }
    ]
};

module.exports = {
    Classifier: {
        methods: common.methods.concat([
            {
                "id": "train",
                "properties": {
                    "return": { "type": "array", "items": { "type": "integer" } },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "name", "type": "string" },
                            { "id": "data", "type": "array", "items": { "type": "object" } }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "classify",
                "properties": {
                    "return": { "type": "array", "items": "object" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "name", "type": "string" },
                            { "id": "data", "type": "array", "items": { "type": "object" } }
                        ],
                        "additionalItems": false
                    }
                }
            }
        ]),
        types: common.types.concat([
            {
                "id": "estimate_result",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "id": "label", "type": "string" },
                    { "id": "score", "type": "number" }
                ],
                "additionalItems": false
            }
        ])
    },
    Regression: {
        methods: common.methods.concat([
            {
                "id": "train",
                "properties": {
                    "return": { "type": "array", "items": { "type": "number" } },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "id", "type": "string" },
                            { "id": "data", "type": "array", "items": { "type": "object" } }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "estimate",
                "properties": {
                    "return": { "type": "array", "items": { "type": "number" } },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "id", "type": "string" },
                            { "id": "data", "type": "array", "items": { "type": "object" } }
                        ],
                        "additionalItems": false
                    }
                }
            }
        ]),
        types: common.types.concat([])
    },
    Recommender: {
        methods: common.methods.concat([
            'clear_row',
            'update_row',
            'clear',
            'complete_row_from_id',
            'complete_row_from_datum',
            'similar_row_from_id',
            'similar_row_from_datum',
            'decode_row',
            'get_all_rows',
            'calc_similarity',
            'calc_l2norm'
        ]),
        types: common.types.concat(["similar_result"])
    },
    Anomaly: {
        methods: common.methods.concat([
            'clear_row',
            'add',
            'update',
            'clear',
            'calc_score',
            'get_all_rows'
        ]),
        types: common.types.concat([])
    },
    Stat: {
        methods: common.methods.concat([
            {
                "id": "push",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 3,
                        "maxItems": 3,
                        "items": [
                            { "id": "name", "type": "string" },
                            { "id": "key", "type": "string" },
                            { "id": "val", "type": [ "number", "object"] }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "sum",
                "properties": {
                    "return": { "type": "number" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "name", "type": "string" },
                            { "id": "key", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "stddev",
                "properties": {
                    "return": { "type": "number" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "name", "type": "string" },
                            { "id": "key", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "max",
                "properties": {
                    "return": { "type": "number" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "name", "type": "string" },
                            { "id": "key", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "min",
                "properties": {
                    "return": { "type": "number" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "name", "type": "string" },
                            { "id": "key", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "entropy",
                "properties": {
                    "return": { "type": "number" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "name", "type": "string" },
                            { "id": "key", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "moment",
                "properties": {
                    "return": { "type": "number" },
                    "args": {
                        "type": "array",
                        "minItems": 4,
                        "maxItems": 4,
                        "items": [
                            { "id": "name", "type": "string" },
                            { "id": "key", "type": "string" },
                            { "id": "degree", "type": "integer" },
                            { "id": "center", "type": [ "number", "object" ] }
                        ],
                        "additionalItems": false
                    }
                }
            }
        ]),
        types: common.types.concat([])
    },
    Graph: {
        methods: common.methods.concat([
            'create_node',
            'remove_node',
            'update_node',
            'create_edge',
            'update_edge',
            'remove_edge',
            'get_centrality',
            'add_centrality_query',
            'add_shortest_path_query',
            'remove_centrality_query',
            'remove_shortest_path_query',
            'get_shortest_path',
            'update_index',
            'clear',
            'get_node',
            'get_edge'
        ]),
        types: common.types.concat([
            "node",
            "preset_query",
            "edge",
            "shortest_path_query"
        ])
    }
};
