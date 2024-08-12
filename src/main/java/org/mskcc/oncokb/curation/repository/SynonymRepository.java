package org.mskcc.oncokb.curation.repository;

import java.util.List;
import java.util.Optional;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.Synonym;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Synonym entity.
 */
@Repository
public interface SynonymRepository extends JpaRepository<Synonym, Long>, JpaSpecificationExecutor<Synonym> {
    Optional<Synonym> findByTypeAndSourceAndName(String type, String source, String name);
}
