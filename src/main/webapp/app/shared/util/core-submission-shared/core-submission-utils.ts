import { Gene, Review } from 'app/shared/model/firebase/firebase.model';

/**
 * Determines whether the `path` should be protected based on the review path.
 *
 * Protection is based on whether the current path or parent path aligns with the `reviewPath`,
 * meaning that the data was just accepted by a user.
 *
 * @param reviewPath - The reference path for review, indicating an accepted field. Undefined when nothing was accepted.
 * @param path - The path of the current element being evaluated.
 * @returns - Returns true if the `path` should be protected, false otherwise.
 */
function isPathProtected(reviewPath: string | undefined, path: string): boolean {
  return reviewPath !== undefined && path.length > 0 && (path.includes(reviewPath) || reviewPath.includes(path));
}

/**
 * Recursively filters the provided object to include only the last reviewed elements
 * or elements that where just accepted.
 *
 * Paths are protected if they match the review path or are part of its hierarchy.
 * Protected paths retain their original values, while non-protected paths
 * only use their`lastReviewed` value.
 *
 * @param obj - The object to be filtered for last reviewed elements.
 * @param [reviewPath] - The path used to determine if an element should be protected.
 * @returns - The filtered object or undefined if no elements are accepted.
 */
export function useLastReviewedOnly<T>(obj: T, reviewPath?: string): T | undefined {
  function processObjectRecursively(currentObj: T, parentPath: string): T | undefined {
    const resultObj: T = {} as T;

    for (const [key, value] of Object.entries(currentObj as Record<string, unknown>)) {
      const currentPath = `${parentPath}${parentPath.length > 0 ? '/' : ''}${key}`;
      const isCurrentPathProtected = isPathProtected(reviewPath, currentPath);
      const isParentPathProtected = isPathProtected(reviewPath, parentPath);

      // If the key ends with "_review", copy it to the new object
      if (key.endsWith('_review')) {
        const reviewData: Review = Object.assign({} as Review, value);
        (resultObj as Record<string, unknown>)[key] = reviewData;
      } else if (Array.isArray(value)) {
        const reviewData: Review | undefined = currentObj[`${key}_review`] as Review;
        // If the object is new (indicated by `added`) and the parent path is not protected, exclude it from the result.
        if (reviewData?.added && !isParentPathProtected) {
          return undefined;
        }
        const processedArray: (T | undefined)[] = [];
        let i = 0;
        for (const arrayElement of value) {
          const processedElement = processObjectRecursively(arrayElement, `${currentPath}/${i}`);
          // Preserve undefined values in the array to maintain the correct index structure,
          // ensuring paths like "mutation/11/..." are still valid even if some elements are omitted.
          // If the parent path is protected, push the element regardless of whether it's undefined.
          if (processedElement !== undefined || isParentPathProtected) {
            processedArray.push(processedElement);
          }
          i++;
        }
        (resultObj as Record<string, unknown>)[key] = processedArray;
      } else if (typeof value === 'object') {
        (resultObj as Record<string, unknown>)[key] = processObjectRecursively(value as T, currentPath);
      } else {
        const reviewData: Review | undefined = currentObj[`${key}_review`] as Review;

        if (isCurrentPathProtected) {
          // If the current path is protected, it indicates the current field was accepted,
          // so we retain its original value.
          (resultObj as Record<string, unknown>)[key] = value;
        } else if (!reviewData?.added || isParentPathProtected) {
          // If the field is not new (i.e., `added` is false) or the parent path is protected,
          // we use the last reviewed value (if available) or fall back to the original value.
          (resultObj as Record<string, unknown>)[key] = reviewData?.lastReviewed !== undefined ? reviewData.lastReviewed : value;
        } else {
          // If the object is new (added) and neither the current path nor parent path is protected,
          // exclude the whole resultObj from the result.
          return undefined;
        }
      }
    }
    return resultObj;
  }

  return processObjectRecursively(obj, '');
}

export function findAllChildReviewPaths(gene: Gene, reviewPath: string): string[] {
  const objectKeys = reviewPath.split('/');
  let pathObject: unknown = gene;

  {
    let currentPath = '';
    for (const objectKey of objectKeys) {
      currentPath += `/${objectKey}`;
      if (Array.isArray(pathObject) || (typeof pathObject === 'object' && pathObject !== null)) {
        pathObject = pathObject[objectKey];
      } else {
        throw new Error(`${currentPath} is not an object or array in the path "${reviewPath}" "${JSON.stringify(pathObject)}"`);
      }
    }
  }

  if (typeof pathObject !== 'object' || pathObject === null) {
    return [reviewPath];
  }

  function findAllChildReviewPathsRecursively(obj: unknown, currentPath: string): string[] {
    if (currentPath.endsWith('_review')) {
      return [currentPath.replace('_review', '')];
    } else if (Array.isArray(obj)) {
      const arr: string[] = [];
      let i = 0;
      for (const element of obj) {
        const temp = findAllChildReviewPathsRecursively(element, `${currentPath}/${i}`);
        arr.push(...temp);
        i++;
      }
      return arr;
    } else if (typeof obj === 'object' && obj !== null) {
      const arr: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const temp = findAllChildReviewPathsRecursively(value, `${currentPath}/${key}`);
        arr.push(...temp);
      }
      return arr;
    } else {
      return [];
    }
  }
  return findAllChildReviewPathsRecursively(pathObject, reviewPath);
}
