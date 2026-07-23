import mysql from "mysql2/promise";

import { databaseConfig } from "../../config/database.config.js";

export const databasePool = mysql.createPool(databaseConfig);
