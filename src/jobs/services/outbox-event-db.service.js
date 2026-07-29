import { mysqlExecutor } from "../../db/mysql/executor.js";
import {
  CREATE_OUTBOX_EVENT,
  FIND_PUBLISHABLE_OUTBOX_EVENTS,
  MARK_OUTBOX_EVENT_PUBLISHED,
  RECORD_OUTBOX_EVENT_FAILURE,
} from "../queries/outbox-event.query.js";

export class OutboxEventDbService {
  constructor() {
    this.dbExecutor = mysqlExecutor.execute;
  }

  createEvent = async ({ connection, id, eventType, payload }) => {
    await this.dbExecutor({
      query: CREATE_OUTBOX_EVENT,
      parameters: [id, eventType, JSON.stringify(payload)],
      connection,
    });
  };

  findPublishableEvents = async () => {
    const [rows] = await this.dbExecutor({
      query: FIND_PUBLISHABLE_OUTBOX_EVENTS,
    });
    return rows;
  };

  markPublished = async (id) => {
    await this.dbExecutor({
      query: MARK_OUTBOX_EVENT_PUBLISHED,
      parameters: [id],
    });
  };

  recordFailure = async ({ id, errorCode, retryDelaySeconds }) => {
    await this.dbExecutor({
      query: RECORD_OUTBOX_EVENT_FAILURE,
      parameters: [retryDelaySeconds, errorCode, id],
    });
  };
}
