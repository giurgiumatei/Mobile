import * as qs from 'qs';
import { PathLike } from 'fs';
import { Environment } from '../environment/Environment';
import { AxiosRequestConfig } from 'axios';

export const apiConfig : AxiosRequestConfig  = {

    baseURL: Environment.apiUrl,

    paramsSerializer: (params: PathLike) => qs.stringify(params, { indices: false })
};