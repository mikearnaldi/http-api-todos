import { FetchHttpClient } from "@effect/platform"
import { Console, Layer, Logger } from "effect"

import { createMockConsole } from "./mockConsole.ts"
import { testServerLive } from "./testServer.ts"

export const createTestHttpServer = () => {
  const { mockConsole, messages } = createMockConsole()
  
  const testServerWithMockConsole = testServerLive.pipe(
    Layer.provide(Logger.add(Logger.defaultLogger)),
    Layer.provide(Console.setConsole(mockConsole)),
    Layer.provideMerge(FetchHttpClient.layer)
  )

  const getServerUrl = () => {
    const addressMessage = messages.find(msg => 
      msg.includes("Listening on") && msg.includes("http://")
    )
    if (!addressMessage) {
      throw new Error("Server address not found in logs")
    }

    const urlMatch = addressMessage.match(/http:\/\/[^\s"]+/)
    if (!urlMatch) {
      throw new Error("Could not extract URL from log message")
    }
    
    return urlMatch[0]
  }

  return {
    testServerLayer: testServerWithMockConsole,
    getServerUrl,
    messages
  }
}