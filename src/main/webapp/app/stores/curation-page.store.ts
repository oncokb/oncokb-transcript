import { IRootStore } from 'app/stores/createStore';
import { Alteration as ApiAlteration, AlterationAnnotationStatus, AnnotateAlterationBody } from 'app/shared/api/generated/curation';
import { makeAutoObservable } from 'mobx';
import { REFERENCE_GENOME } from 'app/config/constants/constants';
import { Alteration as FirebaseAlt } from 'app/shared/model/firebase/firebase.model';
import { alterationControllerClient } from 'app/shared/api/clients';

export type MutationQuery = {
  name: string;
  alterations: FirebaseAlt[];
};

export type AnnotatedAltsQuery = {
  query: AnnotateAlterationBody;
  result: AlterationAnnotationStatus;
};

export type AnnotatedAltsCache = {
  loading: boolean;
  error: Error;
  cache: { [key: string]: AnnotatedAltsQuery };
  get: (hugoSymbol: string, mutations: MutationQuery[]) => AlterationAnnotationStatus[];
  fetch: (hugoSymbol: string, mutations: MutationQuery[]) => Promise<AlterationAnnotationStatus[]>;
};

const getAltKey = (alt: FirebaseAlt | string) => {
  if (alt instanceof Object) {
    return alt.alteration;
  } else {
    return alt;
  }
};

const createMutationQuery = (hugoSymbol: string, mutation: MutationQuery) => {
  const acc: AnnotateAlterationBody[] = [];
  if (mutation.alterations) {
    mutation.alterations.forEach(alt => {
      const queryId = getAltKey(alt);
      acc.push({
        queryId,
        referenceGenome: REFERENCE_GENOME.GRCH37,
        alteration: {
          genes: alt.genes
            ? alt.genes.map(gene => {
                return { id: gene.id };
              })
            : [{ hugoSymbol }],
          alteration: alt.alteration,
        } as ApiAlteration,
      } as AnnotateAlterationBody);
    });
  } else if (mutation.name) {
    mutation.name.split(',').forEach(alt => {
      const queryId = alt.trim();
      acc.push({
        queryId,
        referenceGenome: REFERENCE_GENOME.GRCH37,
        alteration: {
          genes: [{ hugoSymbol }],
          alteration: alt,
        } as ApiAlteration,
      } as AnnotateAlterationBody);
    });
  }
  return acc;
};

export class CurationPageStore {
  public annotatedAltsCache: AnnotatedAltsCache = {
    loading: false,
    cache: {},
    error: null,
    get: (hugoSymbol: string, mutations: MutationQuery[]) => this.getAnnotatedAltsCache(hugoSymbol, mutations),
    fetch: (hugoSymbol: string, mutations: MutationQuery[]) => this.fetchAnnotatedAltsCache(hugoSymbol, mutations),
  };

  constructor(protected rootStore: IRootStore) {
    makeAutoObservable(this);
  }

  async annotateAlterations(queries: AnnotateAlterationBody[]) {
    try {
      this.annotatedAltsCache.loading = true;
      const result = await alterationControllerClient.annotateAlterations(queries);
      result.data.forEach(queryStatus => {
        this.annotatedAltsCache.cache[queryStatus.queryId].result = queryStatus;
      });
    } catch (responseError) {
      this.annotatedAltsCache.error = responseError;
    } finally {
      this.annotatedAltsCache.loading = false;
    }
  }

  async fetchAnnotatedAltsCache(hugoSymbol: string, mutations: MutationQuery[]) {
    const queries = mutations.reduce((acc, mutation) => {
      acc.push(...createMutationQuery(hugoSymbol, mutation));
      return acc;
    }, [] as AnnotateAlterationBody[]);

    const unannotatedQueries = queries.filter(query => !this.annotatedAltsCache.cache[query.queryId]);
    if (unannotatedQueries.length > 0) {
      unannotatedQueries.forEach(query => {
        this.annotatedAltsCache.cache[query.queryId] = {
          query,
          result: null,
        };
      });
      await this.annotateAlterations(unannotatedQueries);
    }
    return queries
      .filter(query => this.annotatedAltsCache.cache[query.queryId] && this.annotatedAltsCache.cache[query.queryId].result)
      .map(query => this.annotatedAltsCache.cache[query.queryId].result);
  }

  getAnnotatedAltsCache(hugoSymbol: string, mutations: MutationQuery[]) {
    const queries = mutations.reduce((acc, mutation) => {
      acc.push(...createMutationQuery(hugoSymbol, mutation));
      return acc;
    }, [] as AnnotateAlterationBody[]);
    return queries
      .filter(query => this.annotatedAltsCache.cache[query.queryId] && this.annotatedAltsCache.cache[query.queryId].result)
      .map(query => this.annotatedAltsCache.cache[query.queryId].result);
  }
}

export default CurationPageStore;
