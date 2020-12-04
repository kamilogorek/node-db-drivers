const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const pg = require("pg");

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
const DB_USER = "postgres";
const DB_PASSWORD = "docker";

Sentry.init({
  debug: true,
  dsn: DSN,
  integrations: [new Tracing.Integrations.Postgres()],
  tracesSampleRate: 1.0,
  beforeSend() {
    return null;
  },
});

Sentry.addGlobalEventProcessor(logEventOrTransactionDetails);

const transaction = Sentry.startTransaction({
  op: "transaction",
  name: "PostgresTransaction",
});

Sentry.configureScope((scope) => {
  scope.setSpan(transaction);
});

const client = new pg.Client({
  user: DB_USER,
  password: DB_PASSWORD,
});

client.connect();

client.query("SELECT $1::text as message", ["Hello world!"], (err, res) => {
  console.log(err ? err.stack : res.rows[0].message); // Hello World!
  if (transaction) transaction.finish();
  client.end();
});
