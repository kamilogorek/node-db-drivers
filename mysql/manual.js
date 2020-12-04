const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const mysql = require("mysql");

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
const DB_USER = "root";
const DB_PASSWORD = "docker";

Sentry.init({
  debug: true,
  dsn: DSN,
  integrations: [new Tracing.Integrations.Mysql()],
  tracesSampleRate: 1.0,
  beforeSend() {
    return null;
  },
});

Sentry.addGlobalEventProcessor(logEventOrTransactionDetails);

const transaction = Sentry.startTransaction({
  op: "transaction",
  name: "MysqlTransaction",
});

Sentry.configureScope((scope) => {
  scope.setSpan(transaction);
});

const connection = mysql.createConnection({
  user: DB_USER,
  password: DB_PASSWORD,
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("connected as id " + connection.threadId);
});

connection.query("SELECT 1 + 1 AS solution", function (error, results, fields) {
  if (error) throw error;
  console.log("The solution is: ", results[0].solution);
  if (transaction) transaction.finish();
  connection.end();
});
