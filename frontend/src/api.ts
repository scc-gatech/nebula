function getCookie(name: string): string {
  const nameLenPlus = (name.length + 1);
  return document.cookie
    .split(';')
    .map(c => c.trim())
    .filter(cookie => {
      return cookie.substring(0, nameLenPlus) === `${name}=`;
    })
    .map(cookie => {
      return decodeURIComponent(cookie.substring(nameLenPlus));
    })[0];
}

const jsonHeaders = {
  'csrf-token': getCookie('X-CSRF') || '',    // only if globally set, otherwise ignored
  'Accept': 'application/json',       // receive json
  'Content-Type': 'application/json'  // send json
};


export const api = function (method: string, url: string, data: any, headers: any = {}): Promise<any> { // tslint:disable-line
  return fetch(url, {
      method: method.toUpperCase(),
      body: JSON.stringify(data),  // send it as stringified json
      headers: {...headers, ...jsonHeaders}  // extend the headers
    },
  ).then(res => res.ok ? res.json() : Promise.reject(res));
};

export const API = {
  api,
  get: api.bind(null, 'get'),
  post: api.bind(null, 'post'),
  put: api.bind(null, 'put'),
  delete: api.bind(null, 'delete'),
};
