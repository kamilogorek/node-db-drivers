const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const mongodb = require("mongodb");

const logEventOrTransactionDetails = (event) => {
  if (event.message || event.exception) {
    console.log(event);
  } else {
    console.log(
      JSON.stringify(
        (({ contexts, spans, tags }) => ({
          contexts,
          spans,
          tags,
        }))(event),
        null,
        2
      )
    );
  }
  return event;
};

const DSN =
  "https://5b0e5845265a472ba9c269bbfa0c8388@o333688.ingest.sentry.io/5334254";
const DB_USER = "mongo";
const DB_PASSWORD = "docker";

Sentry.init({
  debug: true,
  dsn: DSN,
  integrations: [new Tracing.Integrations.Mongo()],
  tracesSampleRate: 1.0,
  beforeSend() {
    return null;
  },
});

Sentry.addGlobalEventProcessor(logEventOrTransactionDetails);

async function run() {
  const client = new mongodb.MongoClient(
    `mongodb://${DB_USER}:${DB_PASSWORD}@localhost:27017`
  );

  const transaction = Sentry.startTransaction({
    op: "transaction",
    name: "MongoTransaction",
  });

  Sentry.configureScope((scope) => {
    scope.setSpan(transaction);
  });

  try {
    await client.connect();

    const database = await client.db("admin");
    const collection = database.collection("movies");

    await collection.insertOne({ title: "Rick and Morty" });
    await collection.findOne({ title: "Back to the Future" });
    await collection.updateOne(
      { title: "Back to the Future" },
      { $set: { title: "South Park" } }
    );
    await collection.findOne({ title: "South Park" });
  } finally {
    if (transaction) transaction.finish();
    await client.close();
  }
}

run().catch(console.dir);
