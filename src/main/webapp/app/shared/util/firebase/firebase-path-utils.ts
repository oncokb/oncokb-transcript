type FirebaseGenePathDetails = {
  fullPath: string;
  hugoSymbol: string;
  pathFromGene: string;
};

export const parseFirebaseGenePath = (path: string) => {
  const pathParts = path.split('/').filter(part => part.length > 0);
  if (pathParts.length < 3) {
    return;
  }
  const pathFromGene = pathParts.slice(2).join('/');
  const hugoSymbol = pathParts[1];
  return {
    fullPath: path,
    hugoSymbol,
    pathFromGene,
  } as FirebaseGenePathDetails;
};
