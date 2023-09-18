export const replaceUrlParams = (url: string, ...params: string[]) => {
  const parts = url.split('/');
  let paramsIndex = 0;
  return parts
    .map(part => {
      if (part.startsWith(':')) {
        const param = params[paramsIndex] || part;
        paramsIndex++;
        return param;
      }
      return part;
    })
    .join('/');
};
