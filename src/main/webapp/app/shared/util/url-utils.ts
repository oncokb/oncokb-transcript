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
    if (params[i] === undefined || params[i] === '') {
      return '';
    }
    url = url.replace(paramMatches[i], `/${params[i]}`);
  }

  return url;
};

export const setUrlParams = (urlString: string, params: Record<string, any>) => {
  const url = new URL(urlString);
  for (const [key, value] of Object.entries(params)) {
    // Set will override the param if it already exists in the URL
    url.searchParams.set(key, value);
  }
  return url.toString();
};

export const getCbioportalResultsPageMutationTabUrl = (hugoSymbol: string) => {
  if (!hugoSymbol) {
    return '';
  }
  return `https://cbioportal.mskcc.org/results/mutations?cancer_study_list=mskimpact&Z_SCORE_THRESHOLD=2.0&RPPA_SCORE_THRESHOLD=2.0&profileFilter=mutations%2Cstructural_variants%2Ccna&case_set_id=mskimpact_cnaseq&geneset_list=%20&tab_index=tab_visualize&Action=Submit&gene_list=${hugoSymbol}`;
};
