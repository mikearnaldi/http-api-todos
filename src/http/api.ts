import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"

export const statusEndpoint = HttpApiEndpoint
  .get("status", "/healthz")
  .addSuccess(Schema.String)

export const healthGroup = HttpApiGroup
  .make("Health")
  .add(statusEndpoint)

export const todosApi = HttpApi
  .make("TodosApi")
  .add(healthGroup)
