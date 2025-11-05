import NodeCache from "node-cache";

// Cache TTL: 30 minutes (1800 seconds)
const cache = new NodeCache({ stdTTL: 1800, checkperiod: 120 });

export default cache;
