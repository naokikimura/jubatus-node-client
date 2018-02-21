import * as rpc from "msgpack-rpc-lite"

export namespace common {
  export namespace types {
    export interface DatumConstructor {
      new(stringValues?: [[string, string]], numValues: [[string, number]], binaryValues: [[string, any]]): Datum;
      fromTuple([]): Datum;
      readonly prototype: Datum;
    }

    export interface Datum {
      stringValues: [[string, string]];
      numValues: [[string, number]];
      binaryValues: [[string, any]];
      toTuple(): [];
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
      getClient(): rpc.Client;
      getName(): string;
      setName(name): void;
    }

    interface Common extends Client {
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
  export namespace types {
    interface LabeledDatumConstructor {
      new(label: string, data: common.types.Datum): LabeledDatum
      fromTuple([]): LabeledDatum;
      readonly prototype: LabeledDatum;
    }

    interface LabeledDatum {
      label: string;
      data: common.types.Datum;
      toTuple(): [];
    }

    export const LabeledDatum: LabeledDatumConstructor;

    interface EstimateResultConstructor {
      new(label: string, score: number): EstimateResult
      fromTuple([]): EstimateResult;
      readonly prototype: EstimateResult;
    }

    interface EstimateResult {
      label: string;
      score: number;
      toTuple(): [];
    };

    export const EstimateResult: EstimateResultConstructor;
  }

  export namespace client {
    /**
     * 
    */
    interface ClassifierConstructor extends common.client.CommonConstructor<Classifier> {
      readonly prototype: Classifier;
    }

    interface Classifier extends common.client.Common {
      /**
       *  Trains and updates the model. labeled_datum is a tuple of datum and its label. This API is designed to accept bulk update with list of labeled_datum.
       * @param data list of tuple of label and datum
       */
      train(data: types.LabeledDatum[]): Promise<[number, number]>;

      /**
       * Estimates labels from given data. This API is designed to accept bulk classification with list of datum.
       * @param {common.Datum[]} data list of datum to classify
       * @returns {Promise<[EstimateResult[], number]>} List of list of estimate_result, in order of given datum
       */
      classify(data: common.types.Datum[]): Promise<[types.EstimateResult[], number]>;
      getLabels(): Promise<[object, number]>;
      setLabel(label: string): Promise<[boolean, number]>;
      deleteLabel(label: string): Promise<[boolean, number]>;
    }
 
    export const Classifier: ClassifierConstructor;
  }
}
