import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IDrugSynonym, defaultValue } from 'app/shared/model/drug-synonym.model';

export const ACTION_TYPES = {
  FETCH_DRUGSYNONYM_LIST: 'drugSynonym/FETCH_DRUGSYNONYM_LIST',
  FETCH_DRUGSYNONYM: 'drugSynonym/FETCH_DRUGSYNONYM',
  CREATE_DRUGSYNONYM: 'drugSynonym/CREATE_DRUGSYNONYM',
  UPDATE_DRUGSYNONYM: 'drugSynonym/UPDATE_DRUGSYNONYM',
  PARTIAL_UPDATE_DRUGSYNONYM: 'drugSynonym/PARTIAL_UPDATE_DRUGSYNONYM',
  DELETE_DRUGSYNONYM: 'drugSynonym/DELETE_DRUGSYNONYM',
  SET_BLOB: 'drugSynonym/SET_BLOB',
  RESET: 'drugSynonym/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IDrugSynonym>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

export type DrugSynonymState = Readonly<typeof initialState>;

// Reducer

export default (state: DrugSynonymState = initialState, action): DrugSynonymState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_DRUGSYNONYM_LIST):
    case REQUEST(ACTION_TYPES.FETCH_DRUGSYNONYM):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_DRUGSYNONYM):
    case REQUEST(ACTION_TYPES.UPDATE_DRUGSYNONYM):
    case REQUEST(ACTION_TYPES.DELETE_DRUGSYNONYM):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_DRUGSYNONYM):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_DRUGSYNONYM_LIST):
    case FAILURE(ACTION_TYPES.FETCH_DRUGSYNONYM):
    case FAILURE(ACTION_TYPES.CREATE_DRUGSYNONYM):
    case FAILURE(ACTION_TYPES.UPDATE_DRUGSYNONYM):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_DRUGSYNONYM):
    case FAILURE(ACTION_TYPES.DELETE_DRUGSYNONYM):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_DRUGSYNONYM_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.FETCH_DRUGSYNONYM):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_DRUGSYNONYM):
    case SUCCESS(ACTION_TYPES.UPDATE_DRUGSYNONYM):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_DRUGSYNONYM):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_DRUGSYNONYM):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {},
      };
    case ACTION_TYPES.SET_BLOB: {
      const { name, data, contentType } = action.payload;
      return {
        ...state,
        entity: {
          ...state.entity,
          [name]: data,
          [name + 'ContentType']: contentType,
        },
      };
    }
    case ACTION_TYPES.RESET:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

const apiUrl = 'api/drug-synonyms';

// Actions

export const getEntities: ICrudGetAllAction<IDrugSynonym> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_DRUGSYNONYM_LIST,
  payload: axios.get<IDrugSynonym>(`${apiUrl}?cacheBuster=${new Date().getTime()}`),
});

export const getEntity: ICrudGetAction<IDrugSynonym> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_DRUGSYNONYM,
    payload: axios.get<IDrugSynonym>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<IDrugSynonym> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_DRUGSYNONYM,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IDrugSynonym> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_DRUGSYNONYM,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<IDrugSynonym> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_DRUGSYNONYM,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<IDrugSynonym> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_DRUGSYNONYM,
    payload: axios.delete(requestUrl),
  });
  dispatch(getEntities());
  return result;
};

export const setBlob = (name, data, contentType?) => ({
  type: ACTION_TYPES.SET_BLOB,
  payload: {
    name,
    data,
    contentType,
  },
});

export const reset = () => ({
  type: ACTION_TYPES.RESET,
});
