import { ApiEndpoints } from '../api/endpoints';
import { MessageProps } from '../interfaces/MessageProps';
import ApiService from './apiService';

class MessageService {
    getMessages = () => ApiService.get<MessageProps[]>(ApiEndpoints.messages.getAll);
}

export default new MessageService();