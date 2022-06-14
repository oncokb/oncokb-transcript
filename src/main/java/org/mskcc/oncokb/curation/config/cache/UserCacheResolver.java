package org.mskcc.oncokb.curation.config.cache;

import java.util.ArrayList;
import java.util.Collection;
import org.mskcc.oncokb.curation.config.ApplicationProperties;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.interceptor.CacheOperationInvocationContext;
import org.springframework.cache.interceptor.CacheResolver;

public class UserCacheResolver implements CacheResolver {

    private final ApplicationProperties applicationProperties;
    private final CacheManager cacheManager;
    private final CacheNameResolver cacheNameResolver;

    public UserCacheResolver(CacheManager cacheManager, ApplicationProperties applicationProperties, CacheNameResolver cacheNameResolver) {
        this.cacheManager = cacheManager;
        this.applicationProperties = applicationProperties;
        this.cacheNameResolver = cacheNameResolver;
    }

    @Override
    public Collection<? extends Cache> resolveCaches(CacheOperationInvocationContext<?> context) {
        Collection<Cache> caches = new ArrayList<>();

        if (context.getMethod().getName() == "findOneWithAuthoritiesByLogin") {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(CacheCategory.USER, CacheKeys.USERS_BY_LOGIN_CACHE)));
        } else if (context.getMethod().getName() == "findOneWithAuthoritiesByEmailIgnoreCase") {
            caches.add(cacheManager.getCache(this.cacheNameResolver.getCacheName(CacheCategory.USER, CacheKeys.USERS_BY_EMAIL_CACHE)));
        }

        return caches;
    }
}
