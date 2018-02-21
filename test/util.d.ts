import { ChildProcess } from "child_process";

declare function createServerProcess(command: string, config: string, timeoutSeconds: number, regex: RegExp): Promise<[number, ChildProcess]>