import { Console, Effect } from "effect"

export const createMockConsole = () => {
  const messages: Array<string> = []

  const unsafeConsole: Console.UnsafeConsole = {
    assert: (condition: boolean, ...args: ReadonlyArray<any>) => {
      if (!condition) {
        messages.push(`Assertion failed: ${args.join(" ")}`)
      }
    },
    clear: () => {
      messages.length = 0
    },
    count: (label?: string) => {
      messages.push(`count: ${label || "default"}`)
    },
    countReset: (label?: string) => {
      messages.push(`countReset: ${label || "default"}`)
    },
    debug: (...args: ReadonlyArray<any>) => {
      messages.push(`debug: ${args.join(" ")}`)
    },
    dir: (item: any, _options?: any) => {
      messages.push(`dir: ${JSON.stringify(item)}`)
    },
    dirxml: (...args: ReadonlyArray<any>) => {
      messages.push(`dirxml: ${args.join(" ")}`)
    },
    error: (...args: ReadonlyArray<any>) => {
      messages.push(`error: ${args.join(" ")}`)
    },
    group: (...args: ReadonlyArray<any>) => {
      messages.push(`group: ${args.join(" ")}`)
    },
    groupCollapsed: (...args: ReadonlyArray<any>) => {
      messages.push(`groupCollapsed: ${args.join(" ")}`)
    },
    groupEnd: () => {
      messages.push("groupEnd")
    },
    info: (...args: ReadonlyArray<any>) => {
      messages.push(`info: ${args.join(" ")}`)
    },
    log: (...args: ReadonlyArray<any>) => {
      messages.push(args.join(" "))
    },
    table: (tabularData: any, _properties?: ReadonlyArray<string>) => {
      messages.push(`table: ${JSON.stringify(tabularData)}`)
    },
    time: (label?: string) => {
      messages.push(`time: ${label || "default"}`)
    },
    timeEnd: (label?: string) => {
      messages.push(`timeEnd: ${label || "default"}`)
    },
    timeLog: (label?: string, ...args: ReadonlyArray<any>) => {
      messages.push(`timeLog: ${label || "default"} ${args.join(" ")}`)
    },
    trace: (...args: ReadonlyArray<any>) => {
      messages.push(`trace: ${args.join(" ")}`)
    },
    warn: (...args: ReadonlyArray<any>) => {
      messages.push(`warn: ${args.join(" ")}`)
    }
  }

  const mockConsole: Console.Console = {
    [Console.TypeId]: Console.TypeId,
    assert: (condition: boolean, ...args: ReadonlyArray<any>) =>
      Effect.sync(() => unsafeConsole.assert(condition, ...args)),
    clear: Effect.sync(() => unsafeConsole.clear()),
    count: (label?: string) => Effect.sync(() => unsafeConsole.count(label)),
    countReset: (label?: string) => Effect.sync(() => unsafeConsole.countReset(label)),
    debug: (...args: ReadonlyArray<any>) => Effect.sync(() => unsafeConsole.debug(...args)),
    dir: (item: any, options?: any) => Effect.sync(() => unsafeConsole.dir(item, options)),
    dirxml: (...args: ReadonlyArray<any>) => Effect.sync(() => unsafeConsole.dirxml(...args)),
    error: (...args: ReadonlyArray<any>) => Effect.sync(() => unsafeConsole.error(...args)),
    group: (options?: { readonly label?: string; readonly collapsed?: boolean }) =>
      Effect.sync(() => {
        if (options?.collapsed) {
          unsafeConsole.groupCollapsed(options.label || "")
        } else {
          unsafeConsole.group(options?.label || "")
        }
      }),
    groupEnd: Effect.sync(() => unsafeConsole.groupEnd()),
    info: (...args: ReadonlyArray<any>) => Effect.sync(() => unsafeConsole.info(...args)),
    log: (...args: ReadonlyArray<any>) => Effect.sync(() => unsafeConsole.log(...args)),
    table: (tabularData: any, properties?: ReadonlyArray<string>) =>
      Effect.sync(() => unsafeConsole.table(tabularData, properties)),
    time: (label?: string) => Effect.sync(() => unsafeConsole.time(label)),
    timeEnd: (label?: string) => Effect.sync(() => unsafeConsole.timeEnd(label)),
    timeLog: (label?: string, ...args: ReadonlyArray<any>) => Effect.sync(() => unsafeConsole.timeLog(label, ...args)),
    trace: (...args: ReadonlyArray<any>) => Effect.sync(() => unsafeConsole.trace(...args)),
    warn: (...args: ReadonlyArray<any>) => Effect.sync(() => unsafeConsole.warn(...args)),
    unsafe: unsafeConsole
  }

  return { mockConsole, messages }
}
