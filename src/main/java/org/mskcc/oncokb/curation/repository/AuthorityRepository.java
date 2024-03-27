package org.mskcc.oncokb.curation.repository;

import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.mskcc.oncokb.curation.domain.Authority;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for the {@link Authority} entity.
 */
@JaversSpringDataAuditable
public interface AuthorityRepository extends JpaRepository<Authority, String> {}
