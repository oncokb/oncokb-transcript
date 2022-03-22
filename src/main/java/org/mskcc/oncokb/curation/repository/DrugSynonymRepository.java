package org.mskcc.oncokb.curation.repository;

import org.mskcc.oncokb.curation.domain.DrugSynonym;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the DrugSynonym entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DrugSynonymRepository extends JpaRepository<DrugSynonym, Long> {}
