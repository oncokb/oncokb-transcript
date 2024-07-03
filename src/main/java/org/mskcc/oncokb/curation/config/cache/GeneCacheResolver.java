package org.mskcc.oncokb.curation.config.cache;

import java.util.ArrayList;
import java.util.Collection;
import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.interceptor.CacheOperationInvocationContext;
import org.springframework.cache.interceptor.CacheResolver;

public class GeneCacheResolver implements CacheResolver {

    private final ApplicationProperties applicationProperties;
    private final CacheManager cacheManager;
    private final CacheNameResolver cacheNameResolver;

    public GeneCacheResolver(CacheManager cacheManager, ApplicationProperties applicationProperties, CacheNameResolver cacheNameResolver) {
        this.cacheManager = cacheManager;
        this.applicationProperties = applicationProperties;
        this.cacheNameResolver = cacheNameResolver;
    }

    @Override
    public Collection<? extends Cache> resolveCaches(CacheOperationInvocationContext<?> context) {
        Collection<Cache> caches = new ArrayList<>();

        if (context.getMethod().getName() == "findByEntrezGeneId") {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(CacheCategory.GENE, CacheKeys.GENES_BY_ENTREZ_GENE_ID)));
        } else if (context.getMethod().getName() == "findByHugoSymbol") {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(CacheCategory.GENE, CacheKeys.GENES_BY_HUGO_SYMBOL)));
        } else if (context.getMethod().getName() == "findByName") {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(CacheCategory.GENE, CacheKeys.GENE_ALIASES_BY_NAME)));
        }

        return caches;
    }
}
