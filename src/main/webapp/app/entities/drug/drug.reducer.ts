import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'react-jhipster';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IDrug, defaultValue } from 'app/shared/model/drug.model';

export const ACTION_TYPES = {
  FETCH_DRUG_LIST: 'drug/FETCH_DRUG_LIST',
  FETCH_DRUG: 'drug/FETCH_DRUG',
  CREATE_DRUG: 'drug/CREATE_DRUG',
  UPDATE_DRUG: 'drug/UPDATE_DRUG',
  PARTIAL_UPDATE_DRUG: 'drug/PARTIAL_UPDATE_DRUG',
  DELETE_DRUG: 'drug/DELETE_DRUG',
  SET_BLOB: 'drug/SET_BLOB',
  RESET: 'drug/RESET',
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IDrug>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false,
};

export type DrugState = Readonly<typeof initialState>;

// Reducer

export default (state: DrugState = initialState, action): DrugState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_DRUG_LIST):
    case REQUEST(ACTION_TYPES.FETCH_DRUG):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true,
      };
    case REQUEST(ACTION_TYPES.CREATE_DRUG):
    case REQUEST(ACTION_TYPES.UPDATE_DRUG):
    case REQUEST(ACTION_TYPES.DELETE_DRUG):
    case REQUEST(ACTION_TYPES.PARTIAL_UPDATE_DRUG):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true,
      };
    case FAILURE(ACTION_TYPES.FETCH_DRUG_LIST):
    case FAILURE(ACTION_TYPES.FETCH_DRUG):
    case FAILURE(ACTION_TYPES.CREATE_DRUG):
    case FAILURE(ACTION_TYPES.UPDATE_DRUG):
    case FAILURE(ACTION_TYPES.PARTIAL_UPDATE_DRUG):
    case FAILURE(ACTION_TYPES.DELETE_DRUG):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload,
      };
    case SUCCESS(ACTION_TYPES.FETCH_DRUG_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.FETCH_DRUG):
      return {
        ...state,
        loading: false,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.CREATE_DRUG):
    case SUCCESS(ACTION_TYPES.UPDATE_DRUG):
    case SUCCESS(ACTION_TYPES.PARTIAL_UPDATE_DRUG):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data,
      };
    case SUCCESS(ACTION_TYPES.DELETE_DRUG):
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

const apiUrl = 'api/drugs';

// Actions

export const getEntities: ICrudGetAllAction<IDrug> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_DRUG_LIST,
  payload: axios.get<IDrug>(`${apiUrl}?cacheBuster=${new Date().getTime()}`),
});

export const getEntity: ICrudGetAction<IDrug> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_DRUG,
    payload: axios.get<IDrug>(requestUrl),
  };
};

export const createEntity: ICrudPutAction<IDrug> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_DRUG,
    payload: axios.post(apiUrl, cleanEntity(entity)),
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IDrug> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_DRUG,
    payload: axios.put(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const partialUpdate: ICrudPutAction<IDrug> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.PARTIAL_UPDATE_DRUG,
    payload: axios.patch(`${apiUrl}/${entity.id}`, cleanEntity(entity)),
  });
  return result;
};

export const deleteEntity: ICrudDeleteAction<IDrug> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_DRUG,
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
