import 'reflect-metadata';
import {Container, inject, interfaces, decorate, injectable} from 'inversify';
import {autoProvide, makeProvideDecorator, makeFluentProvideDecorator} from 'inversify-binding-decorators';
import {Controller} from 'tsoa';
decorate(injectable(), Controller);

export {autoProvide, inject};

export const iocContainer = new Container();

export const provide = makeProvideDecorator(iocContainer);
export const fluentProvider = makeFluentProvideDecorator(iocContainer);

export const provideNamed = function (
    identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>,
    name: string
) {
    return fluentProvider(identifier)
        .whenTargetNamed(name)
        .done();
};

export const provideSingleton = function (
    identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>
) {
    return fluentProvider(identifier)
        .inSingletonScope()
        .done();
};
