import React, { useMemo } from 'react';
import DefaultBadge from './DefaultBadge';
import { IRootStore } from 'app/stores';
import { componentInject } from '../util/typed-inject';
import { getMutationName } from '../util/firebase/firebase-utils';
import { RADIO_OPTION_NONE } from 'app/config/constants/constants';

const NOT_CURATABLE_TOOLTIP_TEXT = {
  stringMutations: 'Each mutation should have its own mutation effect curated',
  default: 'This mutation cannot have its own mutation effect',
};

export interface INotCuratableBadgeProps extends StoreProps {
  mutationName: string;
}

const NotCuratableBadge: React.FunctionComponent<INotCuratableBadgeProps> = ({ mutationName, mutations }: INotCuratableBadgeProps) => {
  const text = mutationName?.includes(',') ? NOT_CURATABLE_TOOLTIP_TEXT.stringMutations : NOT_CURATABLE_TOOLTIP_TEXT.default;

  const mutationsWithEffect = useMemo(() => {
    const mutationStrings: string[] = [];
    for (const name of mutationName.split(',')) {
      const trimmedName = name.trim();
      const foundMutation = mutations?.find(mut => getMutationName(mut.name, mut.alterations) === trimmedName);
      if (!foundMutation) {
        continue;
      }

      mutationStrings.push(`${trimmedName} (${foundMutation?.mutation_effect.effect ?? RADIO_OPTION_NONE})`);
    }

    return mutationStrings.join(', ');
  }, [mutations, mutationName, getMutationName, RADIO_OPTION_NONE]);

  return (
    <DefaultBadge
      color={'warning'}
      text={'Not Curatable'}
      tooltipOverlay={
        <div>
          <span>{text}</span>
          <br />
          <br />
          <span className="text-warning">{mutationsWithEffect}</span>
        </div>
      }
    />
  );
};

const mapStoreToProps = ({ firebaseMutationListStore }: IRootStore) => ({
  mutations: firebaseMutationListStore.data,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(NotCuratableBadge);
