import { Container, interfaces } from 'inversify';

interface NewBindings {
    // tslint:disable-next-line: no-any
    id: interfaces.ServiceIdentifier<any>;
    // tslint:disable-next-line: no-any
    instance: any;
}

export function rebindMocks<T>(
    container: Container | null,
    serviceId: interfaces.ServiceIdentifier<T>,
    newBindings: NewBindings[]
) {
    if (!container) {
        throw Error();
    }
    newBindings.forEach(binding => {
        container.rebind(binding.id).toConstantValue(binding.instance);
    });

    return container.get(serviceId);
}
