import { Environment } from "../environment/Environment"

export const ApiEndpoints = {
    messages: {
        getAll: Environment.apiUrl + 'message',
    },
}