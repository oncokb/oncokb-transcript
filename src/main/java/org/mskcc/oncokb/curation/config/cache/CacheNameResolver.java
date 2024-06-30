package org.mskcc.oncokb.curation.config.cache;

import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.springframework.stereotype.Component;

@Component
public class CacheNameResolver {

    private final ApplicationProperties applicationProperties;

    private final Liquibase liquibase = new Liquibase();

    public Liquibase getLiquibase() {
        return liquibase;
    }

    public static class Liquibase {

        private Boolean asyncStart;

        public Boolean getAsyncStart() {
            return asyncStart;
        }

        public void setAsyncStart(Boolean asyncStart) {
            this.asyncStart = asyncStart;
        }
    }

    public CacheNameResolver(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    public String getCacheName(CacheCategory cacheCategory, String cacheKey) {
        return applicationProperties.getName() + "-" + cacheCategory + "-" + cacheKey;
    }
}
