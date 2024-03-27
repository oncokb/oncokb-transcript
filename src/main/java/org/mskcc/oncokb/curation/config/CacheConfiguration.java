package org.mskcc.oncokb.curation.config;

import java.util.concurrent.TimeUnit;
import javax.cache.configuration.MutableConfiguration;
import javax.cache.expiry.CreatedExpiryPolicy;
import javax.cache.expiry.Duration;
import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.mskcc.oncokb.curation.config.cache.*;
import org.mskcc.oncokb.meta.enumeration.RedisType;
import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.redisson.jcache.configuration.RedissonConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.info.GitProperties;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurerSupport;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.CacheResolver;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tech.jhipster.config.cache.PrefixedKeyGenerator;

@Configuration
@EnableCaching
@ConditionalOnProperty(prefix = "application.redis", name = "enabled", havingValue = "true")
public class CacheConfiguration extends CachingConfigurerSupport {

    private GitProperties gitProperties;
    private BuildProperties buildProperties;

    @Bean
    public RedissonClient redissonClient(org.mskcc.oncokb.meta.model.application.ApplicationProperties applicationProperties)
        throws Exception {
        Config config = new Config();
        if (applicationProperties.getRedis().getType().equals(RedisType.SINGLE.getType())) {
            config
                .useSingleServer()
                .setClientName(applicationProperties.getName())
                .setTimeout(applicationProperties.getRedis().getTimeout())
                .setRetryAttempts(applicationProperties.getRedis().getRetryAttempts())
                .setRetryInterval(applicationProperties.getRedis().getRetryInterval())
                .setAddress(applicationProperties.getRedis().getAddress())
                .setPassword(applicationProperties.getRedis().getPassword());
        } else if (applicationProperties.getRedis().getType().equals(RedisType.SENTINEL.getType())) {
            config
                .useSentinelServers()
                .setClientName(applicationProperties.getName())
                .setTimeout(applicationProperties.getRedis().getTimeout())
                .setRetryAttempts(applicationProperties.getRedis().getRetryAttempts())
                .setRetryInterval(applicationProperties.getRedis().getRetryInterval())
                .setMasterName(applicationProperties.getRedis().getSentinelMasterName())
                .setCheckSentinelsList(false)
                .addSentinelAddress(applicationProperties.getRedis().getAddress())
                .setPassword(applicationProperties.getRedis().getPassword());
        } else if (applicationProperties.getRedis().getType().equals(RedisType.CLUSTER.getType())) {
            config
                .useClusterServers()
                .setTimeout(applicationProperties.getRedis().getTimeout())
                .setRetryAttempts(applicationProperties.getRedis().getRetryAttempts())
                .setRetryInterval(applicationProperties.getRedis().getRetryInterval())
                .addNodeAddress(applicationProperties.getRedis().getAddress())
                .setPassword(applicationProperties.getRedis().getPassword())
                .setClientName(applicationProperties.getName());
        } else {
            throw new Exception(
                "The redis type " +
                applicationProperties.getRedis().getType() +
                " is not supported. Only single and sentinel are supported."
            );
        }
        return Redisson.create(config);
    }

    @Bean
    public javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration(
        org.mskcc.oncokb.meta.model.application.ApplicationProperties applicationProperties,
        RedissonClient redissonClient
    ) {
        MutableConfiguration<Object, Object> jcacheConfig = new MutableConfiguration<>();
        jcacheConfig.setStatisticsEnabled(true);
        jcacheConfig.setExpiryPolicyFactory(
            CreatedExpiryPolicy.factoryOf(new Duration(TimeUnit.SECONDS, applicationProperties.getRedis().getExpiration()))
        );
        return RedissonConfiguration.fromInstance(redissonClient, jcacheConfig);
    }

    private void createCache(
        javax.cache.CacheManager cm,
        CacheCategory cacheCategory,
        String cacheName,
        javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration,
        CacheNameResolver cacheNameResolver
    ) {
        javax.cache.Cache<Object, Object> cache = cm.getCache(cacheName);
        if (cache == null) {
            cm.createCache(cacheNameResolver.getCacheName(cacheCategory, cacheName), jcacheConfiguration);
        }
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer(
        javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration,
        CacheNameResolver cacheNameResolver
    ) {
        return cm -> {
            createCache(cm, CacheCategory.GENE, CacheKeys.GENES_BY_ENTREZ_GENE_ID, jcacheConfiguration, cacheNameResolver);
            createCache(cm, CacheCategory.GENE, CacheKeys.GENES_BY_HUGO_SYMBOL, jcacheConfiguration, cacheNameResolver);
            createCache(cm, CacheCategory.GENE, CacheKeys.GENE_ALIASES_BY_NAME, jcacheConfiguration, cacheNameResolver);
            createCache(cm, CacheCategory.USER, CacheKeys.USERS_BY_LOGIN_CACHE, jcacheConfiguration, cacheNameResolver);
            createCache(cm, CacheCategory.USER, CacheKeys.USERS_BY_EMAIL_CACHE, jcacheConfiguration, cacheNameResolver);
            createCache(
                cm,
                CacheCategory.TRANSCRIPT,
                CacheKeys.TRANSCRIPTS_BY_ENSEMBL_TRANSCRIPT_IDS,
                jcacheConfiguration,
                cacheNameResolver
            );
            createCache(
                cm,
                CacheCategory.TRANSCRIPT,
                CacheKeys.TRANSCRIPTS_BY_ENSEMBL_GENE_CANONICAL,
                jcacheConfiguration,
                cacheNameResolver
            );
            createCache(cm, CacheCategory.SEQUENCE, CacheKeys.SEQUENCE_BY_TRASCRIPT_AND_TYPE, jcacheConfiguration, cacheNameResolver);
        };
    }

    @Bean
    public CacheResolver geneCacheResolver(
        CacheManager cm,
        ApplicationProperties applicationProperties,
        CacheNameResolver cacheNameResolver
    ) {
        return new GeneCacheResolver(cm, applicationProperties, cacheNameResolver);
    }

    @Bean
    public CacheResolver userCacheResolver(
        CacheManager cm,
        ApplicationProperties applicationProperties,
        CacheNameResolver cacheNameResolver
    ) {
        return new UserCacheResolver(cm, applicationProperties, cacheNameResolver);
    }

    @Bean
    public CacheResolver transcriptCacheResolver(
        CacheManager cm,
        ApplicationProperties applicationProperties,
        CacheNameResolver cacheNameResolver
    ) {
        return new TranscriptCacheResolver(cm, applicationProperties, cacheNameResolver);
    }

    @Bean
    public CacheResolver sequenceCacheResolver(
        CacheManager cm,
        ApplicationProperties applicationProperties,
        CacheNameResolver cacheNameResolver
    ) {
        return new SequenceCacheResolver(cm, applicationProperties, cacheNameResolver);
    }

    @Autowired(required = false)
    public void setGitProperties(GitProperties gitProperties) {
        this.gitProperties = gitProperties;
    }

    @Autowired(required = false)
    public void setBuildProperties(BuildProperties buildProperties) {
        this.buildProperties = buildProperties;
    }

    @Bean
    public KeyGenerator keyGenerator() {
        return new PrefixedKeyGenerator(this.gitProperties, this.buildProperties);
    }

    @Override
    public CacheErrorHandler errorHandler() {
        return new LoggingCacheErrorHandler();
    }
}
