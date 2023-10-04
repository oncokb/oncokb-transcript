package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.BiomarkerAssociation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the BiomarkerAssociation entity.
 */
@Repository
public interface BiomarkerAssociationRepository extends JpaRepository<BiomarkerAssociation, Long> {
    List<BiomarkerAssociation> findDistinctIdByFdaSubmissions_CompanionDiagnosticDeviceId(Long id);

    @Query(
        value = "select distinct biomarkerAssociation from BiomarkerAssociation biomarkerAssociation" +
        " left join fetch biomarkerAssociation.alterations" +
        " left join fetch biomarkerAssociation.drugs" +
        " left join fetch biomarkerAssociation.fdaSubmissions",
        countQuery = "select count(distinct biomarkerAssociation) from BiomarkerAssociation biomarkerAssociation"
    )
    Page<BiomarkerAssociation> findAllWithEagerRelationships(Pageable pageable);

    @Query(
        "select distinct biomarkerAssociation from BiomarkerAssociation biomarkerAssociation" +
        " left join fetch biomarkerAssociation.alterations" +
        " left join fetch biomarkerAssociation.drugs" +
        " left join fetch biomarkerAssociation.fdaSubmissions"
    )
    List<BiomarkerAssociation> findAllWithEagerRelationships();

    @Query(
        "select biomarkerAssociation from BiomarkerAssociation biomarkerAssociation" +
        " left join fetch biomarkerAssociation.alterations" +
        " left join fetch biomarkerAssociation.drugs" +
        " left join fetch biomarkerAssociation.fdaSubmissions" +
        " where biomarkerAssociation.id =:id"
    )
    Optional<BiomarkerAssociation> findOneWithEagerRelationships(@Param("id") Long id);
}
