import { ApiEndpoints } from '../api/endpoints';
import { TaskProps } from '../interfaces/TaskProps';
import ApiService from './apiService';

class TaskService {
    getTask = (value : string | undefined) => ApiService.get<TaskProps[]>(ApiEndpoints.tasks.getTask + '?q=' + value);
}

export default new TaskService();