package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Alteration entity.
 */
@Repository
public interface AlterationRepository extends JpaRepository<Alteration, Long> {
    @Query(
        value = "select distinct alteration from Alteration alteration left join fetch alteration.genes",
        countQuery = "select count(distinct alteration) from Alteration alteration"
    )
    Page<Alteration> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct alteration from Alteration alteration left join fetch alteration.genes")
    List<Alteration> findAllWithEagerRelationships();

    @Query("select alteration from Alteration alteration left join fetch alteration.genes where alteration.id =:id")
    Optional<Alteration> findOneWithEagerRelationships(@Param("id") Long id);
}
