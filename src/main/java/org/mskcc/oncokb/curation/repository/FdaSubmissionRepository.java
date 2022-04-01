package org.mskcc.oncokb.curation.repository;

import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the FdaSubmission entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FdaSubmissionRepository extends JpaRepository<FdaSubmission, Long> {}
