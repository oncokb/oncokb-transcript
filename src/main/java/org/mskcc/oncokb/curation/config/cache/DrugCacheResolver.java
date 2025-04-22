package org.mskcc.oncokb.curation.config.cache;

import java.util.ArrayList;
import java.util.Collection;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.interceptor.CacheOperationInvocationContext;
import org.springframework.cache.interceptor.CacheResolver;

public class DrugCacheResolver implements CacheResolver {

    private final CacheManager cacheManager;
    private final CacheNameResolver cacheNameResolver;

    public DrugCacheResolver(CacheManager cacheManager, CacheNameResolver cacheNameResolver) {
        this.cacheManager = cacheManager;
        this.cacheNameResolver = cacheNameResolver;
    }

    @Override
    public Collection<? extends Cache> resolveCaches(CacheOperationInvocationContext<?> context) {
        Collection<Cache> caches = new ArrayList<>();

        if (context.getMethod().getName() == "findAll") {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(CacheCategory.DRUG, CacheKeys.DRUGS_ALL)));
        }
        return caches;
    }
}
