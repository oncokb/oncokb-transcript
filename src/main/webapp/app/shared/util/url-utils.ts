export const replaceUrlParams = (url: string, ...params: (string | number)[]) => {
  if (!url) {
    return '';
  }

  const paramMatches = url.match(/\/:\w+/g);
  if (!paramMatches) {
    // If there are no params in URL, return the origin url
    return url;
  }

  if (params.length < paramMatches.length) {
    // If there is an insufficient number of params compared to number of params in url, return empty string
    return '';
  }

  for (let i = 0; i < paramMatches.length; i++) {
    if (params[i] === undefined) {
      return '';
    }
    url = url.replace(paramMatches[i], `/${params[i]}`);
  }

  return url;
};
