var common = {
    methods: [
        {
            "id": "save",
            "properties": {
                "return": { "type": "boolean" },
                "args": {
                    "type": "array",
                    "minItems": 1,
                    "maxItems": 1,
                    "items": [
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
                    "minItems": 1,
                    "maxItems": 1,
                    "items": [
                        { "id": "id", "type": "string"}
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
                    "minItems": 0,
                    "maxItems": 0,
                    "items": [ ],
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
                    "minItems": 0,
                    "maxItems": 0,
                    "items": [ ],
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
                    "minItems": 0,
                    "maxItems": 0,
                    "items": [ ],
                    "additionalItems": false
                }
            }
        },
        {
            "id": "get_proxy_status",
            "properties": {
                "return": { "type": "object" },
                "args": {
                    "type": "array",
                    "minItems": 0,
                    "maxItems": 0,
                    "items": [ ],
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
                },
                {
                    "id": "binary_values",
                    "type": "array",
                    "items": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [ { "type": "string" }, { "type": "object" } ],
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
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
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
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
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
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
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
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
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
            {
                "id": "clear_row",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "update_row",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "id", "type": "string" },
                            { "id": "row", "type": "array", "items": { "type": "object" } }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "complete_row_from_id",
                "properties": {
                    "return": { "type": "object" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "complete_row_from_datum",
                "properties": {
                    "return": { "type": "object" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "row", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_id",
                "properties": {
                    "return": { "type": "array", "items": { "type": "object" } },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "id", "type": "string" },
                            { "id": "size", "type": "integer" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_datum",
                "properties": {
                    "return": { "type": "array", "items": { "type": "object" } },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "row", "type": "object" },
                            { "id": "size", "type": "integer" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "decode_row",
                "properties": {
                    "return": { "type": "object" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_all_rows",
                "properties": {
                    "return": { "type": "array", "items": { "type": "object" } },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [ ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "calc_similarity",
                "properties": {
                    "return": { "type": "number" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "lhs", "type": "object" },
                            { "id": "rhs", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "calc_l2norm",
                "properties": {
                    "return": { "type": "number" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "row", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            }
        ]),
        types: common.types.concat([
            {
                "id": "id_with_score",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "id": "id", "type": "string" },
                    { "id": "score", "type": "number" }
                ],
                "additionalItems": false
            }
        ])
    },
    NearestNeighbor: {
        methods: common.methods.concat([
            {
                "id": "set_row",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "id", "type": "string" },
                            { "id": "d", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "neighbor_row_from_id",
                "properties": {
                    "return": { "type": "array", "items": { "type": "object" } },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "id", "type": "string" },
                            { "id": "size", "type": "integer" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "neighbor_row_from_data",
                "properties": {
                    "return": { "type": "array", "items": { "type": "object" } },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "query", "type": "object" },
                            { "id": "size", "type": "integer" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_id",
                "properties": {
                    "return": { "type": "array", "items": { "type": "object" } },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "id", "type": "string" },
                            { "id": "size", "type": "integer" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_data",
                "properties": {
                    "return": { "type": "array", "items": { "type": "object" } },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "query", "type": "object" },
                            { "id": "size", "type": "integer" }
                        ],
                        "additionalItems": false
                    }
                }
            }
        ]),
        types: common.types.concat([
            {
                "id": "id_with_score",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "id": "id", "type": "string" },
                    { "id": "score", "type": "number" }
                ],
                "additionalItems": false
            }
        ])
    },
    Anomaly: {
        methods: common.methods.concat([
            {
                "id": "clear_row",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "add",
                "properties": {
                    "return": { "type": "object" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "row", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "update",
                "properties": {
                    "return": { "type": "number" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "id", "type": "string" },
                            { "id": "row", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "overwrite",
                "properties": {
                    "return": { "type": "number" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "id", "type": "string" },
                            { "id": "row", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "calc_score",
                "properties": {
                    "return": { "type": "number" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "row", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_all_rows",
                "properties": {
                    "return": { "type": "array", "items": { "type": "string" } },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [ ],
                        "additionalItems": false
                    }
                }
            }
        ]),
        types: common.types.concat([
            {
                "id": "id_with_score",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "id": "id", "type": "string" },
                    { "id": "score", "type": "number" }
                ],
                "additionalItems": false
            }
        ])
    },
    Stat: {
        methods: common.methods.concat([
            {
                "id": "push",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "key", "type": "string" },
                            { "id": "value", "type": "number" }
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
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
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
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
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
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
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
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
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
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
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
                        "minItems": 3,
                        "maxItems": 3,
                        "items": [
                            { "id": "key", "type": "string" },
                            { "id": "degree", "type": "integer" },
                            { "id": "center", "type": "number" }
                        ],
                        "additionalItems": false
                    }
                }
            }
        ]),
        types: common.types.concat([])
    },
    Clustering: {
        methods: common.methods.concat([
            {
                "id": "push",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "points", "type": "array", "items": { "type": "object" } }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_revision",
                "properties": {
                    "return": { "type": "integer" },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [ ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_core_members",
                "properties": {
                    "return": { "type": "array", "items": { "type": "array", "items": { type: "object" } } },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [ ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_k_center",
                "properties": {
                    "return": { "type": "array", "items": { type: "object" } },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [ ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_nearest_center",
                "properties": {
                    "return": { "type": "object" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "point", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_nearest_members",
                "properties": {
                    "return": { "type": "arra", "items": { "type": "object" } },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "point", "type": "object" }
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
            {
                "id": "create_node",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [ ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "remove_node",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "node_id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "update_node",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "node_id", "type": "string" },
                            { "id": "property", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "create_edge",
                "properties": {
                    "return": { "type": "long" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "node_id", "type": "string" },
                            { "id": "e", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "update_edge",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 3,
                        "maxItems": 3,
                        "items": [
                            { "id": "node_id", "type": "string" },
                            { "id": "edge_id", "type": "long" },
                            { "id": "e", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "remove_edge",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "node_id", "type": "string" },
                            { "id": "edge_id", "type": "long" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_centrality",
                "properties": {
                    "return": { "type": "number" },
                    "args": {
                        "type": "array",
                        "minItems": 3,
                        "maxItems": 3,
                        "items": [
                            { "id": "node_id", "type": "string" },
                            { "id": "centrality_type", "type": "integer" },
                            { "id": "query", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "add_centrality_query",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "query", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "add_shortest_path_query",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "query", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "remove_centrality_query",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "query", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "remove_shortest_path_query",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "query", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_shortest_path",
                "properties": {
                    "return": { "type": "array", "items": { "type": "string" } },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "query", "type": "object" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "update_index",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [ ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_node",
                "properties": {
                    "return": { "type": "object" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "node_id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_edge",
                "properties": {
                    "return": { "type": "object" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "node_id", "type": "string" },
                            { "id": "edge_id", "type": "long" }
                        ],
                        "additionalItems": false
                    }
                }
            }
        ]),
        types: common.types.concat([
            {
                "id": "node",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "id": "property", "type": "object" },
                    { "id": "score", "type": "number" }
                ],
                "additionalItems": false
            },
            {
                "id": "query",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "id": "from_id", "type": "string" },
                    { "id": "to_id", "type": "string" }
                ],
                "additionalItems": false
            },
            {
                "id": "preset_query",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "id": "edge_query", "type": "array", "items": { "type": "object" } },
                    { "id": "node_query", "type": "array", "items": { "type": "object" } }
                ],
                "additionalItems": false
            },
            {
                "id": "edge",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "id": "source", "type": "string" },
                    { "id": "target", "type": "string" }
                ],
                "additionalItems": false
            },
            {
                "id": "shortest_path_query",
                "type": "array",
                "minItems": 4,
                "maxItems": 4,
                "items": [
                    { "id": "source", "type": "string" },
                    { "id": "target", "type": "string" },
                    { "id": "max_hop", "type": "integer" },
                    { "id": "query", "type": "object" }
                ],
                "additionalItems": false
            }
        ])
    }
};
