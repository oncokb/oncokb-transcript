import { Review } from 'app/shared/model/firebase/firebase.model';

export function useLastReviewedOnly<T>(obj: T): T {
  function useLastReviewedOnlyRec(curObj: T): T {
    const newObj: T = {} as T;
    for (const [key, value] of Object.entries(curObj as Record<string, unknown>)) {
      if (key.endsWith('_review')) {
        const temp: Review = Object.assign({} as Review, value);
        delete temp.lastReviewed;
        (newObj as Record<string, unknown>)[key] = temp;
      } else if (Array.isArray(value)) {
        const arr: T[] = [];
        for (const arrObj of value) {
          const temp = useLastReviewedOnlyRec(arrObj);
          arr.push(temp);
        }
        (newObj as Record<string, unknown>)[key] = arr;
      } else if (typeof value === 'object') {
        (newObj as Record<string, unknown>)[key] = useLastReviewedOnlyRec(value as T);
      } else {
        const reviewObj: Review | undefined = curObj[`${key}_review`] as Review;
        (newObj as Record<string, unknown>)[key] = reviewObj?.lastReviewed !== undefined ? reviewObj.lastReviewed : value;
      }
    }
    return newObj;
  }
  return useLastReviewedOnlyRec(obj);
}
