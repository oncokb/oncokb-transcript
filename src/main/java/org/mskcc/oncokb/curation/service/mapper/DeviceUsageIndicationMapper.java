package org.mskcc.oncokb.curation.service.mapper;

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

    protected FdaSubmission fromFdaSubmissionId(Long fdaSubmissionId) {
        return fdaSubmissionRepository.findById(fdaSubmissionId).orElse(null);
    }

    protected Long fromFdaSubmission(FdaSubmission fdaSubmission) {
        return fdaSubmission.getId();
    }

    protected Alteration fromAlterationId(Long alterationId) {
        return alterationRepository.findById(alterationId).orElse(null);
    }

    protected Long fromAlteration(Alteration alteration) {
        return alteration.getId();
    }

    protected CancerType fromCancerTypeId(Long cancerTypeId) {
        return cancerTypeRepository.findById(cancerTypeId).orElse(null);
    }

    protected Long fromCancerType(CancerType cancerType) {
        return cancerType.getId();
    }

    protected Drug fromDrugId(Long drugId) {
        return drugRepository.findById(drugId).orElse(null);
    }

    protected Long fromDrug(Drug drug) {
        return drug.getId();
    }
}
