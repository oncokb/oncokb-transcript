package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.NciThesaurus;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the NciThesaurus entity.
 */
@JaversSpringDataAuditable
@Repository
public interface NciThesaurusRepository extends JpaRepository<NciThesaurus, Long>, JpaSpecificationExecutor<NciThesaurus> {
    @Query("select nciThesaurus from NciThesaurus nciThesaurus left join fetch nciThesaurus.synonyms where nciThesaurus.id =:id")
    Optional<NciThesaurus> findOneWithEagerRelationships(@Param("id") Long id);

    Optional<NciThesaurus> findByCode(String code);

    @Query(
        "select distinct nciThesaurus from NciThesaurus nciThesaurus left join fetch nciThesaurus.synonyms synonyms where nciThesaurus.displayName = :name or nciThesaurus.preferredName=:name or synonyms.name=:name"
    )
    List<NciThesaurus> findByName(@Param("name") String name);

    @Query(
        "select distinct nciThesaurus from NciThesaurus nciThesaurus left join fetch nciThesaurus.synonyms where nciThesaurus.id in :ids"
    )
    List<NciThesaurus> findAllWithEagerRelationships(@Param("ids") List<Long> ids);

    @Query("select distinct nciThesaurus from NciThesaurus nciThesaurus left join fetch nciThesaurus.synonyms")
    List<NciThesaurus> findAllWithEagerRelationships();

    @Query(
        "select distinct ncit from NciThesaurus ncit left join fetch ncit.synonyms" +
        " where lower(ncit.code) like lower(concat('%', ?1,'%'))" +
        " or lower(ncit.displayName) like lower(concat('%', ?1,'%'))" +
        " or lower(ncit.preferredName) like lower(concat('%', ?1,'%'))" +
        " or lower(ncit.version) like lower(concat('%', ?1,'%'))"
    )
    List<NciThesaurus> searchNciThesaurus(String query);
}
