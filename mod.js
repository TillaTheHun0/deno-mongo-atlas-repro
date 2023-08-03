import { MongoClient } from 'npm:mongodb@5.6.0'
import { serve } from 'https://deno.land/std@0.193.0/http/server.ts'

const CONNECTION_STRING = Deno.env.get('MONGO_URL')
const PORT = parseInt(Deno.env.get('PORT') || '8080')
const PING = parseInt(Deno.env.get('PING') || '0')

if (!CONNECTION_STRING) throw new Error(`MONGO_URL is required`)

const findIn =
  ({ db, collection }) => ({ filter, options }) => async (client) =>
    client.db(db).collection(collection).find(filter, options).toArray()

async function main({ ping, client, port, find }) {
  globalThis.addEventListener(
    'unhandledrejection',
    () => console.timeEnd('connection'),
  )

  console.time('connection')
  await client.connect()
  console.timeLog('connection', 'Connection established')

  const find10With = find({ filter: {}, options: { limit: 10 } })

  const handler = async () => {
    const body = await find10With(client)
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (ping > 0) {
    setInterval(async () => {
      const res = await find({ filter: {}, options: { limit: 1 } })(client)
      console.timeLog('connection', `ping: ${res.length} doc`)
    }, ping)
  } else {
    console.log('no ping')
  }

  console.log(
    `HTTP webserver running. Access it at: http://localhost:${port}/`,
  )
  await serve(handler, { port })
}

await main({
  ping: PING,
  port: PORT,
  client: new MongoClient(CONNECTION_STRING),
  find: findIn({
    db: 'sample_airbnb',
    collection: 'listingsAndReviews',
  }),
})
