var common = {
    methods: [
        {
            "name": "save",
            "return": { "type": "boolean" },
            "args": [
                { "name": "name", "type": "string"},
                { "name": "id", "type": "string"}
            ]
        },
        {
            "name": "load",
            "return": { "type": "boolean" },
            "args": [
                { "name": "name", "type": "string"},
                { "name": "id", "type": "string"}
            ]
        },
        {
            "name": "get_config",
            "return": { "type": "string" },
            "args": [
                { "name": "name", "type": "string"}
            ]
        },
        {
            "name": "get_status",
            "return": { "type": "object" },
            "args": [
                { "name": "name", "type": "string"}
            ]
        }
    ],
    types: [
        {
            "name": "datum",
            "type": "array",
            "items": [
                {
                    "name": "string_values",
                    "type": "array",
                    "items": {
                        "type": "array",
                        "items": [
                            { "type": "string" },
                            { "type": "string" }
                        ]
                    }
                },
                {
                    "name": "num_values",
                    "type": "array",
                    "items": {
                        "type": "array",
                        "items": [
                            { "type": "string" },
                            { "type": "number" }
                        ]
                    }
                }
            ]
        }
    ]
};

module.exports = {
    Classifier: {
        methods: common.methods.concat([
            'train',
            'classify'
        ]),
        types: common.types.concat([
            {
                "name": "estimate_result",
                "type": "array",
                "items": [
                    {
                        "name": "label",
                        "type": "string"
                    },
                    {
                        "name": "score",
                        "type": "double"
                    }
                ]
            }
        ])
    },
    Regression: {
        methods: common.methods.concat([
            'train',
            'estimate'
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
            'push',
            'sum',
            'stddev',
            'max',
            'min',
            'entropy',
            'moment'
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
