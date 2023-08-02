package org.mskcc.oncokb.curation.service.mapper;

import java.util.Set;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.BiomarkerAssociation;
import org.mskcc.oncokb.curation.domain.CancerType;
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.repository.AlterationRepository;
import org.mskcc.oncokb.curation.repository.CancerTypeRepository;
import org.mskcc.oncokb.curation.repository.DrugRepository;
import org.mskcc.oncokb.curation.repository.FdaSubmissionRepository;
import org.mskcc.oncokb.curation.repository.GeneRepository;
import org.mskcc.oncokb.curation.service.dto.BiomarkerAssociationDTO;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Mapper for the entity {@link Company} and its DTO {@link CompanyDTO}.
 */
@Mapper(componentModel = "spring", uses = {})
public abstract class BiomarkerAssociationMapper implements EntityMapper<BiomarkerAssociationDTO, BiomarkerAssociation> {

    @Autowired
    FdaSubmissionRepository fdaSubmissionRepository;

    @Autowired
    AlterationRepository alterationRepository;

    @Autowired
    CancerTypeRepository cancerTypeRepository;

    @Autowired
    DrugRepository drugRepository;

    @Autowired
    GeneRepository geneRepository;

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

    protected CancerType fromCancerTypeId(Long cancerTypeId) {
        return cancerTypeRepository.findById(cancerTypeId).orElse(null);
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

    protected Set<FdaSubmission> fromFdaSubmissionIds(Set<Long> fdaSubmissionIds) {
        return fdaSubmissionIds
            .stream()
            .collect(Collectors.toList())
            .stream()
            .map(fdaSubmissionId -> fdaSubmissionRepository.findById(fdaSubmissionId).orElse(null))
            .collect(Collectors.toSet());
    }

    protected Set<Long> fromFdaSubmissions(Set<FdaSubmission> fdaSubmissions) {
        return fdaSubmissions
            .stream()
            .collect(Collectors.toList())
            .stream()
            .map(fdaSubmission -> fdaSubmission.getId())
            .collect(Collectors.toSet());
    }

    protected Gene fromGeneId(Long geneId) {
        return geneRepository.findById(geneId).orElse(null);
    }

    protected Long fromGene(Gene gene) {
        return gene.getId();
    }
}
