package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.Association;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Association entity.
 */
@Repository
public interface AssociationRepository extends JpaRepository<Association, Long> {
    @Query(
        value = "select distinct association from Association association left join fetch association.alterations left join fetch association.articles left join fetch association.treatments",
        countQuery = "select count(distinct association) from Association association"
    )
    Page<Association> findAllWithEagerRelationships(Pageable pageable);

    @Query(
        "select distinct association from Association association left join fetch association.alterations left join fetch association.articles left join fetch association.treatments"
    )
    List<Association> findAllWithEagerRelationships();

    @Query(
        "select association from Association association" +
        " left join fetch association.alterations" +
        " left join fetch association.articles" +
        " left join fetch association.treatments ts" +
        " left join fetch ts.drugs" +
        " where association.id =:id"
    )
    Optional<Association> findOneWithEagerRelationships(@Param("id") Long id);
}
