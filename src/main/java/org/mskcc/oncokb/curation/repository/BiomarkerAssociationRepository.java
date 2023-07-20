package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Set;
import org.mskcc.oncokb.curation.domain.BiomarkerAssociation;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the BiomarkerAssociation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface BiomarkerAssociationRepository extends JpaRepository<BiomarkerAssociation, Long> {
    List<BiomarkerAssociation> findDistinctIdByFdaSubmissions_CompanionDiagnosticDeviceId(Long id);
}
