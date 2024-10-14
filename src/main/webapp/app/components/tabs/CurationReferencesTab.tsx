import { SentryError } from 'app/config/sentry-error';
import { ParsedRef } from 'app/oncokb-commons/components/RefComponent';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { Gene, Mutation } from 'app/shared/model/firebase/firebase.model';
import {
  compareMutationsByCategoricalAlteration,
  compareMutationsByProteinChangePosition,
  compareMutationsBySingleAlteration,
  getMutationName,
  getTxName,
} from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { getCancerTypesNameWithExclusion, getReferenceFullName, parseTextForReferences } from 'app/shared/util/utils';
import { IRootStore } from 'app/stores';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Row, Input } from 'reactstrap';
export interface ICurationAbstractsTabProps extends StoreProps {
  genePath: string;
}

type PathInfo = {
  path: string;
  details: {
    mutation: Mutation;
  };
};

type DisplayedReferenceData = {
  reference: ParsedRef;
  pathInfo: PathInfo;
  depth: number;
};

type ReferenceData = {
  [referenceName: string]: DisplayedReferenceData[];
};

function CurationReferencesTab({ genePath, drugList, firebaseDb }: ICurationAbstractsTabProps) {
  const [gene, setGene] = useState<Gene>();
  const [geneInitialized, setGeneInitialized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [displayedReferences, setDisplayedReferences] = useState<DisplayedReferenceData[][]>([]);

  const updateGene = useCallback((snapshot: DataSnapshot) => {
    setGene(snapshot.val());
  }, []);

  const updateGeneDebounced = _.debounce(updateGene, 150);

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const unsubscribe = onValue(ref(firebaseDb, genePath), snapshot => {
      if (geneInitialized) {
        updateGeneDebounced(snapshot);
      } else {
        updateGene(snapshot);
        setGeneInitialized(true);
      }
    });

    return () => unsubscribe?.();
  }, [geneInitialized, firebaseDb, genePath]);

  const allReferences = useMemo(() => {
    if (!gene) {
      return {};
    }
    try {
      const references: ReferenceData = {};
      findReferences(references, gene);
      return references;
    } catch (e) {
      notifyError(e);
      return {};
    }
  }, [gene]);

  function findReferences(references: ReferenceData, obj, path = '', depth = 0) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newPath = path ? `${path}, ${key}` : key;

        if (typeof obj[key] === 'string') {
          const newReferences = parseTextForReferences(obj[key]);
          newReferences.forEach(newReference => {
            const fullNewReferenceName = getReferenceFullName(newReference);
            const pathInfo = parseLocationPath(newPath);

            if (references[fullNewReferenceName] && pathInfo) {
              references[fullNewReferenceName].push({ reference: newReference, pathInfo, depth });
            } else if (pathInfo) {
              references[fullNewReferenceName] = [{ reference: newReference, pathInfo, depth }];
            }
          });
        } else if (typeof obj[key] === 'object' && key !== 'name_comments' && !key.endsWith('_review')) {
          findReferences(references, obj[key], newPath, depth + 1);
        }
      }
    }
  }

  function parseLocationPath(path: string): PathInfo | undefined {
    let mutationIndex = -1;
    let mutation: Mutation | undefined;
    let parsedPath = path.replace(/mutations, (\d+)/g, (match, index: string) => {
      mutationIndex = Number(index);
      mutation = gene?.mutations[mutationIndex];
      return getMutationName(mutation?.name, mutation?.alterations);
    });

    let tumorIndex = -1;
    if (mutationIndex > -1) {
      parsedPath = parsedPath.replace(/tumors, (\d+)/g, (match, index: string) => {
        tumorIndex = Number(index);
        const tumor = gene?.mutations[mutationIndex].tumors[tumorIndex];
        return getCancerTypesNameWithExclusion(tumor?.cancerTypes ?? [], tumor?.excludedCancerTypes ?? [], true);
      });
    }

    if (tumorIndex > -1) {
      parsedPath = parsedPath.replace(/TIs, (\d+), treatments, (\d+)/g, (match, tiIndex, treatmentIndex) => {
        const treatmentName = gene?.mutations[mutationIndex].tumors[tumorIndex].TIs[tiIndex].treatments[treatmentIndex].name;
        return getTxName(drugList ?? [], treatmentName);
      });
    }

    parsedPath = parsedPath.replace('background', 'Background');
    parsedPath = parsedPath.replace('mutation_effect', 'Mutation Effect');
    parsedPath = parsedPath.replace('description', 'Description');
    parsedPath = parsedPath.replace('short', 'Additional Information');

    if (!mutation) {
      return;
    }

    return { path: parsedPath, details: { mutation } };
  }

  useEffect(() => {
    const allReferenceKeys = Object.keys(allReferences);
    const newDisplayedReferenceKeys = allReferenceKeys.filter(refKey => refKey.toLowerCase().includes(inputValue.toLowerCase()));

    const newDisplayedReferences = newDisplayedReferenceKeys.map(refKey => allReferences[refKey]);
    newDisplayedReferences.sort((a, b) =>
      getReferenceFullName(a[0].reference).toLowerCase().localeCompare(getReferenceFullName(b[0].reference).toLowerCase()),
    );
    newDisplayedReferences.forEach(refData =>
      refData.sort((a, b) => {
        let order = a.depth - b.depth;
        if (order !== 0) {
          return order;
        }

        const aMutation = a.pathInfo?.details?.mutation;
        const bMutation = b.pathInfo?.details?.mutation;
        if (!aMutation || !bMutation) {
          return a.pathInfo.path.localeCompare(b.pathInfo.path);
        }

        order = compareMutationsBySingleAlteration(aMutation, bMutation);
        if (order !== 0) {
          return order;
        }

        order = compareMutationsByProteinChangePosition(aMutation, bMutation);
        if (order !== 0) {
          return order;
        }

        order = compareMutationsByCategoricalAlteration(aMutation, bMutation);
        if (order !== 0) {
          return order;
        }

        return (aMutation.name ?? '').localeCompare(bMutation?.name ?? '');
      }),
    );

    setDisplayedReferences(newDisplayedReferences);
  }, [allReferences, inputValue]);

  return (
    <div>
      <div className="mb-3">
        <Input value={inputValue} onChange={event => setInputValue(event.target.value)} placeholder="Enter PMID or abstract" />
      </div>
      {displayedReferences.map(data => {
        return (
          <div key={`${data[0].reference.content}`}>
            <div className="mb-2">
              <span>
                <a target="_blank" rel="noopener noreferrer" href={data[0].reference.link}>
                  {`${data[0].reference.prefix}${data[0].reference.content}`}
                </a>
              </span>
            </div>
            <div className="border-bottom pb-3 mb-3">
              <span>
                <b>Location(s):</b>
                <ul style={{ listStyleType: 'number', listStylePosition: 'inside', paddingLeft: 0 }}>
                  {data.map(reference => (
                    <li key={reference.pathInfo.path}>{reference.pathInfo.path}</li>
                  ))}
                </ul>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const mapStoreToProps = ({ firebaseAppStore, drugStore }: IRootStore) => ({
  drugList: drugStore.entities,
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(CurationReferencesTab);
