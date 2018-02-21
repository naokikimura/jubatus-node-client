import * as rpc from "msgpack-rpc-lite"

export namespace common {

  export type Datum = [[[string, string]], [[string, number]], [[string, any]]]

  namespace client {

    interface ConstructorOptions {
      port?: number;
      host?: string;
      timeoutSeconds?: number;
      rpcClient?: rpc.Client;
    }

    interface Common {
      save(id: string): Promise<[object, number]>;
      load(id: string): Promise<[boolean, number]>;
      clear(): Promise<[boolean, number]>;
      getConfig(): Promise<[string, number]>;
      getStatus(): Promise<[object, number]>;
      doMix(): Promise<[boolean, number]>;
      getProxyStatus(): Promise<[object, number]>;
    }

    interface CommonConstructor<T> {
      new(port: number, host?: string, timeoutSeconds?: number): T;
      new(rpcClient: rpc.Client): T;
      new(options: ConstructorOptions): T;
      readonly prototype: T;
    }

  }

}

export namespace classifier {

  type LabeledDatum = [string, common.Datum];

  type EstimateResult = [string, number];

  export namespace client {

    /**
     * 
    */
    export interface ClassifierConstructor extends common.client.CommonConstructor<Classifier> {
      readonly prototype: Classifier;
    }

    export interface Classifier extends common.client.Common {

      /**
       *  Trains and updates the model. labeled_datum is a tuple of datum and its label. This API is designed to accept bulk update with list of labeled_datum.
       * @param data list of tuple of label and datum
       */
      train(data: LabeledDatum[]): Promise<[number, number]>;

      /**
       * Estimates labels from given data. This API is designed to accept bulk classification with list of datum.
       * @param {common.Datum[]} data list of datum to classify
       * @returns {Promise<[EstimateResult[], number]>} List of list of estimate_result, in order of given datum
       */
      classify(data: common.Datum[]): Promise<[EstimateResult[], number]>;

      getLabels(): Promise<[object, number]>;
      setLabel(label: string): Promise<[boolean, number]>;
      deleteLabel(label: string): Promise<[boolean, number]>;
    }

    export const Classifier: ClassifierConstructor
  }
}
