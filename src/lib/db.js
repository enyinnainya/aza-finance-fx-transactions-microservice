
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const {MONGODB_URL, FX_TRANSACTION_DATABASE} = require('./constants');

let dbConn=null, client=null;

module.exports = {
    ObjectID: ObjectId,
    dbConnection: () => {
        return dbConn
    },
    connect: async (dbName = null) => {
        dbName= dbName || FX_TRANSACTION_DATABASE;

        // Create a new MongoClient
        client = new MongoClient(MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverApi: ServerApiVersion.v1
        });
        try {
            // Connect the client to the server
            await client.connect();

            // Establish and verify connection
            dbConn = await client.db(dbName);
            console.info(`Connected successfully to ${dbName} database`);
        }catch(err){
            console.error("Error establishing DB connection: ", err.message)
        }
        return dbConn;
    },
    close: async () => {
        if (client) return await client.close();
    }
}
