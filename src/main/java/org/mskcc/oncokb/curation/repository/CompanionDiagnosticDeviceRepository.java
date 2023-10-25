package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
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
        "select distinct companionDiagnosticDevice from CompanionDiagnosticDevice companionDiagnosticDevice" +
        " left join fetch companionDiagnosticDevice.specimenTypes" +
        " left join fetch companionDiagnosticDevice.fdaSubmissions fa" +
        " left join fetch fa.biomarkerAssociations ba" +
        " left join fetch ba.drugs" +
        " left join fetch ba.alterations" +
        " left join fetch ba.fdaSubmissions"
    )
    List<CompanionDiagnosticDevice> findAllWithEagerRelationships();

    @Query(
        "select companionDiagnosticDevice from CompanionDiagnosticDevice companionDiagnosticDevice left join fetch companionDiagnosticDevice.specimenTypes" +
        " left join fetch companionDiagnosticDevice.specimenTypes" +
        " left join fetch companionDiagnosticDevice.fdaSubmissions fa" +
        " left join fetch fa.biomarkerAssociations ba" +
        " left join fetch ba.drugs" +
        " left join fetch ba.alterations" +
        " left join fetch ba.fdaSubmissions" +
        " where companionDiagnosticDevice.id =:id"
    )
    Optional<CompanionDiagnosticDevice> findOneWithEagerRelationships(@Param("id") Long id);

    List<CompanionDiagnosticDevice> findByNameIgnoreCaseAndManufacturerIgnoreCase(String name, String manufacturer);
}
