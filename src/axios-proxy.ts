/**
 * @author WMXPY
 * @namespace ClientAxios
 * @description Axios Proxy
 */

import { SudoRPCCall, SudoRPCCallProxy, SudoRPCCallProxyCallback, SudoRPCReturn, SudoRPCServiceErrorGenerator } from "@sudorpc/core";
import Axios, { AxiosError, AxiosResponse } from "axios";

export class SudoRPCAxiosProxy<Metadata, Payload, SuccessResult, FailResult>
    extends SudoRPCCallProxy<Metadata, Payload, SuccessResult, FailResult> {

    public static create<Metadata, Payload, SuccessResult, FailResult>(
        endpoint: string,
    ): SudoRPCAxiosProxy<Metadata, Payload, SuccessResult, FailResult> {

        return new SudoRPCAxiosProxy(
            endpoint,
        );
    }

    private readonly _endpoint: string;

    private readonly _listeners:
        Map<string, SudoRPCCallProxyCallback<SuccessResult, FailResult>>;

    private constructor(
        endpoint: string,
    ) {

        super();

        this._endpoint = endpoint;

        this._listeners = new Map();
    }

    public send(
        call: SudoRPCCall<Metadata, Payload>,
    ): void {

        Axios.post(this._endpoint, call)
            .then(
                (
                    response: AxiosResponse<SudoRPCReturn<SuccessResult, FailResult>>,
                ) => {

                    for (const listener of this._listeners.values()) {
                        listener(response.data);
                    }
                },
            )
            .catch((error: AxiosError) => {

                const errorGenerator: SudoRPCServiceErrorGenerator<Metadata, Payload, SuccessResult, FailResult>
                    = SudoRPCServiceErrorGenerator.create(call);

                const errorResult: SudoRPCReturn<SuccessResult, FailResult>
                    = errorGenerator.createErrors([{
                        error: error.name,
                        message: error.message,
                        result: error.toJSON() as any,
                    }]);

                for (const listener of this._listeners.values()) {
                    listener(errorResult);
                }
            });
    }

    public addListener(
        listenerIdentifier: string,
        callback: SudoRPCCallProxyCallback<SuccessResult, FailResult>,
    ): this {

        this._listeners.set(listenerIdentifier, callback);
        return this;
    }

    public removeListener(
        listenerIdentifier: string,
    ): this {

        this._listeners.delete(listenerIdentifier);
        return this;
    }
}
