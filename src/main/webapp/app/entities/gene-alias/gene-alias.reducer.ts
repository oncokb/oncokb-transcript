import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IGeneAlias, defaultValue } from 'app/shared/model/gene-alias.model';

export const ACTION_TYPES = {
  FETCH_GENEALIAS_LIST: 'geneAlias/FETCH_GENEALIAS_LIST',
  FETCH_GENEALIAS: 'geneAlias/FETCH_GENEALIAS',
  CREATE_GENEALIAS: 'geneAlias/CREATE_GENEALIAS',
  UPDATE_GENEALIAS: 'geneAlias/UPDATE_GENEALIAS',
  PARTIAL_UPDATE_GENEALIAS: 'geneAlias/PARTIAL_UPDATE_GENEALIAS',
  DELETE_GENEALIAS: 'geneAlias/DELETE_GENEALIAS',
  RESET: 'geneAlias/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IGeneAlias>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

export type GeneAliasState = Readonly<typeof initialState>;

// Reducer

export default (state: GeneAliasState = initialState, action): GeneAliasState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_GENEALIAS_LIST):
    case REQUEST(ACTION_TYPES.FETCH_GENEALIAS):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_GENEALIAS):
    case REQUEST(ACTION_TYPES.UPDATE_GENEALIAS):
    case REQUEST(ACTION_TYPES.DELETE_GENEALIAS):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_GENEALIAS):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_GENEALIAS_LIST):
    case FAILURE(ACTION_TYPES.FETCH_GENEALIAS):
    case FAILURE(ACTION_TYPES.CREATE_GENEALIAS):
    case FAILURE(ACTION_TYPES.UPDATE_GENEALIAS):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_GENEALIAS):
    case FAILURE(ACTION_TYPES.DELETE_GENEALIAS):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_GENEALIAS_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.FETCH_GENEALIAS):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_GENEALIAS):
    case SUCCESS(ACTION_TYPES.UPDATE_GENEALIAS):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_GENEALIAS):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_GENEALIAS):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {},
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

const apiUrl = 'api/gene-aliases';

// Actions

export const getEntities: ICrudGetAllAction<IGeneAlias> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_GENEALIAS_LIST,
  payload: axios.get<IGeneAlias>(`${apiUrl}?cacheBuster=${new Date().getTime()}`),
});

export const getEntity: ICrudGetAction<IGeneAlias> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_GENEALIAS,
    payload: axios.get<IGeneAlias>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<IGeneAlias> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_GENEALIAS,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IGeneAlias> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_GENEALIAS,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<IGeneAlias> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_GENEALIAS,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<IGeneAlias> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_GENEALIAS,
    payload: axios.delete(requestUrl),
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
