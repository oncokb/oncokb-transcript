import { FB_COLLECTION } from 'app/config/constants/firebase';

type FirebaseGenePathDetails = {
  fullPath: string;
  hugoSymbol: string;
  genePath: string;
  pathFromGene: string;
};

export const parseFirebaseGenePath = (path: string): FirebaseGenePathDetails | undefined => {
  const pathParts = path.split('/').filter(part => part.length > 0);
  if (pathParts.length < 3) {
    return;
  }
  const pathFromGene = pathParts.slice(2).join('/');
  const hugoSymbol = pathParts[1];
  return {
    fullPath: path,
    hugoSymbol,
    genePath: `${pathParts[0]}/${pathParts[1]}`,
    pathFromGene,
  };
};

export const buildFirebaseGenePath = (hugoSymbol: string, fieldKey: string) => {
  if (hugoSymbol.length === 0) {
    return undefined;
  }
  return `${FB_COLLECTION.GENES}/${hugoSymbol}/${fieldKey}`;
};

export const extractArrayPath = (valuePath: string) => {
  const pathParts = valuePath.split('/');
  // First pop is to remove the field key that comes with the reviewLevel's valuePath.
  // For instance, valuePath can be 'mutations/0/name'
  pathParts.pop();
  const deleteIndexString = pathParts.pop();
  if (!deleteIndexString) {
    throw new Error('could not find delete index string');
  }
  const deleteIndex = parseInt(deleteIndexString, 10); // Remove index
  const firebaseArrayPath = pathParts.join('/');
  return { firebaseArrayPath, deleteIndex };
};
