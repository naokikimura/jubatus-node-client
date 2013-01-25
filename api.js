var common = {
    methods: ['save', 'load', 'get_config', 'get_status']
}
module.exports = {
    Classifier: {
        methods: common.methods.concat([
            'train'
          , 'classify'])
    }
  , Regression: {
        methods: common.methods.concat([
            'train'
          , 'estimate'])
    }
  , Recommender: {
        methods: common.methods.concat([
            'clear_row'
          , 'update_row'
          , 'clear'
          , 'complete_row_from_id'
          , 'complete_row_from_datum'
          , 'similar_row_from_id'
          , 'similar_row_from_datum'
          , 'decode_row'
          , 'get_all_rows'
          , 'calc_similarity'
          , 'calc_l2norm'])
    }
  , Anomaly: {
        methods: common.methods.concat([
            'clear_row'
          , 'add'
          , 'update'
          , 'clear'
          , 'calc_score'
          , 'get_all_rows'])
    }
  , Stat: {
        methods: common.methods.concat([
            'push'
          , 'sum'
          , 'stddev'
          , 'max'
          , 'min'
          , 'entropy'
          , 'moment'])
    }
  , Graph: {
        methods: common.methods.concat([
            'create_node'
          , 'remove_node'
          , 'update_node'
          , 'create_edge'
          , 'update_edge'
          , 'remove_edge'
          , 'get_centrality'
          , 'add_centrality_query'
          , 'add_shortest_path_query'
          , 'remove_centrality_query'
          , 'remove_shortest_path_query'
          , 'get_shortest_path'
          , 'update_index'
          , 'clear'
          , 'get_node'
          , 'get_edge'])
    }
}
