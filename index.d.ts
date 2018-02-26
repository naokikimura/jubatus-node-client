import * as rpc from "msgpack-rpc-lite"

declare namespace common {
  namespace types {
    type stringValues = [[string, string]];
    type numValues = [[string, number]];
    type binaryValues = [[string, Buffer]];
    type DatumTuple = [stringValues, numValues, binaryValues];

    interface DatumConstructor {
      new(stringValues?: stringValues, numValues?: numValues, binaryValues?: binaryValues): Datum;
      fromTuple(typle: DatumTuple): Datum;
      readonly prototype: Datum;
    }

    /**
     * Represents a set of data used for machine learning in Jubatus. See Data Conversion for details.
     * 
     * You can change internal values of a datum with these methods.
     */
    interface Datum {
      /**
       * Add a string value.
       * @param key {string} The key of the value to add. Cannot contain “$”.
       * @param value {string} The value to add.
       * @returns {types.Datum} Returns a pointer to itself.
       */
      addString(key: string, value: string): types.Datum;
      /**
       * Add a numeric value.
       * @param {string} key The key of the value to add.
       * @param {number} value The value to add.
       * @returns {types.Datum} Returns a pointer to itself.
       */
      addNumber(key: string, value: number): types.Datum;
      /**
       * Add a binary value.
       * @param key {string} The key of the value to add.
       * @param value {Buffer} The value to add.
       * @returns {types.Datum} Returns a pointer to itself.
       */
      addBinary(key: string, value: Buffer): types.Datum;
      /**
       * Input data represented in string. It is represented as key-value pairs of data. Name of keys cannot contain “$” sign.
       */
      stringValues: stringValues;
      /**
       * Input data represented in numeric value. It is represented as key-value pairs of data.
       */
      numValues: numValues;
      /**
       * Input data represented in binary value. It is represented as key-value pairs of data.
       */
      binaryValues: binaryValues;
      toTuple(): DatumTuple;
    }

    export const Datum: DatumConstructor;
  }

  namespace client {
    interface ConstructorOptions {
      port?: number;
      host?: string;
      timeoutSeconds?: number;
      rpcClient?: rpc.Client;
    }

    interface Client {
      readonly client: rpc.Client;
      readonly name: string;
      /** 
       * Get name of target cluster of this client object. name is a string value to uniquely identify a task in the ZooKeeper cluster. This is not an RPC method.
       * @returns {string} Name of target cluster
       */
      getName(): string;
      /** 
       * Set name of target cluster of this client object. name is a string value to uniquely identify a task in the ZooKeeper cluster. You can switch the target Jubatus cluster among multiple tasks with one client object. This is not an RPC method.
       * @param newName {string} Name of new target cluster
       */
      setName(newName: string): void;
      /**
       * Returns the reference to the raw MessagePack-RPC client instance which is used by Jubatus client libraries. This is not an RPC method.
       * 
       * The common use case of this method is to close the TCP connection explicitly or to change the timeout.
       * @returns {rpc.Client} MessagePack-RPC client instance
       */
      getClient(): rpc.Client;
    }

    interface Common extends Client {
      /**
       * Store the learing model to the local disk at ALL servers.
       * 
       * @param id {string} file name to save
       * @returns {Promise<object>} Path to the saved model for each server. The key of the map is in form of ipaddr_portnumber.
       */
      save(id: string): Promise<object>;
      /**
       * Restore the saved model from local disk at ALL servers.
       * 
       * @param id {string} file name to load
       * @returns {<boolean>} True if this function loads files successfully at all servers
       */
      load(id: string): Promise<boolean>;
      /**
       * Completely clears the model at ALL servers.
       * @returns {Promise<boolean>} True when the model was cleared successfully
       */
      clear(): Promise<boolean>;
      /** 
       * Returns server configuration from a server. For format of configuration, see API reference of each services.
       * @returns {Promise<string>} server configuration set on initialization
       */
      getConfig(): Promise<string>;
      /** 
       * Returns server status from ALL servers. Each server is represented by a pair of IP address and port.
       * @returns {Promise<object>} Internal state for each servers. The key of most outer map is in form of ipaddr_portnumber. 
       */
      getStatus(): Promise<object>;
      /** 
       * Force cluster to fire mix. Call this RPC to Jubatus server directly. When you call this to proxy, RPC error will be raised.
       * @returns {Promise<boolean>} True when model mixed successfully
       */
      doMix(): Promise<boolean>;
      /** 
       * Returns proxy status.
       * 
       * This is an RPC method for proxy. When you use this for server, RPC error will be raised.
       * @returns {Promise<object>}	Internal state for proxy. The key of most outer map is in form of ipaddr_portnumber.
       */
      getProxyStatus(): Promise<object>;
    }

    /**
     * Creates a new RPC client instance. name is a string value to uniquely identify a task in the ZooKeeper cluster.
     * When using standalone mode, this must be left blank ("").
     * timeout_sec is a length of timeout between the RPC method invocation and response.
     */
    interface CommonConstructor<T> {
      new(port: number, host?: string, timeoutSeconds?: number): T;
      new(rpcClient: rpc.Client): T;
      new(options: ConstructorOptions): T;
      readonly prototype: T;
    }
  }
}

declare namespace classifier {
  namespace types {
    type EstimateResultTuple = [string, number];

    interface EstimateResultConstructor {
      new(label: string, score: number): EstimateResult;
      fromTuple(tuple: EstimateResultTuple): EstimateResult;
      readonly prototype: EstimateResult;
    }

    /** 
     * Represents a result of classification.
     */
    interface EstimateResult {
      /**
       * Represents an estimated label.
       */
      label: string;
      /**
       * Represents a probability value for the label. Higher score value means that the estimated label is more confident.
       */
      score: number;
      toTuple(): EstimateResultTuple;
    }

    export const EstimateResult: EstimateResultConstructor;

    type LabeledDatumTuple = [string, common.types.DatumTuple];

    interface LabeledDatumConstructor {
      new(label: string, data: common.types.Datum): LabeledDatum;
      fromTuple(tuple: LabeledDatumTuple): LabeledDatum;
      readonly prototype: LabeledDatum;
    }

    /**
     * Represents a datum with its label.
     */
    interface LabeledDatum {
      /**
       * Represents a label of this datum.
       */
      label: string;
      /**
       * Represents a datum.
       */
      data: common.types.Datum;
      toTuple(): LabeledDatumTuple;
    }

    export const LabeledDatum: LabeledDatumConstructor;
  }

  namespace client {
    interface ClassifierConstructor extends common.client.CommonConstructor<Classifier> {
      readonly prototype: Classifier;
    }

    interface Classifier extends common.client.Common {
      /**
       * Trains and updates the model. labeled_datum is a tuple of datum and its label. This API is designed to accept bulk update with list of labeled_datum.
       * @param {types.LabeledDatum[]} data list of tuple of label and datum
       * @returns {Promise<number>} Number of trained datum (i.e., the length of the data)
       */
      train(data: types.LabeledDatum[]): Promise<number>;

      /**
       * Estimates labels from given data. This API is designed to accept bulk classification with list of datum.
       * @param {common.Datum[]} data list of datum to classify
       * @returns {Promise[EstimateResult[]]>} List of list of estimate_result, in order of given datum
       */
      classify(data: common.types.Datum[]): Promise<[types.EstimateResult[]]>;
      /**
       * Returns the number of trained data for each label. If method is NN , the number of trained data that are deleted by unlearner is not include in this count.
       * @returns {Promise<object>} Pairs of label and the number of trained data
       */
      getLabels(): Promise<object>;
      /**
       * Append new label. If the label is already exist, it fails. New label is add when label found in train method argument, too.
       * @param newLabel {string} name of new label
       * @returns {Promise<boolean>} True if the new label was not exist. False if the label already exists.
       */
      setLabel(newLabel: string): Promise<boolean>;
      /**
       * Deleting label. True if jubatus success to delete. False if the label is not exists.
       * @param targetLabel {string} deleting label name
       * @returns {Promise<boolean>} True if jubatus success to delete label. False if the label is not exists.
       */
      deleteLabel(targetLabel: string): Promise<boolean>;
    }

    export const Classifier: ClassifierConstructor;
  }
}

declare namespace regression {
  namespace types {
    type ScoredDatumTuple = [number, common.types.DatumTuple];
    interface ScoredDatumConstructor {
      new(score: number, data: common.types.Datum): ScoredDatum;
      fromTuple(tuple: ScoredDatumTuple): ScoredDatum;
      readonly prototype: ScoredDatum;
    }
    /** 
     * Represents a datum with its label.
     */
    interface ScoredDatum {
      /** 
       * Represents a label of this datum.
       */
      score: number;
      /**
       * Represents a datum.
       */
      data: common.types.Datum;
      toTuple(): ScoredDatumTuple;
    }
    export const ScoredDatum: ScoredDatumConstructor;
  }
  namespace client {
    interface RegressionConstructor extends common.client.CommonConstructor<Regression> {
      readonly prototype: Regression;
    }
    interface Regression extends common.client.Common {
      /**
       * Trains and updates the model. This function is designed to allow bulk update with list of scored_datum.
       * 
       * @param data list of tuple of label and datum
       * @returns Number of trained datum (i.e., the length of the train_data)
       */
      train(data: types.ScoredDatum[]): Promise<number>;
      /**
       * Estimates the value from given estimate_data. This API is designed to allow bulk estimation with list of datum.
       * 
       * @param data list of datum to estimate
       * @returns List of estimated values, in order of given datum
       */
      estimate(data: common.types.Datum[]): Promise<number[]>;
    }
    export const Regression: RegressionConstructor;
  }
}

declare namespace recommender {
  namespace types {
    type IdWithScoreTuple = [string, number];
    interface IdWithScoreConstructor {
      new(id: string, score: number): IdWithScore;
      fromTuple(tuple: IdWithScoreTuple): IdWithScore;
      readonly prototype: IdWithScore;
    }
    /**
     * Represents ID with its score.
     */
    interface IdWithScore {
      /**
       * Data ID.
       */
      id: string;
      /** 
       * Score. Range of scores is 0 <= score <= 1 (less than or equal to -0 when using euclid_lsh).
       */
      score: number;
      toTuple(): IdWithScoreTuple;
    }
    export const IdWithScore: IdWithScoreConstructor;
  }
  namespace client {
    interface RecommenderConstructor extends common.client.CommonConstructor<Recommender> {
      readonly prototype: Recommender;
    }
    interface Recommender extends common.client.Common {
      /**
       * Removes the given row id from the recommendation table.
       * @param id row ID to be removed
       * @returns True when the row was cleared successfully
       */
      clearRow(id: string): Promise<boolean>;
      /**
       * Updates the row whose id is id with given row.
       * 
       * If the row with the same id already exists, the row is differential updated with row.
       * Otherwise, new row entry will be created.
       * If the server that manages the row and the server that received this RPC request are same, this operation is reflected instantly.
       * If not, update operation is reflected after mix.
       * @param id row ID
       * @param row datum for the row
       * @returns True if this function updates models successfully
       */
      updateRow(id: string, row: common.types.Datum): Promise<boolean>;
      /**
       * Returns the datum for the row id, with missing value completed by predicted value.
       * @param id row ID
       * @returns datum stored in id row with missing value completed by predicted value
       */
      completeRowFromId(id: string): Promise<common.types.Datum>;
      /**
       * Returns the datum constructed from row, with missing value completed by predicted value.
       * @param row original datum to be completed (possibly some values are missing)
       * @returns datum constructed from the given datum with missing value completed by predicted value
       */
      completeRowFromDatum(row: common.types.Datum): Promise<common.types.Datum>;
      /**
       * Returns size rows (at maximum) which are most similar to the row id.
       * @param id row ID
       * @param size number of rows to be returned
       * @returns row IDs that are most similar to the row id
       */
      similarRowFromId(id: string, size: number): Promise<types.IdWithScore[]>;
      /**
       * Returns rows which are most similar to the row id and have a greater similarity score than score.
       * @param id row ID
       * @param score threshold of similarity score
       * @returns row IDs that are most similar to the row id
       */
      similarRowFromIdAndScore(id: string, score: number): Promise<types.IdWithScore[]>;
      /**
       * Returns the top rate of all the rows which are most similar to the row id.
       * 
       * For example, return the top 40% of all the rows when 0.4 is specified as rate.
       * @param id row ID
       * @param rate rate of all the rows to be returned (Range 0 < rate <= 1)
       * @returns row IDs that are most similar to the row id
       */
      similarRowFromIdAndRate(id: string, rate: number): Promise<types.IdWithScore[]>;
      /**
       * Returns size rows (at maximum) that most have similar datum to row.
       * @param row datum to find similar rows
       * @param size number of rows to be returned
       * @returns rows that most have a similar datum to row
       */
      similarRowFromDatum(row: common.types.Datum, size: number): Promise<types.IdWithScore[]>;
      /**
       * Returns rows which are most similar to row and have a greater similarity score than score.
       * @param row datum to find similar rows
       * @param score threshold of similarity score
       * @returns rows that most have a similar datum to row
       */
      similarRowFromDatumAndScore(row: common.types.Datum, score: number): Promise<types.IdWithScore[]>;
      /**
       * Returns the top rate of all the rows which are most similar to row.
       * 
       * For example, return the top 40% of all the rows when 0.4 is specified as rate.
       * @param row datum to find similar rows
       * @param rate rate of all the rows to be returned (Range 0 < rate <= 1)
       * @returns rows that most have a similar datum to row
       */
      similarRowFromDatumAndRate(row: common.types.Datum, rate: number): Promise<types.IdWithScore[]>;
      /**
       * Returns the datum in the row id.
       * 
       * Note that irreversibly converted datum (processed by fv_converter) will not be decoded.
       * @param id row ID
       * @returns datum for the given row id
       */
      decodeRow(id: string): Promise<common.types.Datum>;
      /**
       * Returns the list of all row IDs.
       * @returns list of all row IDs
       */
      getAllRows(): Promise<string[]>;
      /**
       * Returns the similarity score (see score member of id_with_score) between two datum.
       * @param lhs datum
       * @param rhs another datum
       * @returns similarity between lhs and rhs
       */
      calcSimilarity(lhs: common.types.Datum, rhs: common.types.Datum): Promise<number>;
      /**
       * Returns the value of L2 norm for the row.
       * @param row datum
       * @returns L2 norm for the given row
       */
      calcL2norm(row: common.types.Datum): Promise<number>;
    }
    export const Recommender: RecommenderConstructor;
  }
}

declare namespace nearestneighbor {
  namespace types {
    type IdWithScoreTuple = [string, number];
    interface IdWithScoreConstructor {
      new(id: string, score: number): IdWithScore;
      fromTuple(tuple: IdWithScoreTuple): IdWithScore;
      readonly prototype: IdWithScore;
    }
    /**
     * Represents ID with its score.
     */
    interface IdWithScore {
      /**
       * Data ID.
       */
      id: string;
      /** 
       * Score.
       */
      score: number;
      toTuple(): IdWithScoreTuple;
    }
    export const IdWithScore: IdWithScoreConstructor;
  }
  namespace client {
    interface NearestNeighborConstructor extends common.client.CommonConstructor<NearestNeighbor> {
      readonly prototype: NearestNeighbor;
    }
    interface NearestNeighbor extends common.client.Common {
      /**
       * Updates the row whose id is id with given row.
       * 
       * If the row with the same id already exists, the row is overwritten with row (note that this behavior is different from that of recommender).
       * Otherwise, new row entry will be created.
       * If the server that manages the row and the server that received this RPC request are same, this operation is reflected instantly.
       * If not, update operation is reflected after mix.
       * @param id row ID
       * @param d datum for the row
       * @returns True if this function updates models successfully
       */
      setRow(id: string, d: common.types.Datum): Promise<boolean>;
      /**
       * Returns size rows (at maximum) that have most similar datum to id and their distance values.
       * @param id row ID in the nearest neighbor search table
       * @param size number of rows to be returned
       * @returns row IDs that are the nearest to the row id and their distance values
       */
      neighborRowRromId(id: string, size: number): Promise<types.IdWithScore[]>;
      /**
       * Returns size rows (at maximum) of which datum are most similar to query and their distance values.
       * @param query datum for nearest neighbor search
       * @param size number of rows to be returned
       * @returns row IDs that are the nearest to query and their distance values
       */
      neighborRowFromDatum(query: common.types.Datum, size: number): Promise<types.IdWithScore[]>;
      /**
       * Returns ret_num rows (at maximum) that have most similar datum to id and their similarity values.
       * @param id row ID in the nearest neighbor search table
       * @param retNum number of rows to be returned
       * @returns row IDs that are the nearest to the row id and their similarity values
       */
      similarRowFromId(id: string, retNum: number): Promise<types.IdWithScore[]>;
      /**
       * Returns ret_num rows (at maximum) of which datum are most similar to query and their similarity values.
       * @param query datum for nearest neighbor search
       * @param retNum number of rows to be returned
       * @returns row IDs that are the nearest to query and their similarity values
       */
      similarRowFromDatum(query: common.types.Datum, retNum: number): Promise<types.IdWithScore[]>;
      /**
       * Returns the list of all row IDs.
       * @returns list of all row IDs
       */
      getAllRows(): Promise<string[]>;
    }
    export const NearestNeighbor: NearestNeighborConstructor;
  }
}