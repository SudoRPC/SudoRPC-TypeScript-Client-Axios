/**
 * @author WMXPY
 * @namespace ClientAxios
 * @description Axios Proxy
 */

import { SudoRPCCall, SudoRPCCallProxy, SudoRPCCallProxyCallback, SudoRPCReturn, SudoRPCService } from "@sudorpc/core";

export class SudoRPCAxiosProxy<Metadata, Payload, SuccessResult, FailResult>
    extends SudoRPCCallProxy<Metadata, Payload, SuccessResult, FailResult> {

    public static create<Metadata, Payload, SuccessResult, FailResult>(
        service: SudoRPCService<Metadata, Payload, SuccessResult, FailResult>,
    ): SudoRPCAxiosProxy<Metadata, Payload, SuccessResult, FailResult> {

        return new SudoRPCAxiosProxy(service);
    }

    private readonly _service:
        SudoRPCService<Metadata, Payload, SuccessResult, FailResult>;

    private readonly _listeners:
        Map<string, SudoRPCCallProxyCallback<SuccessResult, FailResult>>;

    private constructor(
        service: SudoRPCService<Metadata, Payload, SuccessResult, FailResult>,
    ) {

        super();

        this._service = service;

        this._listeners = new Map();
    }

    public send(
        call: SudoRPCCall<Metadata, Payload>,
    ): void {

        this._service.execute(call).then(
            (
                message: SudoRPCReturn<SuccessResult, FailResult>,
            ) => {

                for (const listener of this._listeners.values()) {
                    listener(message);
                }
            },
        );
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
