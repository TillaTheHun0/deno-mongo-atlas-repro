# Deno Mongo Atlas Reproduce

Repo for reproducing error encountered when using Mongo Node Driver in Deno.

At first, operations performed using the driver succeed, but then after a few
minutes, a ECONNRESET error is thrown which crashes the process.

## Context

- [this issue](https://github.com/denoland/deno/issues/16633), specifically
  [this comment](https://github.com/denoland/deno/issues/16633#issuecomment-1609276811)
- [also this issue](https://github.com/denoland/deno/issues/19078) which
  desribes the same issue

## Setup

> I was only able to replicate on a Atlas **Serverless** Cluster, which does not
> have a free tier, and I don't want to post credentials on a public repo and
> run up a bill.

You'll need to setup an Atlas Serverless Cluster. One can be setup with
zero config on the Atlas Dashboard.

When your Serverless Cluster is spun up, Click the ellipsis and "Load Sample
Dataset" into the Serverless Cluster. This will take a minute or two.

Finally, create a user that has access to the Serverless Cluster. Use those
credentials in your connection string.

## Steps to Reproduce

Reproduced with:

```
deno 1.35.0 (release, aarch64-apple-darwin)
v8 11.6.189.7
typescript 5.1.6
```

> Make sure to set `MONGO_URL` to the connection string copied from the Atlas
> Dashboard. It will look something like
> `mongodb+srv://<username>:<password>@<cluster-name>.<lb>.mongodb.net/?retryWrites=true&w=majority`

- Start the server either by cloning this repo and running `deno task start` or
  simply run
  `deno run --allow-read --allow-sys --allow-net --allow-env https://raw.githubusercontent.com/TillaTheHun0/deno-mongo-atlas-repro/main/mod.js`
- navigate to `http://localhost:8080` and confirm the server returns the JSON
  docs retrieved from Mongo Atlas Cluster
- **wait ~11m**, keeping the server running
- navigate to `http://localhost:8080` and observe the server crashes with a
  `ECONNRESET` error similar to:

```
error: Uncaught Error: read ECONNRESET
  at __node_internal_captureLargerStackTrace (ext:deno_node/internal/errors.ts:91:11)
  at __node_internal_errnoException (ext:deno_node/internal/errors.ts:139:12)
  at TCP.onStreamRead [as onread] (ext:deno_node/internal/stream_base_commons.ts:207:24)
  at TCP.#read (ext:deno_node/internal_binding/stream_wrap.ts:225:18)
  at eventLoopTick (ext:core/01_core.js:183:11)
```
