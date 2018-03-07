import * as rpc from "msgpack-rpc-lite"
import { MapLike } from "typescript";

declare namespace common {

  export function toTuple(object: any): any;

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

declare namespace anomaly {
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
       * Score for the data. Negative (normal) data are scored around 1.0. Higher score means higher abnormality.
       */
      score: number;
      toTuple(): IdWithScoreTuple;
    }
    export const IdWithScore: IdWithScoreConstructor;
  }
  namespace client {
    interface AnomalyConstructor extends common.client.CommonConstructor<Anomaly> {
      readonly prototype: Anomaly;
    }
    interface Anomaly extends common.client.Common {
      /**
       * Clears a point data with ID id.
       * @param id point ID to be removed
       * @returns True when the point was cleared successfully
       */
      clearRow(id: string): Promise<boolean>;
      /**
       * Adds a point data row.
       * @param row datum for the point
       * @returns Tuple of the point ID and the anomaly measure value
       */
      add(row: common.types.Datum): Promise<types.IdWithScore>;
      /**
       * Adds a bulk of points. In contrast to add, this API doesn’t return anomaly measure values.
       * @param data List of datum for the points
       * @returns The list of successfully added IDs.
       */
      addBulk(data: common.types.Datum[]): Promise<string[]>;
      /**
       * Updates the point id with the data row.
       * @param id point ID to update
       * @param row new datum for the point
       * @returns Anomaly measure value
       */
      update(id: string, row: common.types.Datum): Promise<number>;
      /**
       * Overwrites the point id with the data row.
       * @param id point ID to update
       * @param row new datum for the point
       * @returns Anomaly measure value
       */
      overwrite(id: string, row: common.types.Datum): Promise<number>;
      /**
       * Calculates an anomaly measure value for the point data row without adding a point.
       * 
       * At this time, extremely large numbers can be returned. For the detail, please refer to FAQs:anomaly detection .
       * @param row datum
       * @returns Anomaly measure value for given row
       */
      calcScore(row: common.types.Datum): Promise<number>;
      /**
       * Returns the list of all point IDs.
       * @returns List of all point IDs
       */
      getAllRows(): Promise<string[]>;
    }
    export const Anomaly: AnomalyConstructor;
  }
}

declare namespace clustering {
  namespace types {
    type WeightedDatumTuple = [number, common.types.Datum];
    interface WeightedDatumConstructor {
      new(weight: number, point: common.types.Datum): WeightedDatum;
      fromTuple(tuple: WeightedDatumTuple): WeightedDatum;
      readonly prototype: WeightedDatum;
    }
    interface WeightedDatum {
      weight: number;
      point: common.types.Datum;
      toTuple(): WeightedDatumTuple;
    }
    export const WeightedDatum: WeightedDatumConstructor;
    type IndexedPointTuple = [string, common.types.Datum];
    interface IndexedPointConstructor {
      new(id: string, point: common.types.Datum): IndexedPoint;
      fromTuple(tuple: IndexedPointTuple): IndexedPoint;
      readonly prototype: IndexedPoint;
    }
    interface IndexedPoint {
      id: string;
      point: common.types.Datum;
      toTuple(): IndexedPointTuple;
    }
    export const IndexedPoint: IndexedPointConstructor;
    type WeightedIndexTuple = [number, string];
    interface WeightedIndexConstructor {
      new(weight: number, id: string): WeightedIndex;
      fromTuple(tuple: WeightedIndexTuple): WeightedIndex;
      readonly prototype: WeightedIndex;
    }
    interface WeightedIndex {
      weight: number;
      id: string;
      toTuple(): IndexedPointTuple;
    }
    export const WeightedIndex: WeightedIndexConstructor;
  }
  namespace client {
    interface ClusteringConstructor extends common.client.CommonConstructor<Clustering> {
      readonly prototype: Clustering;
    }
    interface Clustering extends common.client.Common {
      /**
       * Adds points.
       * @param points list of indexed_point for the points. indexed_point is a tuple of string id and datum
       * @returns True when the point was added successfully
       */
      push(points: types.IndexedPoint[]): Promise<boolean>;
      /**
       * Return revesion of cluster.
       * @returns revision of cluster
       */
      getRevision(): Promise<number>;
      /**
       * Returns coreset of cluster in datum. This method is not supported in dbscan.
       * @returns coreset of cluster
       */
      getCoreMembers(): Promise<types.WeightedDatum[][]>;
      /**
       * Returns coreset of cluster in index. This method is not supported in dbscan.
       * @returns coreset of cluster
       */
      getCoreMembersLight(): Promise<types.WeightedIndex[][]>;
      /**
       * Returns k cluster centers.
       * @returns cluster centers
       */
      getKCenter(): Promise<common.types.Datum[]>;
      /**
       * Returns nearest summary of cluster(coreset) from point. Its format is a list of tuples of weight and datum. This method is not supported in dbscan.
       * @param point datum
       * @returns coreset
       */
      getNearestMembers(point: common.types.Datum): Promise<types.WeightedDatum[]>;
      /**
       * Returns nearest summary of cluster(coreset) from point. Its format is a list of tuples of weight and id. This method is not supported in dbscan.
       * @param point datum
       * @returns coreset
       */
      getNearestMembersLight(point: common.types.Datum): Promise<types.WeightedIndex[]>;
    }
    export const Clustering: ClusteringConstructor;
  }
}

declare namespace burst {
  namespace types {
    type KeywordWithParamsTuple = [string, number, number];
    interface KeywordWithParamsConstructor {
      new(keyword: string, scalingParam: number, gamma: number): KeywordWithParams;
      fromTuple(tuple: KeywordWithParamsTuple): KeywordWithParams;
      readonly prototype: KeywordWithParams;
    }
    /**
     * Represents the keyword and its parameters to be detected as burst.
     */
    interface KeywordWithParams {
      /**
       * The keyword to be burst-detected.
       */
      keyword: string;
      /**
       * A scaling parameter applied for this keyword.
       */
      scalingParam: number;
      /**
       * A γ value applied for this keyword. The higher value reduces the burst detection sensitivity.
       */
      gamma: number;
      toTuple(): KeywordWithParamsTuple;
    }
    export const KeywordWithParams: KeywordWithParamsConstructor;
    type BatchTuple = [number, number, number];
    interface BatchConstructor {
      new(allDataCount: number, relevantDataCount: number, burstWeight: number): Batch;
      fromTuple(tuple: BatchTuple): Batch;
      readonly prototype: Batch;
    }
    /**
     * Represents the burst detection result for one batch range.
     */
    interface Batch {
      /**
       * Number of total documents in this batch.
       */
      allDataCount: number;
      /**
       * Number of documents that contains the keyword in this batch.
       */
      relevantDataCount: number;
      /**
       * Burst level of this batch. Burst level is a relative value that cannot be compared between keywords.
       */
      burstWeight: number;
      toTuple(): BatchTuple;
    }
    export const Batch: BatchConstructor;
    type WindowTuple = [number, Batch[]];
    interface WindowConstructor {
      new(startPos: number, batches: Batch[]): Window;
      fromTuple(tuple: WindowTuple): Window;
      readonly prototype: Window;
    }
    /**
     * Represents the burst detection result.
     */
    interface Window {
      /**
       * Starting position of this window.
       */
      startPos: number;
      /**
       * Batches that composes this window.
       */
      batches: Batch[];
      toTuple(): WindowTuple;
    }
    export const Window: WindowConstructor;
    type DocumentTuple = [number, string];
    interface DocumentConstructor {
      new(pos: number, text: string): Document;
      fromTuple(tuple: DocumentTuple): Document;
      readonly prototype: Document;
    }
    /**
     * Represents the document used for burst detection.
     */
    interface Document {
      /**
       * Position (time in many cases) of this document.
       */
      pos: number;
      /**
       * Contents of this document. Keyword matching runs against this data using partial match.
       */
      text: string;
      toTuple(): DocumentTuple;
    }
    export const Document: DocumentConstructor;
  }
  namespace client {
    interface BurstConstructor extends common.client.CommonConstructor<Burst> {
      readonly prototype: Burst;
    }
    interface Burst extends common.client.Common {
      /**
       * Register the document for burst detection. This This API is designed to accept bulk update with list of document.
       * You need to register the keyword via add_keyword method before adding documents.
       * A document whose location (pos) is out of range of the current window cannot be registered.
       * @param data list of documents to be added
       * @returns number of documents successfully registered (will be the length of data if all documents are registered successfully)
       */
      addDocuments(data: types.Document[]): Promise<number>;
      /**
       * Returns the burst detection result of the current window for pre-registered keyword keyword.
       * @param keyword keyword to get burst detection result
       * @returns burst detection result
       */
      getResult(keyword: string): Promise<types.Window>;
      /**
       * Returns the burst detection result at the specified position pos for pre-registered keyword keyword.
       * @param keyword keyword to get burst detection result
       * @param pos position
       * @returns burst detection result
       */
      getResultAt(keyword: string, pos: number): Promise<types.Window>;
      /**
       * Returns the burst detection result at the specified position pos for all pre-registered keywords.
       * @param pos position
       * @returns pairs of keyword and its burst detection result
       */
      getAllBurstedResults(pos: number): Promise<MapLike<types.Window>>;
      /**
       * Returns the list of keywords registered for burst detection.
       * @returns list of keyword and its parameters
       */
      getAllKeywords(): Promise<types.KeywordWithParams[]>;
      /**
       * Registers the keyword keyword for burst detection.
       * @param keyword keyword and parameters to be added
       * @returns True if Jubatus succeed to add the keyword
       */
      addKeyword(keyword: types.KeywordWithParams): Promise<boolean>;
      /**
       * Removes the keyword keyword from burst detection.
       * @param keyword keyword to be removed
       * @returns True if Jubatus succeed to delete the keyword
       */
      removeKeyword(keyword: string): Promise<boolean>;
      /**
       * Removes all the keywords from burst detection.
       * @returns True if Jubatus succeed to delete keywords
       */
      removeAllKeywords(): Promise<boolean>;
    }
    export const Burst: BurstConstructor;
  }
}

declare namespace stat {
  namespace types {}
  namespace client {
    interface StatConstructor extends common.client.CommonConstructor<Stat> {
      readonly prototype: Stat;
    }
    interface Stat extends common.client.Common {
      /**
       * Adds value val to the attribute key.
       * @param key 
       * @param value 
       */
      push(key: string, value: number): Promise<boolean>;
      /**
       * Returns the sum of values in the attribute key.
       * @param key 
       */
      sum(key: string): Promise<number>;
      /**
       * Returns the standard deviation of values in the attribute key.
       * @param key 
       */
      stddev(key: string): Promise<number>;
      /**
       * Returns the maximum value of values in the attribute key.
       * @param key 
       */
      max(key: string): Promise<number>;
      /**
       * Returns the minimum value of values in the attribute key.
       * @param key 
       */
      min(key: string): Promise<number>;
      /**
       * Returns the entropy of values in the attribute key.
       * @param key 
       */
      entropy(key: string): Promise<number>;
      /**
       * Returns the degree-th moment about center of values in the attribute key.
       * @param key 
       * @param degree 
       * @param center 
       */
      moment(key: string, degree: number, center: number): Promise<number>;
    }
    export const Stat: StatConstructor;
  }
}

declare namespace graph {
  namespace types {
    type NodeTuple = [MapLike<string>, number[], number[]];
    interface NodeConstructor {
      new(property: MapLike<string>, inEdges: number[], outEdges: number[]): Node;
      fromTuple(tuple: NodeTuple): Node;
      readonly prototype: Node;
    }
    /**
     * Represents the node information.
     */
    interface Node {
      /**
       * Property information for the node.
       */
      property: MapLike<string>;
      /**
       * List of ID of incoming edges.
       */
      inEdges: number[];
      /**
       * List of ID of outgoing edges.
       */
      outEdges: number[];
      toTuple(): NodeTuple;
    }
    export const Node: NodeConstructor;
    type QueryTuple = [string, string];
    interface QueryConstructor {
      new(fromId: string, toId: string): Query;
      fromTuple(tuple: QueryTuple): Query;
      readonly prototype: Query;
    }
    /**
     * Represents a query.
     */
    interface Query {
      fromId: string;
      toId: string;
      toTuple(): QueryTuple;
    }
    export const Query: QueryConstructor;
    type PresetQueryTuple = [Query[], Query[]];
    interface PresetQueryConstructor {
      new(edgeQuery: Query[], nodeQuery: Query[]): PresetQuery;
      fromTuple(tuple: PresetQueryTuple): PresetQuery;
      readonly prototype: PresetQuery;
    }
    /**
     * Represents a preset query. See the description below for details.
     */
    interface PresetQuery {
      edgeQuery: Query[];
      nodeQuery: Query[];
      toTuple(): PresetQueryTuple;
    }
    export const PresetQuery: PresetQueryConstructor;
    type EdgeTuple = [Query[], Query[]];
    interface EdgeConstructor {
      new(property: MapLike<string>, source: string, target: string): Edge;
      fromTuple(tuple: EdgeTuple): Edge;
      readonly prototype: Edge;
    }
    /**
     * Represents the edge information.
     */
    interface Edge {
      /**
       * Property information for the edge.
       */
      property: MapLike<string>;
      /**
       * ID of the source node that the edge connects.
       */
      source: string;
      /**
       * ID of the target node that the edge connects.
       */
      target: string;
      toTuple(): EdgeTuple;
    }
    export const Edge: EdgeConstructor;
    type ShortestPathQueryTuple = [string, string, number, PresetQuery];
    interface ShortestPathQueryConstructor {
      new(source: string, target: string, maxHop: number, query: PresetQuery): ShortestPathQuery;
      fromTuple(tuple: ShortestPathQueryTuple): ShortestPathQuery;
      readonly prototype: ShortestPathQuery;
    }
    /**
     * Represents a preset query. See the description below for details.
     */
    interface ShortestPathQuery {
      source: string;
      target: string;
      maxHop: number;
      query: PresetQuery;
      toTuple(): PresetQueryTuple;
    }
    export const ShortestPathQuery: ShortestPathQueryConstructor;
  }
  namespace client {
    interface GraphConstructor extends common.client.CommonConstructor<Graph> {
      readonly prototype: Graph;
    }
    interface Graph extends common.client.Common {
      /**
       * Creates a node on the graph. Returns a node ID as string.
       */
      createNode(): Promise<string>;
      /**
       * Removes a node node_id from the graph.
       * @param nodeId 
       */
      removeNode(nodeId: string): Promise<boolean>;
      /**
       * Updates the property of the node node_id to property.
       * @param nodeId 
       * @param property 
       */
      updateNode(nodeId: string, property: MapLike<string>): Promise<boolean>;
      /**
       * Creates a link from e.source to e.target. Returns a edge ID as an unsigned long integer.
       * 
       * The link has a direction. For any two nodes, multiple links with the same direction can be created. In this case, property e.property can be associated to each link (see edge).
       * node_id must be the same value as e.source.
       * @param nodeId 
       * @param e 
       */
      createEdge(nodeId: string, e: types.Edge): Promise<number>;
      /**
       * Updates an existing edge edge_id with information e. Property will be replaced.
       * 
       * node_id must be the same value as e.source.
       * @param nodeId 
       * @param edgeId 
       * @param e 
       */
      updateEdge(nodeId: string, edgeId: number, e: types.Edge): Promise<boolean>;
      /**
       * Removes an edge edge_id. node_id must be an ID for the source node of the edge edge_id.
       * @param nodeId 
       * @param edgeId 
       * @param e 
       */
      removeEdge(nodeId: string, edgeId: number, e: types.Edge): Promise<boolean>;
      /**
       * Calculates (gets the computed value) the centrality over the edges that match the preset query query. The query must be registered beforehand by using add_centrality_query.
       * 
       * centrality_type is a type of centrality. Currently, only 0 (PageRank centrality) can be specified.
       * Centrality is computed when mix runs, thus there may be a gap between the exact value of centrality and the computed value if there’re updates not mixed. See also the description of update_index.
       * @param nodeId 
       * @param centralityType 
       * @param query 
       */
      getCentrality(nodeId: string, centralityType: number, query: types.PresetQuery): Promise<number>;
      /**
       * Adds a preset query query to the graph for centrality calculation.
       * @param query 
       */
      addCentralityQuery(query: types.PresetQuery): Promise<number>;
      /**
       * Adds a preset query query to the graph for shortest path calculation.
       * @param query 
       */
      addShortestPathQuery(query: types.PresetQuery): Promise<number>;
      /**
       * Removes a preset query query from the graph.
       * @param query 
       */
      removeCentralityQuery(query: types.PresetQuery): Promise<number>;
      /**
       * Removes a preset query query from the graph.
       * @param query 
       */
      removeShortestPathQuery(query: types.PresetQuery): Promise<number>;
      /**
       * Calculates (from the precomputed data) a shortest path from query.source to query.target that matches the preset query. The query must be registered beforehand by using add_shortest_path_query. Returns a list of node IDs that represents a path from query.source to query.target.
       * 
       * If the shortest path from query.source to query.target cannot be found within query.max_hop hops, the result will be truncated.
       * Path-index tree may have a gap between the exact path and the computed path when in a distributed setup. See also the description of update_index.
       * @param query 
       */
      getShortestPath(query: types.ShortestPathQuery): Promise<string[]>;
      /**
       * Runs mix locally. Do not use in distributed mode.
       * 
       * Some functions like get_centrality and get_shortest_path uses an index that is updated in the mix operation. In a standalone mode, mix is not automatically called thus users must call this API by themselves.
       */
      updateIndex(): Promise<boolean>;
      /**
       * Gets the node for a node node_id.
       * @param nodeId 
       */
      getNode(nodeId: string): Promise<types.Node>;
      /**
       * Gets the edge of an edge edge_id. node_id is an ID for the source node of the edge edge_id.
       * @param nodeId 
       * @param edgeId 
       */
      getEdge(nodeId: string, edgeId: number): Promise<types.Edge>;
    }
    export const Graph: GraphConstructor;
  }
}

declare namespace bandit {
  namespace types {
    type ArmInfoTuple = [number, number];
    interface ArmInfoConstructor {
      new(trialCount: number, weight: number): ArmInfo;
      fromTuple(tuple: ArmInfoTuple): ArmInfo;
      readonly prototype: ArmInfo;
    }
    /**
     * The state of an arm.
     */
    interface ArmInfo {
      /**
       * Number of times of an arm being selected.
       */
      trialCount: number;
      /**
       * The weight of an arm.
       */
      weight: number;
      toTuple(): ArmInfoTuple;
    }
    export const ArmInfo: ArmInfoConstructor;
  }
  namespace client {
    interface BanditConstructor extends common.client.CommonConstructor<Bandit> {
      readonly prototype: Bandit;
    }
    interface Bandit extends common.client.Common {
      /**
       * Register a new arm with the name of arm_id.
       * @param armId ID of the new arm to be registered
       * @returns True if succeeded in registering the arm. False if failed to register the arm.
       */
      registerArm(armId: string): Promise<boolean>;
      /**
       * Delete an arm with the name of arm_id.
       * @param armId ID of the arm to be deleted
       * @returns True if succeeded in deleting the arm. False if failed to delete the arm.
       */
      deleteArm(armId: string): Promise<boolean>;
      /**
       * Select player’s arm according to current state.
       * @param playerId ID of the player whose arm is to be selected
       * @returns arm_id selected by bandit algorithm.
       */
      selectArm(playerId: string): Promise<string>;
      /**
       * Register rewards with specified player’s specified arm.
       * @param playerId ID of the player whose arm gets rewards
       * @param armId ID of the arm which rewards are registered with
       * @param reward amount of rewards
       * @returns True if succeeded in registering reward. False if failed to register rewards. 
       */
      registerReward(playerId: string, armId: string, reward: number): Promise<boolean>;
      /**
       * Get all arms information of specified player.
       * @param playerId ID of the player
       * @returns arm information of specified player
       */
      getArmInfo(playerId: string): Promise<MapLike<types.ArmInfo>>;
      /**
       * Reset all arms information of specified player.
       * @param playerId ID of the user whose arms are to be reset.
       * @returns True if succeeded in resetting the arm. False if failed to reset.
       */
      reset(playerId: string): Promise<boolean>;
    }
    export const Bandit: BanditConstructor;
  }
}

declare namespace weight {
  namespace types {
    type FeatureTuple = [string, number];
    interface FeatureConstructor {
      new(key: string, value: number): Feature;
      fromTuple(tuple: FeatureTuple): Feature;
      readonly prototype: Feature;
    }
    /**
     * Represents a dimension of feature vector.
     */
    interface Feature {
      /**
       * Represents a name for the dimension of the feature vector.
       */
      key: string;
      /**
       * Represents a weight for the dimension of the feature vector.
       */
      value: number;
      toTuple(): FeatureTuple;
    }
    export const Feature: FeatureConstructor;
  }
  namespace client {
    interface WeightConstructor extends common.client.CommonConstructor<Weight> {
      readonly prototype: Weight;
    }
    interface Weight extends common.client.Common {
      /**
       * Updates the weight using d, then returns the result of feature conversion of d using updated weight.
       * @param d datum to extract feature
       * @returns Extarcted feature vector
       */
      update(d: common.types.Datum): Promise<types.Feature[]>;
      /**
       * Returns the result of feature conversion of d without updating the weight.
       * @param d datum to extract feature
       * @returns Extarcted feature vector
       */
      calcWeight(d: common.types.Datum): Promise<types.Feature[]>;
    }
    export const Weight: WeightConstructor;
  }
}