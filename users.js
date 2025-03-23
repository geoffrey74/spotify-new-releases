import got from 'got';

export const getUser = async (url, token) => {
    const response = await got(url, { headers: { 'Authorization': `Bearer ${token}` } });
    return JSON.parse(response.body);    
}
