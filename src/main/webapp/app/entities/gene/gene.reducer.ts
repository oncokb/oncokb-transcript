import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IGene, defaultValue } from 'app/shared/model/gene.model';

export const ACTION_TYPES = {
  FETCH_GENE_LIST: 'gene/FETCH_GENE_LIST',
  FETCH_GENE: 'gene/FETCH_GENE',
  CREATE_GENE: 'gene/CREATE_GENE',
  UPDATE_GENE: 'gene/UPDATE_GENE',
  PARTIAL_UPDATE_GENE: 'gene/PARTIAL_UPDATE_GENE',
  DELETE_GENE: 'gene/DELETE_GENE',
  RESET: 'gene/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IGene>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

export type GeneState = Readonly<typeof initialState>;

// Reducer

export default (state: GeneState = initialState, action): GeneState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_GENE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_GENE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_GENE):
    case REQUEST(ACTION_TYPES.UPDATE_GENE):
    case REQUEST(ACTION_TYPES.DELETE_GENE):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_GENE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_GENE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_GENE):
    case FAILURE(ACTION_TYPES.CREATE_GENE):
    case FAILURE(ACTION_TYPES.UPDATE_GENE):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_GENE):
    case FAILURE(ACTION_TYPES.DELETE_GENE):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_GENE_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.FETCH_GENE):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_GENE):
    case SUCCESS(ACTION_TYPES.UPDATE_GENE):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_GENE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_GENE):
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

const apiUrl = 'api/genes';

// Actions

export const getEntities: ICrudGetAllAction<IGene> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_GENE_LIST,
  payload: axios.get<IGene>(`${apiUrl}?cacheBuster=${new Date().getTime()}`),
});

export const getEntity: ICrudGetAction<IGene> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_GENE,
    payload: axios.get<IGene>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<IGene> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_GENE,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IGene> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_GENE,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<IGene> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_GENE,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<IGene> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_GENE,
    payload: axios.delete(requestUrl),
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
