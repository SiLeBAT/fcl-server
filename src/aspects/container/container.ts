import { Container } from 'inversify';
import 'reflect-metadata';

// tslint:disable-next-line: no-any
export function getContainer(...args: any[]) {
    return new Container(...args);
}
