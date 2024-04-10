import { Gene } from 'app/shared/model/firebase/firebase.model';
import { FB_COLLECTION } from 'app/config/constants/firebase';

// https://stackoverflow.com/questions/66621546/how-to-extract-path-expression-from-an-interface-in-typescript
export type ExtractPathExpressions<T, Sep extends string = '/'> = Exclude<
  keyof {
    [P in Exclude<keyof T, symbol> as T[P] extends any[] | readonly any[]
      ? P | `${P}/${number}` | `${P}/${number}${Sep}${Exclude<ExtractPathExpressions<T[P][number]>, keyof number | keyof string>}`
      : T[P] extends { [x: string]: any }
      ? `${P}${Sep}${ExtractPathExpressions<T[P]>}` | P
      : P]: string;
  },
  symbol
>;

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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const buildFirebaseGenePath = (hugoSymbol: string, fieldKey: ExtractPathExpressions<Gene>) => {
  if (hugoSymbol.length === 0) {
    return undefined;
  }
  return `${FB_COLLECTION.GENES}/${hugoSymbol}/${fieldKey}`;
};
