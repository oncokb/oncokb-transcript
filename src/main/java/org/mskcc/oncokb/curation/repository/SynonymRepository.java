package org.mskcc.oncokb.curation.repository;

import java.util.List;
import org.mskcc.oncokb.curation.domain.Synonym;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Synonym entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SynonymRepository extends JpaRepository<Synonym, Long>, JpaSpecificationExecutor<Synonym> {
    List<Synonym> findAllByTypeAndName(String type, String name);
}
