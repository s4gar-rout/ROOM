import dns from 'dns'
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import app from './app.js'
import { config } from './config/config.js';
import connectToDB from './config/db.js';

connectToDB()

app.listen(config.PORT,() => {
    console.log(`Server running on port ${config.PORT}`);
});