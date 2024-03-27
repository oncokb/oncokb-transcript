package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the CompanionDiagnosticDevice entity.
 */
@JaversSpringDataAuditable
@Repository
public interface CompanionDiagnosticDeviceRepository
    extends JpaRepository<CompanionDiagnosticDevice, Long>, JpaSpecificationExecutor<CompanionDiagnosticDevice> {
    @Query(
        "select distinct companionDiagnosticDevice from CompanionDiagnosticDevice companionDiagnosticDevice" +
        " left join fetch companionDiagnosticDevice.specimenTypes" +
        " left join fetch companionDiagnosticDevice.fdaSubmissions fa" +
        " left join fetch companionDiagnosticDevice.specimenTypes st" +
        " left join fetch fa.associations ba" +
        " left join fetch ba.rules" +
        " left join fetch ba.cancerTypes" +
        " left join fetch ba.drugs" +
        " left join fetch ba.alterations baa" +
        " left join fetch baa.genes" +
        " left join fetch ba.fdaSubmissions"
    )
    List<CompanionDiagnosticDevice> findAllWithEagerRelationships();

    @Query(
        "select companionDiagnosticDevice from CompanionDiagnosticDevice companionDiagnosticDevice left join fetch companionDiagnosticDevice.specimenTypes" +
        " left join fetch companionDiagnosticDevice.specimenTypes" +
        " left join fetch companionDiagnosticDevice.fdaSubmissions fa" +
        " left join fetch companionDiagnosticDevice.specimenTypes st" +
        " left join fetch fa.associations ba" +
        " left join fetch ba.rules" +
        " left join fetch ba.cancerTypes" +
        " left join fetch ba.drugs" +
        " left join fetch ba.alterations baa" +
        " left join fetch baa.genes" +
        " left join fetch ba.fdaSubmissions" +
        " where companionDiagnosticDevice.id =:id"
    )
    Optional<CompanionDiagnosticDevice> findOneWithEagerRelationships(@Param("id") Long id);

    Optional<CompanionDiagnosticDevice> findByName(String name);

    @Query(
        "select companionDiagnosticDevice from CompanionDiagnosticDevice companionDiagnosticDevice left join fetch companionDiagnosticDevice.specimenTypes" +
        " left join fetch companionDiagnosticDevice.specimenTypes" +
        " left join fetch companionDiagnosticDevice.fdaSubmissions fa" +
        " left join fetch companionDiagnosticDevice.specimenTypes st" +
        " left join fetch fa.associations ba" +
        " left join fetch ba.rules" +
        " left join fetch ba.cancerTypes" +
        " left join fetch ba.drugs" +
        " left join fetch ba.alterations baa" +
        " left join fetch baa.genes" +
        " left join fetch ba.fdaSubmissions" +
        " where companionDiagnosticDevice.name =:name and companionDiagnosticDevice.manufacturer=:manufacturer"
    )
    List<CompanionDiagnosticDevice> findByNameIgnoreCaseAndManufacturerIgnoreCase(
        @Param("name") String name,
        @Param("manufacturer") String manufacturer
    );
}
