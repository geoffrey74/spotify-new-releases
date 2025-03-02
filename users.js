import got from 'got';

export async function getUser(url, token) {
    let response = await got(url, { headers: { 'Authorization': `Bearer ${token}` } });
    return JSON.parse(response.body);    
}
