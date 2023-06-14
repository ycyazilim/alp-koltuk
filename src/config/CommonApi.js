import axios from 'axios';
import { linkPrefix } from './ApiUrl';

const instance = axios.create({
    baseURL: linkPrefix
})

const post = async (url, params) => {
    const response = await instance.post(url, params)
    return response;
}
const get = async (url) => {
    const { data } = await instance.get(url,{headers: { 'Cache-Control': 'no-cache', }});
    return data;
}

const del = async => {
    return instance.delete;
}

const setBaseUrl = (url) => {
    instance.defaults.baseURL = url;
}
const CommonAPI = {
    post,
    get,
    setBaseUrl,
    del
}
export default CommonAPI;
