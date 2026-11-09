import React from 'react';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { getNCBIlink } from 'app/oncokb-commons/components/lib/urls';
import { Linkout } from 'app/shared/links/Linkout';
import { HotspotDTO } from 'app/shared/api/generated/curation';
import _ from 'lodash';
import InfoIcon from 'app/shared/icons/InfoIcon';
import cancerHotspotIcon from '../../../content/images/cancer-hotspots.svg';
import threeDHotspotIcon from '../../../content/images/3d-hotspots.svg';

enum HotspotType {
  HOTSPOT_V2 = 'HOTSPOT_V2',
  HOTSPOT_V3 = 'HOTSPOT_V3',
  THREE_D = 'THREE_D',
}

const getHotspotTypeName = (hotspotType: HotspotType) => {
  switch (hotspotType) {
    case HotspotType.HOTSPOT_V2:
      return 'Cancer Hotspots(v2)';
    case HotspotType.HOTSPOT_V3:
      return 'Cancer Hotspots(v3)';
    case HotspotType.THREE_D:
      return '3D Hotspots';
    default:
      return '';
  }
};

const getHotspotDescription = (hotspotType: string) => {
  if ((hotspotType as HotspotType) === HotspotType.HOTSPOT_V2) {
    return (
      <div>
        Identified as a recurrent hotspot (statistically significant) in a population-scale cohort of tumor samples of various cancer types
        using methodology based in part on <Linkout to={getNCBIlink('/pubmed/29247016')}>Chang et al. 2017</Linkout> and{' '}
        <Linkout to={getNCBIlink('/pubmed/26619011')}>Chang et al. 2016</Linkout>.
      </div>
    );
  } else if ((hotspotType as HotspotType) === HotspotType.HOTSPOT_V3) {
    return (
      <div>
        Identified as a recurrent hotspot (statistically significant) in a population-scale cohort of tumor samples of various cancer types
        using methodology described in Bandlamudi et al. 2026.
      </div>
    );
  } else if ((hotspotType as HotspotType) === HotspotType.THREE_D) {
    return (
      <div>
        Mutations clustering in 3D protein structures identified in 11,119 tumor samples across 41 tumor types by the algorithm described in{' '}
        <Linkout to={getNCBIlink('/pubmed/28115009')}>Gao et al. 2017</Linkout>
      </div>
    );
  } else {
    return <span></span>;
  }
};

const getHotspotTooltipContent = (associatedHotspots: HotspotDTO[]) => {
  const groupedHotspot = associatedHotspots.reduce((acc, next) => {
    if (!next.type) {
      return acc;
    }
    if (!acc[next.type]) {
      acc[next.type] = [];
    }
    acc[next.type].push(next.alteration);
    return acc;
  }, {});

  return (
    <div>
      {Object.keys(groupedHotspot).map(hotspotType => {
        return (
          <div key={hotspotType}>
            <b>{getHotspotTypeName(hotspotType as HotspotType)}</b>: {_.uniq(groupedHotspot[hotspotType]).join(', ')}{' '}
            <InfoIcon overlay={() => getHotspotDescription(hotspotType)} />
          </div>
        );
      })}
    </div>
  );
};

const HOTSPOT_ICON_STYLE: React.CSSProperties = { height: 18 };
const THREE_D_HOTSPOT_ICON_STYLE: React.CSSProperties = { height: 23 };

const HotspotIcon: React.FunctionComponent<{ associatedHotspots: HotspotDTO[] }> = props => {
  const [threeDHotspots, regularHotspots] = _.partition(props.associatedHotspots, hotspot => hotspot.type === HotspotType.THREE_D);
  return (
    <>
      {regularHotspots.length > 0 && (
        <DefaultTooltip overlay={() => getHotspotTooltipContent(regularHotspots)}>
          <img src={cancerHotspotIcon} alt="Cancer Hotspot" className={'mx-1'} style={HOTSPOT_ICON_STYLE} />
        </DefaultTooltip>
      )}
      {threeDHotspots.length > 0 && (
        <DefaultTooltip overlay={() => getHotspotTooltipContent(threeDHotspots)}>
          <img src={threeDHotspotIcon} alt="3D Hotspot" className={'mx-1'} style={THREE_D_HOTSPOT_ICON_STYLE} />
        </DefaultTooltip>
      )}
    </>
  );
};

export default HotspotIcon;
