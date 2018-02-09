var common = {
    methods: [
        {
            "id": "save",
            "properties": {
                "return": { "type": "object" },
                "args": {
                    "type": "array",
                    "minItems": 1,
                    "maxItems": 1,
                    "items": [
                        { "name": "id", "type": "string" }
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
                        { "name": "id", "type": "string" }
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
            "id": "do_mix",
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
            "minItems": 1,
            "maxItems": 3,
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
                    "return": { "type": "integer" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [ 
                            { "name": "data", "type": "array", "items": { "$ref": "/types/labeled_datum" } }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "classify",
                "properties": {
                    "return": { "type": "array", "items": [ { "$ref": "/types/estimate_result" } ] },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "data", "type": "array", "items": { "$ref": "/types/datum" } }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_labels",
                "properties": {
                    "return": { "type": "object" },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "set_label",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "delete_label",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "type": "string" }
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
                    { "name": "label", "type": "string" },
                    { "name": "score", "type": "number" }
                ],
                "additionalItems": false
            },
            {
                "id": "labeled_datum",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "name": "label", "type": "string" },
                    { "name": "data", "$ref": "datum" }
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
                    "return": { "type": "integer" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "data", "type": "array", "items": { "$ref": "/types/scored_datum" } }
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
                            { "name": "data", "type": "array", "items": { "$ref": "/types/datum" } }
                        ],
                        "additionalItems": false
                    }
                }
            }
        ]),
        types: common.types.concat([
            {
                "id": "scored_datum",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "name": "score", "type": "number" },
                    { "name": "data", "$ref": "datum" }
                ],
                "additionalItems": false
            }
        ])
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
                            { "name": "id", "type": "string" }
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
                            { "id": "name", "type": "string" },
                            { "$ref": "/types/datum" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "complete_row_from_id",
                "properties": {
                    "return": { "$ref": "/types/datum" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "complete_row_from_datum",
                "properties": {
                    "return": { "$ref": "/types/datum" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "row", "$ref": "/types/datum" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_id",
                "properties": {
                    "return": {
                        "type": "array", "items": { "$ref": "id_with_score" }
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "name": "id", "type": "string" },
                            { "name": "size", "type": "integer" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_id_and_score",
                "properties": {
                    "return": {
                        "type": "array", "items": { "$ref": "id_with_score" }
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "name": "id", "type": "string" },
                            { "name": "score", "type": "number" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_id_and_rate",
                "properties": {
                    "return": {
                        "type": "array", "items": { "$ref": "id_with_score" }
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "name": "id", "type": "string" },
                            { "name": "rate", "type": "number" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_datum",
                "properties": {
                    "return": {
                        "type": "array", "items": { "$ref": "id_with_score" }
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "name": "row", "$ref": "/types/datum" },
                            { "name": "size", "type": "integer" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_datum_and_score",
                "properties": {
                    "return": {
                        "type": "array", "items": { "$ref": "id_with_score" }
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "name": "row", "$ref": "/types/datum" },
                            { "name": "score", "type": "number" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_datum_and_rate",
                "properties": {
                    "return": {
                        "type": "array", "items": { "$ref": "id_with_score" }
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "name": "row", "$ref": "/types/datum" },
                            { "name": "rate", "type": "number" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "decode_row",
                "properties": {
                    "return": { "$ref": "/types/datum" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_all_rows",
                "properties": {
                    "return": { "type": "array", "items": [ { "type": "string" } ] },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [],
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
                            { "name": "lhs", "$ref": "/types/datum" },
                            { "name": "rhs", "$ref": "/types/datum" }
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
                            { "name": "row", "$ref": "/types/datum" }
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
                    { "name": "id", "type": "string" },
                    { "name": "score", "type": "number" }
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
                            { "name": "id", "type": "string" },
                            { "name": "d", "$ref": "/types/datum" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "neighbor_row_from_id",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": [
                            { "$ref": "/types/id_with_score" }
                        ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "name": "id", "type": "string" },
                            { "name": "size", "type": "integer" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "neighbor_row_from_datum",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": [
                            { "$ref": "/types/id_with_score" }
                        ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "name": "query", "$ref": "/types/datum" },
                            { "name": "size", "type": "integer" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_id",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": [
                            { "$ref": "/types/id_with_score" }
                        ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "name": "id", "type": "string" },
                            { "name": "ret_num", "type": "integer" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_datum",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": [
                            { "$ref": "/types/id_with_score" }
                        ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "name": "query", "$ref": "/types/datum" },
                            { "name": "ret_num", "type": "integer" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_all_rows",
                "properties": {
                    "return": { "type": "array", "items": [ { "type": "string" } ] },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [],
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
                    { "name": "id", "type": "string" },
                    { "name": "score", "type": "number" }
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
                            { "name": "id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "add",
                "properties": {
                    "return": { "$ref": "/types/id_with_score" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "$ref": "/types/datum" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "add_bulk",
                "properties": {
                    "return": { "type": "array", "items": [ { "type": "string" } ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            {
                                "name": "data",
                                "type": "array",
                                "items": [
                                    { "$ref": "/types/datum" }
                                ]
                            }
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
                            { "name": "id", "type": "string" },
                            { "name": "row",  "$ref": "/types/datum" }
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
                            { "name": "id", "type": "string" },
                            { "name": "row",  "$ref": "/types/datum" }
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
                            { "name": "row",  "$ref": "/types/datum" }
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
                    { "name": "id", "type": "string" },
                    { "name": "score", "type": "number" }
                ],
                "additionalItems": false
            }
        ])
    },
    Burst: {
        methods: common.methods.concat([
            {
                "id": "add_documents",
                "properties": {
                    "return": { "type": "integer" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "data", "type": "array", "items": { "$ref": "/types/document" } }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_result",
                "properties": {
                    "return": { "$ref": "/types/window" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "keyword", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_result_at",
                "properties": {
                    "return": { "$ref": "/types/window" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "name": "keyword", "type": "string" },
                            { "name": "pos", "type": "number" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_all_bursted_results",
                "properties": {
                    "return": {
                        "type": "object",
                        "patternProperties": {
                            ".*": { "$ref": "/types/window" }
                          },
                          "additionalProperties": false
                    },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_all_bursted_results_at",
                "properties": {
                    "return": {
                        "type": "object",
                        "patternProperties": {
                            ".*": { "$ref": "/types/window" }
                          },
                          "additionalProperties": false
                    },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "pos", "type": "number" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_all_keywords",
                "properties": {
                    "return": { "type": "array", "items": { "$ref": "/types/keyword_with_params" } },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "add_keyword",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "keyword_with_params" , "$ref": "/types/keyword_with_params" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "remove_keyword",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "keyword", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "remove_all_keywords",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [],
                        "additionalItems": false
                    }
                }
            }
        ]),
        types: common.types.concat([
            {
                "id": "keyword_with_params",
                "type": "array",
                "minItems": 3,
                "maxItems": 3,
                "items": [
                    { "name": "keyword", "type": "string" },
                    { "name": "scaling_param", "type": "number" },
                    { "name": "gamma", "type": "number" }
                ],
                "additionalItems": false
            },
            {
                "id": "batch",
                "type": "array",
                "minItems": 3,
                "maxItems": 3,
                "items": [
                    { "name": "all_data_count", "type": "integer" },
                    { "name": "relevant_data_count", "type": "integer" },
                    { "name": "burst_weight", "type": "number" }
                ],
                "additionalItems": false
            },
            {
                "id": "window",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "name": "start_pos", "type": "number" },
                    {
                        "name": "batches",
                        "type": "array",
                        "items": { "$ref": "batch" }
                    }
                ],
                "additionalItems": false
            },
            {
                "id": "document",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "name": "pos", "type": "number" },
                    { "name": "text", "type": "string" }
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
                            { "name": "key", "type": "string" },
                            { "name": "value", "type": "number" }
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
                            { "name": "key", "type": "string" }
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
                            { "name": "key", "type": "string" }
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
                            { "name": "key", "type": "string" }
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
                            { "name": "key", "type": "string" }
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
                            { "name": "key", "type": "string" }
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
                            { "name": "key", "type": "string" },
                            { "name": "degree", "type": "integer" },
                            { "name": "center", "type": "number" }
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
                            {
                                "name": "points",
                                "type": "array",
                                "items": { "$ref": "/types/indexed_point" }
                            }
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
                    "return": {
                        "type": "array",
                        "items": { "type": "array", "items": { "$ref": "/types/weighted_datum" } }
                    },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_core_members_light",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": { "type": "array", "items": { "$ref": "/types/weighted_index" } }
                    },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_k_center",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": [ { "$ref": "/types/datum" } ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [],
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
                            { "name": "point", "$ref": "/types/datum" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_nearest_members",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": { "$ref": "/types/weighted_datum" }
                    },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "point", "$ref": "/types/datum" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_nearest_members_light",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": [ { "$ref": "/types/weighted_index" } ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "point", "$ref": "/types/datum" }
                        ],
                        "additionalItems": false
                    }
                }
            }
        ]),
        types: common.types.concat([
            {
                "id": "weighted_datum",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "name": "weight", "type": "number" },
                    { "name": "point", "$ref": "datum" }
                ],
                "additionalItems": false
            },
            {
                "id": "indexed_point",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "name": "id", "type": "string" },
                    { "name": "point", "$ref": "datum" }
                ],
                "additionalItems": false
            },
            {
                "id": "weighted_index",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "id": "weight", "type": "number" },
                    { "id": "id", "type": "string" }
                ],
                "additionalItems": false
            }
        ])
    },
    Graph: {
        methods: common.methods.concat([
            {
                "id": "create_node",
                "properties": {
                    "return": { "type": "string" },
                    "args": {
                        "type": "array",
                        "minItems": 0,
                        "maxItems": 0,
                        "items": [],
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
                            { "name": "node_id", "type": "string" }
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
                            { "name": "node_id", "type": "string" },
                            {
                                "name": "property",
                                "type": "object",
                                "patternProperties": {
                                    ".*": { "type": "string" }
                                },
                                "additionalProperties": false
                            }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "create_edge",
                "properties": {
                    "return": { "type": "number" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "name": "node_id", "type": "string" },
                            { "name": "e", "$ref": "/types/edge" }
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
                            { "name": "node_id", "type": "string" },
                            { "name": "edge_id", "type": "number" },
                            { "name": "e", "$ref": "/types/edge" }
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
                            { "name": "node_id", "type": "string" },
                            { "name": "edge_id", "type": "number" }
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
                            { "name": "node_id", "type": "string" },
                            { "name": "centrality_type", "type": "integer" },
                            { "name": "query", "$ref": "/types/preset_query" }
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
                            { "name": "query", "$ref": "/types/preset_query" }
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
                            { "name": "query", "$ref": "/types/preset_query" }
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
                            { "name": "query", "$ref": "/types/preset_query" }
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
                            { "name": "query", "$ref": "/types/preset_query" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_shortest_path",
                "properties": {
                    "return": { "type": "array", "items": [ { "type": "string" } ] },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "query", "$ref": "/types/shortest_path_query" }
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
                        "items": [],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_node",
                "properties": {
                    "return": { "$ref": "/types/node" },
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
                    "return": { "$ref": "/types/edge" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "node_id", "type": "string" },
                            { "id": "edge_id", "type": "number" }
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
                    {
                        "name": "property",
                        "type": "object",
                        "patternProperties": {
                            ".*": { "type": "string" }
                        },
                        "additionalProperties": false
                    },
                    { "name": "score", "type": "number" }
                ],
                "additionalItems": false
            },
            {
                "id": "query",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "name": "from_id", "type": "string" },
                    { "name": "to_id", "type": "string" }
                ],
                "additionalItems": false
            },
            {
                "id": "preset_query",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "name": "edge_query", "type": "array", "items": { "$ref": "query" } },
                    { "name": "node_query", "type": "array", "items": { "$ref": "query" } }
                ],
                "additionalItems": false
            },
            {
                "id": "edge",
                "type": "array",
                "minItems": 3,
                "maxItems": 3,
                "items": [
                    {
                        "name": "property",
                        "type": "object",
                        "patternProperties": {
                            ".*": { "type": "string" }
                        },
                        "additionalProperties": false
                    },
                    { "name": "source", "type": "string" },
                    { "name": "target", "type": "string" }
                ],
                "additionalItems": false
            },
            {
                "id": "shortest_path_query",
                "type": "array",
                "minItems": 4,
                "maxItems": 4,
                "items": [
                    { "name": "source", "type": "string" },
                    { "name": "target", "type": "string" },
                    { "name": "max_hop", "type": "integer" },
                    { "name": "query", "$ref": "preset_query" }
                ],
                "additionalItems": false
            }
        ])
    },
    Bandit: {
        methods: common.methods.concat([
            {
                "id": "register_arm",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "arm_id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "delete_arm",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "arm_id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "select_arm",
                "properties": {
                    "return": { "type": "string" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name": "player_id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "register_reward",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 3,
                        "maxItems": 3,
                        "items": [
                            { "name": "player_id", "type": "string" },
                            { "name": "arm_id", "type": "string" },
                            { "name": "reward", "type": "number" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_arm_info",
                "properties": {
                    "return": {
                        "name": "property",
                        "type": "object",
                        "patternProperties": {
                            ".*": { "$ref": "/types/arm_info" }
                        },
                        "additionalProperties": false
                    },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "player_id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "reset",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "player_id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            }
        ]),
        types: common.types.concat([
            {
                "id": "arm_info",
                "properties": {
                    "trial_count": "integer",
                    "weight": "number"
                }
            }
        ])
    },
    Weight: {
        methods: common.methods.concat([
            {
                "id": "update",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": { "$ref": "/types/feature" }
                    },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name":"d", "$ref": "/types/datum" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "calc_weight",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": { "$ref": "/types/feature" }
                    },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "name":"d", "$ref": "/types/datum" }
                        ],
                        "additionalItems": false
                    }
                }
            }
        ]),
        types: common.types.concat([
            {
                "id": "feature",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "name": "key", "type": "string" },
                    { "name": "value", "type": "number" }
                ],
                "additionalItems": false
            }
        ])
    }
};
