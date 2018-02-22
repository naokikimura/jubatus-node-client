import * as rpc from "msgpack-rpc-lite"

namespace common {
  namespace types {
    type stringValues = [[string, string]];
    type numValues = [[string, number]];
    type binaryValues = [[string, Buffer]];
    type DatumTuple = [stringValues, numValues, binaryValues];

    export interface DatumConstructor {
      new(stringValues?: stringValues, numValues?: numValues, binaryValues?: binaryValues): Datum;
      fromTuple(typle: DatumTuple): Datum;
      readonly prototype: Datum;
    }

    /**
     * Represents a set of data used for machine learning in Jubatus. See Data Conversion for details.
     * 
     * You can change internal values of a datum with these methods.
     */
    export interface Datum {
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
       * @returns Name of target cluster
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
       * @returns {Promise<[object, number]>} Path to the saved model for each server. The key of the map is in form of ipaddr_portnumber.
       */
      save(id: string): Promise<[object, number]>;
      /**
       * Restore the saved model from local disk at ALL servers.
       * 
       * @param id {string} file name to load
       * @returns {<[boolean, number]>} True if this function loads files successfully at all servers
       */
      load(id: string): Promise<[boolean, number]>;
      /**
       * Completely clears the model at ALL servers.
       * @returns {Promise<[boolean, number]>} True when the model was cleared successfully
       */
      clear(): Promise<[boolean, number]>;
      /** 
       * Returns server configuration from a server. For format of configuration, see API reference of each services.
       * @returns {Promise<[string, number]>} server configuration set on initialization
       */
      getConfig(): Promise<[string, number]>;
      /** 
       * Returns server status from ALL servers. Each server is represented by a pair of IP address and port.
       * @returns Internal state for each servers. The key of most outer map is in form of ipaddr_portnumber. 
       */
      getStatus(): Promise<[object, number]>;
      /** 
       * Force cluster to fire mix. Call this RPC to Jubatus server directly. When you call this to proxy, RPC error will be raised.
       * @returns {Promise<[boolean, number]>} True when model mixed successfully
       */
      doMix(): Promise<[boolean, number]>;
      /** 
       * Returns proxy status.
       * 
       * This is an RPC method for proxy. When you use this for server, RPC error will be raised.
       * @returns {Promise<[object, number]>}	Internal state for proxy. The key of most outer map is in form of ipaddr_portnumber.
       */
      getProxyStatus(): Promise<[object, number]>;
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

namespace classifier {
  namespace types {
    type EstimateResultTuple = [string, number];

    interface EstimateResultConstructor {
      new(label: string, score: number): EstimateResult
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
    };

    export const EstimateResult: EstimateResultConstructor;

    type LabeledDatumTuple = [[string, common.types.DatumTuple]];

    interface LabeledDatumConstructor {
      new(label: string, data: common.types.Datum): LabeledDatum
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
       * @returns {Promise<[number, number]>} Number of trained datum (i.e., the length of the data)
       */
      train(data: types.LabeledDatum[]): Promise<[number, number]>;

      /**
       * Estimates labels from given data. This API is designed to accept bulk classification with list of datum.
       * @param {common.Datum[]} data list of datum to classify
       * @returns {Promise<[[EstimateResult[]], number]>} List of list of estimate_result, in order of given datum
       */
      classify(data: common.types.Datum[]): Promise<[[types.EstimateResult[]], number]>;
      /**
       * Returns the number of trained data for each label. If method is NN , the number of trained data that are deleted by unlearner is not include in this count.
       * @returns {Promise<[object, number]>} Pairs of label and the number of trained data
       */
      getLabels(): Promise<[object, number]>;
      /**
       * Append new label. If the label is already exist, it fails. New label is add when label found in train method argument, too.
       * @param newLabel {string} name of new label
       * @returns {Promise<[boolean, number]>} True if the new label was not exist. False if the label already exists.
       */
      setLabel(newLabel: string): Promise<[boolean, number]>;
      /**
       * Deleting label. True if jubatus success to delete. False if the label is not exists.
       * @param targetLabel {string} deleting label name
       * @returns {Promise<[boolean, number]>} True if jubatus success to delete label. False if the label is not exists.
       */
      deleteLabel(targetLabel: string): Promise<[boolean, number]>;
    }

    export const Classifier: ClassifierConstructor;
  }
}