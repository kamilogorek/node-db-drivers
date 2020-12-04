const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const mongodb = require("mongodb");
const express = require("express");

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
  integrations: [
    new Tracing.Integrations.Express({
      app: express.Router,
      methods: ["get"],
    }),
    new Tracing.Integrations.Mongo(),
  ],
  tracesSampleRate: 1.0,
  beforeSend() {
    return null;
  },
});

Sentry.addGlobalEventProcessor(logEventOrTransactionDetails);

const app = express();
const client = new mongodb.MongoClient(
  `mongodb://${DB_USER}:${DB_PASSWORD}@localhost:27017`
);
client.connect();

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.use(express.json());

app.get("/hi", async function sayHi(req, res, next) {
  try {
    const database = await client.db("admin");
    const collection = database.collection("movies");
    await collection.insertOne({ title: "Rick and Morty" });
    const result = await collection.findOne({ title: "Rick and Morty" });
    res.send(result);
  } catch (err) {
    next(err);
  }
});

app.use(Sentry.Handlers.errorHandler());

app.listen(3000);
