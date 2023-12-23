import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'

import { configs } from '../configs'

// Creating mysql connection
const connection = await mysql.createConnection(configs.database)

// Exporting drizzle orm db
export const db = drizzle(connection)
