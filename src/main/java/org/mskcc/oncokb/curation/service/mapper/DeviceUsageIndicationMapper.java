package org.mskcc.oncokb.curation.service.mapper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.CancerType;
import org.mskcc.oncokb.curation.domain.DeviceUsageIndication;
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.repository.AlterationRepository;
import org.mskcc.oncokb.curation.repository.CancerTypeRepository;
import org.mskcc.oncokb.curation.repository.DrugRepository;
import org.mskcc.oncokb.curation.repository.FdaSubmissionRepository;
import org.mskcc.oncokb.curation.service.dto.DeviceUsageIndicationDTO;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Mapper for the entity {@link Company} and its DTO {@link CompanyDTO}.
 */
@Mapper(componentModel = "spring", uses = {})
public abstract class DeviceUsageIndicationMapper implements EntityMapper<DeviceUsageIndicationDTO, DeviceUsageIndication> {

    @Autowired
    FdaSubmissionRepository fdaSubmissionRepository;

    @Autowired
    AlterationRepository alterationRepository;

    @Autowired
    CancerTypeRepository cancerTypeRepository;

    @Autowired
    DrugRepository drugRepository;

    protected FdaSubmission fromFdaSubmissionId(Long fdaSubmission) {
        return fdaSubmissionRepository.findById(fdaSubmission).orElse(null);
    }

    protected Long fromFdaSubmission(FdaSubmission fdaSubmission) {
        return fdaSubmission.getId();
    }

    protected Set<Alteration> fromAlterationIds(Set<Long> alterationIds) {
        return alterationIds
            .stream()
            .collect(Collectors.toList())
            .stream()
            .map(alterationId -> alterationRepository.findById(alterationId).orElse(null))
            .collect(Collectors.toSet());
    }

    protected Set<Long> fromAlterations(Set<Alteration> alterations) {
        return alterations.stream().collect(Collectors.toList()).stream().map(alteration -> alteration.getId()).collect(Collectors.toSet());
    }

    protected CancerType fromCancerTypeId(Long cancerType) {
        return cancerTypeRepository.findById(cancerType).orElse(null);
    }

    protected Long fromCancerType(CancerType cancerType) {
        return cancerType.getId();
    }

    protected Set<Drug> fromDrugIds(Set<Long> drugIds) {
        return drugIds
            .stream()
            .collect(Collectors.toList())
            .stream()
            .map(drugId -> drugRepository.findById(drugId).orElse(null))
            .collect(Collectors.toSet());
    }

    protected Set<Long> fromDrugs(Set<Drug> drugs) {
        return drugs.stream().collect(Collectors.toList()).stream().map(drug -> drug.getId()).collect(Collectors.toSet());
    }
}
