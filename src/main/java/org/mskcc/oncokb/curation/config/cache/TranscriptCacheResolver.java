package org.mskcc.oncokb.curation.config.cache;

import java.util.ArrayList;
import java.util.Collection;
import org.mskcc.oncokb.curation.config.ApplicationProperties;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.interceptor.CacheOperationInvocationContext;
import org.springframework.cache.interceptor.CacheResolver;

public class TranscriptCacheResolver implements CacheResolver {

    private final ApplicationProperties applicationProperties;
    private final CacheManager cacheManager;
    private final CacheNameResolver cacheNameResolver;

    public TranscriptCacheResolver(
        CacheManager cacheManager,
        ApplicationProperties applicationProperties,
        CacheNameResolver cacheNameResolver
    ) {
        this.cacheManager = cacheManager;
        this.applicationProperties = applicationProperties;
        this.cacheNameResolver = cacheNameResolver;
    }

    @Override
    public Collection<? extends Cache> resolveCaches(CacheOperationInvocationContext<?> context) {
        Collection<Cache> caches = new ArrayList<>();

        if (context.getMethod().getName() == "findByReferenceGenomeAndEnsemblTranscriptIdIsIn") {
            caches.add(
                cacheManager.getCache(
                    this.cacheNameResolver.getCacheName(CacheCategory.TRANSCRIPT, CacheKeys.TRANSCRIPTS_BY_ENSEMBL_TRANSCRIPT_IDS)
                )
            );
        }

        return caches;
    }
}
