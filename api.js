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
                        { "id": "id", "type": "string" }
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
                        { "id": "id", "type": "string" }
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
                            { "id": "data", "type": "array", "items": { "type": "object" } }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "classify",
                "properties": {
                    "return": { "type": "array", "items": [ { "type": "array" } ] },
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
                            { type: "string" }
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
                            { type: "string" }
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
                    "return": { "type": "integer" },
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
                            {
                                "id": "row",
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
                                ]
                            }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "complete_row_from_id",
                "properties": {
                    "return": {
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
                    },
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
                    "return": {
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
                    },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "row", "type": "array" }
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
                            {
                                "type": "array",
                                "minItems": 2,
                                "maxItems": 2,
                                "items": [
                                    { "id": "id", "type": "string" },
                                    { "id": "score", "type": "number" }
                                ]
                            }
                        ]
                    },
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
                "id": "similar_row_from_id_and_score",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": [
                            {
                                "type": "array",
                                "minItems": 2,
                                "maxItems": 2,
                                "items": [
                                    { "id": "id", "type": "string" },
                                    { "id": "score", "type": "number" }
                                ]
                            }
                        ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "id", "type": "string" },
                            { "id": "score", "type": "number" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_id_and_rate",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": [
                            {
                                "type": "array",
                                "minItems": 2,
                                "maxItems": 2,
                                "items": [
                                    { "id": "id", "type": "string" },
                                    { "id": "score", "type": "number" }
                                ]
                            }
                        ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "id", "type": "string" },
                            { "id": "rate", "type": "number" }
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
                            {
                                "type": "array",
                                "minItems": 2,
                                "maxItems": 2,
                                "items": [
                                    { "id": "id", "type": "string" },
                                    { "id": "score", "type": "number" }
                                ]
                            }
                        ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "row", "type": "array" },
                            { "id": "size", "type": "integer" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_datum_and_score",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": [
                            {
                                "type": "array",
                                "minItems": 2,
                                "maxItems": 2,
                                "items": [
                                    { "id": "id", "type": "string" },
                                    { "id": "score", "type": "number" }
                                ]
                            }
                        ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "row", "type": "array" },
                            { "id": "score", "type": "number" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "similar_row_from_datum_and_rate",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": [
                            {
                                "type": "array",
                                "minItems": 2,
                                "maxItems": 2,
                                "items": [
                                    { "id": "id", "type": "string" },
                                    { "id": "score", "type": "number" }
                                ]
                            }
                        ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "row", "type": "array" },
                            { "id": "rate", "type": "number" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "decode_row",
                "properties": {
                    "return": { "id": "datum", "type": "array" },
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
                            { "id": "lhs", "type": "array" },
                            { "id": "rhs", "type": "array" }
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
                            { "id": "row", "type": "array" }
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
                    "return": {
                        "type": "array",
                        "items": [
                            {
                                "type": "array",
                                "items": [
                                    { "id": "id", "type": "string" },
                                    { "id": "score", "type": "number" }
                                ]
                            }
                        ]
                    },
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
                "id": "neighbor_row_from_datum",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": [
                            {
                                "type": "array",
                                "items": [
                                    { "id": "id", "type": "string" },
                                    { "id": "score", "type": "number" }
                                ]
                            }
                        ]
                    },
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
                    "return": {
                        "type": "array",
                        "items": [
                            {
                                "type": "array",
                                "items": [
                                    { "id": "id", "type": "string" },
                                    { "id": "score", "type": "number" }
                                ]
                            }
                        ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "id", "type": "string" },
                            { "id": "ret_num", "type": "integer" }
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
                            {
                                "type": "array",
                                "items": [
                                    { "id": "id", "type": "string" },
                                    { "id": "score", "type": "number" }
                                ]
                            }
                        ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "query", "type": "object" },
                            { "id": "ret_num", "type": "integer" }
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
                    "return": {
                        "id": "id_with_score",
                        "type": "array",
                        "items": [
                            { "id": "id", "type": "string" },
                            { "id": "score", "type": "number" }
                        ]
                    },
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
                "id": "add_bulk",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": [
                            { "type": "string" }
                        ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            {
                                "id": "data",
                                "type": "array",
                                "items": [
                                    { "type": "object" }
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
                            {
                                "type": "array",
                                "items": [
                                    {
                                        "id": "document",
                                        "type": "array",
                                        "items": [
                                            { "id": "pos", "type": "number" },
                                            { "id": "text", "type": "string" }
                                        ]
                                    }
                                ]
                            }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_result",
                "properties": {
                    "return": { "type": "array" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "keyword", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_result_at",
                "properties": {
                    "return": { "type": "array" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "keyword", "type": "string" },
                            { "id": "pos", "type": "number" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_all_bursted_results",
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
                "id": "get_all_bursted_results_at",
                "properties": {
                    "return": { "type": "object" },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "id": "pos", "type": "number" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_all_keywords",
                "properties": {
                    "return": { "type": "array" },
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
                            {
                                "id": "keyword_with_params",
                                "type": "array",
                                "items": [
                                    { "id": "keyword", "type": "string" },
                                    { "id": "scaling_param", "type": "number" },
                                    { "id": "gamma", "type": "number" }
                                ]
                            }
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
                            { "id": "keyword", "type": "string" }
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
                "items": [
                    { "id": "keyword", "type": "string" },
                    { "id": "scaling_param", "type": "number" },
                    { "id": "gamma", "type": "number" }
                ]
            },
            {
                "id": "batch",
                "type": "array",
                "items": [
                    { "id": "all_data_count", "type": "integer" },
                    { "id": "relevant_data_count", "type": "integer" },
                    { "id": "burst_weight", "type": "number" }
                ]
            },
            {
                "id": "window",
                "type": "array",
                "items": [
                    { "id": "start_pos", "type": "number" },
                    {
                        "id": "batches",
                        "type": "array",
                        "items": [
                            {
                                "id": "batch",
                                "type": "array",
                                "items": [
                                    { "id": "all_data_count", "type": "integer" },
                                    { "id": "relevant_data_count", "type": "integer" },
                                    { "id": "burst_weight", "type": "number" }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "id": "document",
                "type": "array",
                "items": [
                    { "id": "pos", "type": "number" },
                    { "id": "text", "type": "string" }
                ]
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
                            {
                                "id": "points",
                                "type": "array",
                                "items": [
                                    {
                                        "type": "array",
                                        "minItems": 2,
                                        "maxItems": 2,
                                        "items": [
                                            { "id": "id", "type": "string" },
                                            { "id": "point", "type": "object" }
                                        ]
                                    }
                                ]
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
                        "items": [
                            {
                                "type": "array",
                                "items": [ { "type": "object" } ]
                            }
                        ]
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
                        "items": [
                            {
                                "type": "array",
                                "items": [ { "type": "object" } ]
                            }
                        ]
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
                        "items": [ { "type": "object" } ]
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
                            { "id": "point", "type": "object" }
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
                        "items": [ { "type": "object" } ]
                    },
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
                "id": "get_nearest_members_light",
                "properties": {
                    "return": {
                        "type": "array",
                        "items": [ { "type": "object" } ]
                    },
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
        types: common.types.concat([
            {
                "id": "weighted_datum",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "id": "weight", "type": "number" },
                    { "id": "point", "type": "object" }
                ],
                "additionalItems": false
            },
            {
                "id": "indexed_point",
                "type": "array",
                "minItems": 2,
                "maxItems": 2,
                "items": [
                    { "id": "id", "type": "string" },
                    { "id": "point", "type": "object" }
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
                    "return": { "type": "number" },
                    "args": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": [
                            { "id": "node_id", "type": "string" },
                            {
                                "id": "e",
                                "type": "array",
                                "minItems": 3,
                                "maxItems": 3,
                                "items": [
                                    { "id": "property", "type": "object" },
                                    { "id": "source", "type": "string" },
                                    { "id": "target", "type": "string" },
                                ]
                            }
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
                            { "id": "edge_id", "type": "number" },
                            {
                                "id": "e",
                                "type": "array",
                                "minItems": 3,
                                "maxItems": 3,
                                "items": [
                                    { "id": "property", "type": "object" },
                                    { "id": "source", "type": "string" },
                                    { "id": "target", "type": "string" },
                                ]
                            }
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
                            { "id": "edge_id", "type": "number" }
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
                    "return": { "type": "array", "items": [ { "type": "string" } ] },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            {
                                "id": "query",
                                "type": "array",
                                "minItems": 4,
                                "maxItems": 4,
                                "items": [
                                    { "id": "source", "type": "string" },
                                    { "id": "target", "type": "string" },
                                    { "id": "max_hop", "type": "integer" },
                                    { "id": "preset_query", "type": "array" }
                                ]
                            }
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
                    "return": {
                        "id": "node",
                        "type": "array",
                        "minItems": 3,
                        "maxItems": 3,
                        "items": [
                            { "id": "property", "type": "object" },
                            { "id": "in_edges", "type": "array" },
                            { "id": "out_edges", "type": "array" }
                        ]
                    },
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
                    "return": {
                        "id": "edge",
                        "type": "array",
                        "minItems": 3,
                        "maxItems": 3,
                        "items": [
                            { "id": "property", "type": "object" },
                            { "id": "source", "type": "string" },
                            { "id": "target", "type": "string" },
                        ]
                    },
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
                    { "id": "edge_query", "type": "array", "items": [ { "type": "object" } ] },
                    { "id": "node_query", "type": "array", "items": [ { "type": "object" } ] }
                ],
                "additionalItems": false
            },
            {
                "id": "edge",
                "type": "array",
                "minItems": 3,
                "maxItems": 3,
                "items": [
                    { "id": "property", "type": "object" },
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
                            { "id": "arm_id", "type": "string" }
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
                            { "id": "arm_id", "type": "string" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "select_arm",
                "properties": {
                    "return": { "id": "arm_id", "type": "string" },
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
                "id": "register_reward",
                "properties": {
                    "return": { "type": "boolean" },
                    "args": {
                        "type": "array",
                        "minItems": 3,
                        "maxItems": 3,
                        "items": [
                            { "id": "player_id", "type": "string" },
                            { "id": "arm_id", "type": "string" },
                            { "id": "reward", "type": "number" }
                        ],
                        "additionalItems": false
                    }
                }
            },
            {
                "id": "get_arm_info",
                "properties": {
                    "return": {
                        "properties": {
                            "arm_id": { "type": "string" },
                            "arm_info" : {
                                "properties": {
                                    "trial_count": "integer",
                                    "weight": "number"
                                }
                            }
                        }
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
                        "items": [
                            {
                                "id": "feature",
                                "type": "array",
                                "minItems": 2,
                                "maxItems": 2,
                                "items": [
                                    { "id": "key", "type": "string" },
                                    { "id": "value", "type": "number" }
                                ]
                            }
                        ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "type": "array" }
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
                        "items": [
                            {
                                "id": "feature",
                                "type": "array",
                                "minItems": 2,
                                "maxItems": 2,
                                "items": [
                                    { "id": "key", "type": "string" },
                                    { "id": "value", "type": "number" }
                                ]
                            }
                        ]
                    },
                    "args": {
                        "type": "array",
                        "minItems": 1,
                        "maxItems": 1,
                        "items": [
                            { "type": "array" }
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
                    { "id": "key", "type": "string" },
                    { "id": "value", "type": "number" }
                ],
                "additionalItems": false
            }
        ])
    }
};
