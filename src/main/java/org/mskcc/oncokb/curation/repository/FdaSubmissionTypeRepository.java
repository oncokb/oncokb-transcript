package org.mskcc.oncokb.curation.repository;

import org.mskcc.oncokb.curation.domain.FdaSubmissionType;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the FdaSubmissionType entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FdaSubmissionTypeRepository extends JpaRepository<FdaSubmissionType, Long> {}
