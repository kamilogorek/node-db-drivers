# Sentry Node.js Database Drivers Tracing

0. Setup your local database instance (easiest way to do this is with a one-liners below that use Docker - if something is not working, remove `-d` flag (deamon) to see what the error says)

```terminal
# run postgres
docker run --rm --name pg-docker -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=docker -d -p 5432:5432 -v $HOME/docker/volumes/postgres:/var/lib/postgresql/data postgres
# run mongodb
docker run --rm --name mongo-docker -e MONGO_INITDB_ROOT_USERNAME=mongo -e MONGO_INITDB_ROOT_PASSWORD=docker -d -p 27017:27017 -v $HOME/docker/volumes/mongodb:/data/db mongo
# run mysql (mariadb)
docker run --rm --name mysql-docker -e MYSQL_USER=root -e MYSQL_ROOT_PASSWORD=docker -d -p 3306:3306 -v $HOME/docker/volumes/mysql:/var/lib/mysql mariadb
```

1. `cd` into the package you want to test and install dependencies `yarn` or `npm install`
2. Checkout appropriate PR in your `sentry-javascript` repository and build it `cd packages/tracing && yarn build`
3. *IMPORTANT:* copy, NOT link built tracing package to `node_modules`, eg. `cp -r ~/Projects/sentry-javascript/packages/tracing node_modules/@sentry` - node cannot resolve symlinked `require` calls, and it won't be able to find local `pg`, `mysql` or `mongo` copy otherwise
4. `node manual.js` or `node express.js` (and then `curl localhost:3000/hi`) or `BENCH=true node bench.js`