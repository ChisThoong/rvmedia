import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const options: MongoClientOptions = {
  serverSelectionTimeoutMS: Number(
    process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 10000
  ),
  tls: true,
  tlsAllowInvalidCertificates: process.env.MONGODB_TLS_INSECURE === "true"
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
