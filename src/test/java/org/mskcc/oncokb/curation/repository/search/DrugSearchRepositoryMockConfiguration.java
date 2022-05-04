package org.mskcc.oncokb.curation.repository.search;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Configuration;

/**
 * Configure a Mock version of {@link DrugSearchRepository} to test the
 * application without starting Elasticsearch.
 */
@Configuration
public class DrugSearchRepositoryMockConfiguration {

    @MockBean
    private DrugSearchRepository mockDrugSearchRepository;
}
