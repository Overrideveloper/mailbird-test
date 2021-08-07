// Type definitions for poplib v0.1.7
// Project: https://www.npmjs.com/package/poplib
// Definitions by: Wisdom Banso <https://github.com/overrideveloper>

/// <reference types="node" />

declare module 'poplib' {
  import { EventEmitter } from 'events';

  // The property names of these interfaces match the documentation (where type names were given).

  export interface Config {
    /** If true, the library will use a TLS connection */
    enabletls: boolean;
    /** If true, then TLS errors will be ignored */
    ignoretlserrs: boolean;
    /** Prints out requests and responses */
    debug: false;
  }

  export default class POP3Client extends EventEmitter {
    constructor(port: number, host: string, options: Config);
    on(event: string, listener: Function): this;
    once(event: string, listener: Function): this;
    on(event: 'invalid-state', listener: (cmd: string) => void): this;
    on(event: 'locked', listener: (cmd: string) => void): this;
    on(event: 'connect', listener: (status: boolean, rawData: string) => void): this;
    on(event: 'login', listener: (status: boolean, rawData: string) => void): this;
    on(event: 'apop', listener: (status: boolean, rawData: string) => void): this;
    on(event: 'auth', listener: (status: boolean, rawData: string) => void): this;
    on(event: 'stls', listener: (status: boolean, rawData: string) => void): this;
    on(event: 'capa', listener: (status: boolean, data: string[], rawData: string) => void): this;
    on(event: 'list', listener: (status: boolean, msgcount: number, msgnumber: number, data: unknown[], rawdata: string) => void): this;
    on(event: 'top', listener: (status: boolean, msgnumber: number, data: string, rawdata: string) => void): this;
    on(event: 'stat', listener: (status: boolean, data: { count: number; octet: number; }, rawdata: string) => void): this;
    on(event: 'uidl', listener: (status: boolean, msgnumber: number, data: string[], rawdata: string) => void): this;
    on(event: 'retr', listener: (status: boolean, msgnumber: number, data: string, rawData: string) => void): this;
    on(event: 'rset', listener: (status: boolean, rawData: string) => void): this;
    on(event: 'noop', listener: (status: boolean, rawData: string) => void): this;
    on(event: 'quit', listener: (status: boolean, rawData: string) => void): this;
    on(event: 'del', listener: (status: boolean, msgnumber: number, rawData: string) => void): this;

    login(username: string, password: string): void;
    apop(username: string, password: string): void;
    auth(type: 'PLAIN' | 'CRAM-MD5', username: string, password: string): void;
    stls(): void;
    capa(): void;
    list(msgNumber?: number): void;
    top(msgNumber: number, lines: number): void;
    top(msgNumber: number[], lines: number): void;
    stat(): void;
    uidl(msgNumber?: number): void;
    retr(msgNumber: number): void;
    dele(msgNumber: number): void;
    rset(): void;
    noop(): void;
    quit(): void;
  }
}
