import { mysqlExecutor } from "../../db/mysql/executor.js";
import { generate } from "../../utils/uuid.util.js";
import {
  CREATE_BACKGROUND_TASK_STATUS_HISTORY,
  FIND_BACKGROUND_TASK_STATUS_HISTORY,
} from "../queries/background-task-status-history.query.js";

export class BackgroundTaskStatusHistoryDbService {
  constructor() {
    this.dbExecutor = mysqlExecutor.execute;
  }

  recordStatus = async ({
    connection = null,
    taskType,
    resourceId,
    status,
  }) => {
    await this.dbExecutor({
      query: CREATE_BACKGROUND_TASK_STATUS_HISTORY,
      parameters: [generate(), taskType, resourceId, status],
      connection,
    });
  };

  findStatusTimeline = async ({ taskType, resourceId }) => {
    const [rows] = await this.dbExecutor({
      query: FIND_BACKGROUND_TASK_STATUS_HISTORY,
      parameters: [taskType, resourceId],
    });
    return rows;
  };
}
