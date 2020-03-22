
const request = async (url, options) => {
  try {
    const requestOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json'
      },
    };

    const response = await fetch(url, requestOptions);

    if (response.status >= 200 && response.status < 300) {
      const data = await response.json();
      return data;
    }

    const error = new Error(response.status);
    throw error;
  } catch (error) {
    throw error;
  }
};

const get = async (url, params) => {
  const paramsString = params ? `?_page=${params._page}&_limit=${params._limit}&_sort=${params._sort}&_order=${params._order}` : '';
  const requestUrl = `${url}${paramsString}`;

  return request(requestUrl, { method: 'GET' });
}

const post = (url, body) => request(url, {
  body: JSON.stringify(body),
  method: 'POST'
});

const patch = (url, body) => request(url, {
  body: JSON.stringify(body),
  method: 'PATCH'
});

const deleteRequest = (url) => request(url, { method: 'DELETE' });

const fetchClient = {
  get,
  post,
  patch,
  delete: deleteRequest,
};
export default fetchClient;
