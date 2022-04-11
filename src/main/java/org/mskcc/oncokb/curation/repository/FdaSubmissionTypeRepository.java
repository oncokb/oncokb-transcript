package org.mskcc.oncokb.curation.repository;

import java.util.Optional;
import org.mskcc.oncokb.curation.domain.FdaSubmissionType;
import org.mskcc.oncokb.curation.domain.enumeration.FdaSubmissionTypeKey;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the FdaSubmissionType entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FdaSubmissionTypeRepository extends JpaRepository<FdaSubmissionType, Long> {
    Optional<FdaSubmissionType> findByType(FdaSubmissionTypeKey type);
}
