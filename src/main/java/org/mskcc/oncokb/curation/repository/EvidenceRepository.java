package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Evidence;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Evidence entity.
 */
@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long>, JpaSpecificationExecutor<Evidence> {
    @Query(
        value = "select distinct evidence from Evidence evidence left join fetch evidence.levelOfEvidences",
        countQuery = "select count(distinct evidence) from Evidence evidence"
    )
    Page<Evidence> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct evidence from Evidence evidence left join fetch evidence.levelOfEvidences")
    List<Evidence> findAllWithEagerRelationships();

    @Query("select evidence from Evidence evidence left join fetch evidence.levelOfEvidences where evidence.id =:id")
    Optional<Evidence> findOneWithEagerRelationships(@Param("id") Long id);
}
