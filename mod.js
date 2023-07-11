import { MongoClient } from 'npm:mongodb@5.6.0'
import { serve } from 'https://deno.land/std@0.193.0/http/server.ts'

const CONNECTION_STRING = Deno.env.get('MONGO_URL')

if (!CONNECTION_STRING) throw new Error(`MONGO_URL is required`)

const findIn =
  ({ db, collection }) => ({ filter, options }) => async (client) =>
    client.db(db).collection(collection).find(filter, options).toArray()

async function main({ client, port, find }) {
  await client.connect()

  const find10With = find({ filter: {}, options: { limit: 10 } })

  const handler = async () => {
    const body = await find10With(client)
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  console.log(
    `HTTP webserver running. Access it at: http://localhost:${port}/`,
  )
  await serve(handler, { port })
}

await main({
  client: new MongoClient(CONNECTION_STRING),
  port: 8080,
  find: findIn({
    db: 'sample_airbnb',
    collection: 'listingsAndReviews',
  }),
})
