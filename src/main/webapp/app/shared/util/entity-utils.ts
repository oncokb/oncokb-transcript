import pick from 'lodash/pick';
import { IPaginationBaseState } from 'react-jhipster';
import { ENTITY_TO_TITLE_MAPPING, ENTITY_TYPE, PAGE_ROUTE } from 'app/config/constants/constants';
import pluralize from 'pluralize';
import _ from 'lodash';
import { PaginationState } from '../table/OncoKBAsyncTable';
import { ASC, DESC } from './pagination.constants';

/**
 * Removes fields with an 'id' field that equals ''.
 * This function was created to prevent entities to be sent to
 * the server with an empty id and thus resulting in a 500.
 *
 * @param entity Object to clean.
 */
export const cleanEntity = entity => {
  const keysToKeep = Object.keys(entity).filter(k => !(entity[k] instanceof Object) || (entity[k]['id'] !== '' && entity[k]['id'] !== -1));

  return pick(entity, keysToKeep);
};

/**
 * Simply map a list of element to a list a object with the element as id.
 *
 * @param idList Elements to map.
 * @returns The list of objects with mapped ids.
 */
// TYPE-ISSUE: this function seems to be taking an array of ids and creating an array of { id: string }, but
// this function instead is being sent a list of objects with id as one of the fields.
export const mapIdList = (idList: ReadonlyArray<any>): any => idList.filter((id: any) => id !== '').map((id: any) => ({ id }));

/**
 *
 * @param selectedOptions Maps a list of react-select options to a list of object with the value field as the id.
 * @returns The list of objects with mapped value to id.
 */
export const mapSelectOptionList = (selectedOptions: any[]) => {
  return selectedOptions ? selectedOptions.map(option => ({ id: option.value })) : [];
};

export const overridePaginationStateWithQueryParams = <T>(paginationBaseState: PaginationState<T>, locationSearch: string) => {
  const params = new URLSearchParams(locationSearch);
  const page = params.get('page');
  const sort = params.get('sort');
  if (page && sort) {
    const sortSplit = sort.split(',');
    paginationBaseState.activePage = +page;
    paginationBaseState.sort = sortSplit[0] as keyof T;
    if (isSortOrder(sortSplit[1])) {
      paginationBaseState.order = sortSplit[1];
    }
  }
  return paginationBaseState;
};

const isSortOrder = (value: string): value is typeof ASC | typeof DESC => {
  return value === 'asc' || value === 'desc';
};

export const getEntityPaginationSortParameter = (field: string, sortDirection: string) => {
  return `${field},${sortDirection}`;
};

export const getEntityTitle = (entityType: string) => {
  return (
    ENTITY_TO_TITLE_MAPPING[entityType] ||
    entityType
      .split('-')
      .map((word, index, words) => {
        if (index === words.length - 1) {
          word = pluralize(word);
        }
        return _.capitalize(word);
      })
      .join(' ')
  );
};
