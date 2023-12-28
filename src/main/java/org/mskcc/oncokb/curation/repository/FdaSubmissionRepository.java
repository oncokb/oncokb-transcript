package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the FdaSubmission entity.
 */
@JaversSpringDataAuditable
@Repository
public interface FdaSubmissionRepository extends JpaRepository<FdaSubmission, Long>, JpaSpecificationExecutor<FdaSubmission> {
    @Query(
        value = "select distinct fdaSubmission from FdaSubmission fdaSubmission left join fetch fdaSubmission.associations",
        countQuery = "select count(distinct fdaSubmission) from FdaSubmission fdaSubmission"
    )
    Page<FdaSubmission> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct fdaSubmission from FdaSubmission fdaSubmission left join fetch fdaSubmission.associations")
    List<FdaSubmission> findAllWithEagerRelationships();

    @Query("select fdaSubmission from FdaSubmission fdaSubmission left join fetch fdaSubmission.associations where fdaSubmission.id =:id")
    Optional<FdaSubmission> findOneWithEagerRelationships(@Param("id") Long id);

    @Query(
        "select fdaSubmission from FdaSubmission fdaSubmission left join fetch fdaSubmission.associations where fdaSubmission.number =:number and fdaSubmission.supplementNumber =:supplementNumber"
    )
    Optional<FdaSubmission> findByNumberAndSupplementNumber(
        @Param("number") String number,
        @Param("supplementNumber") String supplementNumber
    );

    List<FdaSubmission> findByNumberAndSupplementNumberAndCompanionDiagnosticDevice(
        String number,
        String supplementNumber,
        CompanionDiagnosticDevice companionDiagnosticDevice
    );

    List<FdaSubmission> findByCompanionDiagnosticDeviceId(Long id);
}
