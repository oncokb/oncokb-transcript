package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the CompanionDiagnosticDevice entity.
 */
@Repository
public interface CompanionDiagnosticDeviceRepository
    extends JpaRepository<CompanionDiagnosticDevice, Long>, JpaSpecificationExecutor<CompanionDiagnosticDevice> {
    @Query(
        value = "select distinct companionDiagnosticDevice from CompanionDiagnosticDevice companionDiagnosticDevice left join fetch companionDiagnosticDevice.specimenTypes",
        countQuery = "select count(distinct companionDiagnosticDevice) from CompanionDiagnosticDevice companionDiagnosticDevice"
    )
    Page<CompanionDiagnosticDevice> findAllWithEagerRelationships(Pageable pageable);

    @Query(
        "select distinct companionDiagnosticDevice from CompanionDiagnosticDevice companionDiagnosticDevice left join fetch companionDiagnosticDevice.specimenTypes"
    )
    List<CompanionDiagnosticDevice> findAllWithEagerRelationships();

    @Query(
        "select companionDiagnosticDevice from CompanionDiagnosticDevice companionDiagnosticDevice left join fetch companionDiagnosticDevice.specimenTypes where companionDiagnosticDevice.id =:id"
    )
    Optional<CompanionDiagnosticDevice> findOneWithEagerRelationships(@Param("id") Long id);

    List<CompanionDiagnosticDevice> findByNameIgnoreCaseAndManufacturerIgnoreCase(String name, String manufacturer);
}
