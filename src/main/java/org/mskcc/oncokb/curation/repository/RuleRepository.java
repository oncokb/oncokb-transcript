package org.mskcc.oncokb.curation.repository;

import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.Rule;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Rule entity.
 */
@JaversSpringDataAuditable
@Repository
public interface RuleRepository extends JpaRepository<Rule, Long> {}
