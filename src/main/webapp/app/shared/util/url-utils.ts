export const replaceUrlParams = (url: string, ...params: string[]) => {
  if (!url) {
    return '';
  }

  const urlParts = url.split(/(^https?:\/\/)/).filter(p => p);
  let urlProtocol = urlParts[0];
  let restUrl = urlParts[1];
  if (!urlParts[1]) {
    restUrl = urlParts[0];
    urlProtocol = undefined;
  }

  const parts = restUrl.split('/');
  let paramsIndex = 0;
  const urlWithParams = parts
    .map(part => {
      if (part.startsWith(':')) {
        const param = params[paramsIndex] || part;
        paramsIndex++;
        return param;
      }
      return part;
    })
    .join('/');
  return (urlProtocol || '') + urlWithParams;
};
