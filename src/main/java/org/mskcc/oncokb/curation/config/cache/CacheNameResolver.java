package org.mskcc.oncokb.curation.config.cache;

import org.mskcc.oncokb.curation.config.ApplicationProperties;
import org.springframework.stereotype.Component;

@Component
public class CacheNameResolver {

    ApplicationProperties applicationProperties;

    public CacheNameResolver(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    public String getCacheName(CacheCategory cacheCategory, String cacheKey) {
        return applicationProperties.getName() + "-" + cacheCategory + "-" + cacheKey;
    }
}
