import { Review } from 'app/shared/model/firebase/firebase.model';

function shouldProtect(valuePath: string | undefined, path: string) {
  return valuePath !== undefined && path.length > 0 && (path.startsWith(valuePath) || valuePath.startsWith(path));
}

export function useLastReviewedOnly<T>(obj: T, valuePath?: string): T | undefined {
  function useLastReviewedOnlyRec(curObj: T, parentPath: string): T | undefined {
    const newObj: T = {} as T;
    for (const [key, value] of Object.entries(curObj as Record<string, unknown>)) {
      const currentPath = `${parentPath}${parentPath.length > 0 ? '/' : ''}${key}`;
      const protectCurrent = shouldProtect(valuePath, currentPath);
      const protectParent = shouldProtect(valuePath, parentPath);

      if (key.endsWith('_review')) {
        const temp: Review = Object.assign({} as Review, value);
        (newObj as Record<string, unknown>)[key] = temp;
      } else if (Array.isArray(value)) {
        const reviewObj: Review | undefined = curObj[`${key}_review`] as Review;
        if (reviewObj?.added && !protectParent) {
          return undefined;
        }
        const arr: (T | undefined)[] = [];
        let i = 0;
        for (const arrObj of value) {
          const temp = useLastReviewedOnlyRec(arrObj, `${currentPath}/${i}`);
          // keep undefined value in the array so that the index still exists for a path like mutation/11/....
          if (temp !== undefined || protectParent) {
            arr.push(temp);
          }
          i++;
        }
        (newObj as Record<string, unknown>)[key] = arr;
      } else if (typeof value === 'object') {
        (newObj as Record<string, unknown>)[key] = useLastReviewedOnlyRec(value as T, currentPath);
      } else {
        const reviewObj: Review | undefined = curObj[`${key}_review`] as Review;
        if (protectCurrent) {
          (newObj as Record<string, unknown>)[key] = value;
        } else if (!reviewObj?.added || protectParent) {
          (newObj as Record<string, unknown>)[key] = reviewObj?.lastReviewed !== undefined ? reviewObj.lastReviewed : value;
        } else {
          return undefined;
        }
      }
    }
    return newObj;
  }
  return useLastReviewedOnlyRec(obj, '');
}
