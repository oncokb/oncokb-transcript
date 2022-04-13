package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the FdaSubmission entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FdaSubmissionRepository extends JpaRepository<FdaSubmission, Long> {
    List<FdaSubmission> findByNumberAndSupplementNumber(String number, String supplementNumber);

    List<FdaSubmission> findByNumberAndSupplementNumberAndCompanionDiagnosticDevice(
        String number,
        String supplementNumber,
        CompanionDiagnosticDevice companionDiagnosticDevice
    );
}
