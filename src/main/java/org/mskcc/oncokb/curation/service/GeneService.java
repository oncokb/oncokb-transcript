package org.mskcc.oncokb.curation.service;

import static org.mskcc.oncokb.curation.util.FileUtils.readTrimmedLinesStream;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.config.cache.CacheCategory;
import org.mskcc.oncokb.curation.config.cache.CacheNameResolver;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.GeneAlias;
import org.mskcc.oncokb.curation.domain.enumeration.InfoType;
import org.mskcc.oncokb.curation.repository.GeneAliasRepository;
import org.mskcc.oncokb.curation.repository.GeneRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Gene}.
 */
@Service
@Transactional
public class GeneService {

    private final Logger log = LoggerFactory.getLogger(GeneService.class);

    private final GeneRepository geneRepository;
    private final GeneAliasRepository geneAliasRepository;
    private final InfoService infoService;
    private final CacheNameResolver cacheNameResolver;
    private final Optional<CacheManager> optionalCacheManager;

    public GeneService(
        GeneRepository geneRepository,
        GeneAliasRepository geneAliasRepository,
        InfoService infoService,
        CacheNameResolver cacheNameResolver,
        Optional<CacheManager> optionalCacheManager
    ) {
        this.geneRepository = geneRepository;
        this.geneAliasRepository = geneAliasRepository;
        this.infoService = infoService;
        this.cacheNameResolver = cacheNameResolver;
        this.optionalCacheManager = optionalCacheManager;
    }

    /**
     * Save a gene.
     *
     * @param gene the entity to save.
     * @return the persisted entity.
     */
    public Gene save(Gene gene) {
        log.debug("Request to save Gene : {}", gene);
        Gene result = geneRepository.save(gene);
        return result;
    }

    /**
     * Partially update a gene.
     *
     * @param gene the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<Gene> partialUpdate(Gene gene) {
        log.debug("Request to partially update Gene : {}", gene);

        return geneRepository
            .findById(gene.getId())
            .map(existingGene -> {
                if (gene.getEntrezGeneId() != null) {
                    existingGene.setEntrezGeneId(gene.getEntrezGeneId());
                }
                if (gene.getHugoSymbol() != null) {
                    existingGene.setHugoSymbol(gene.getHugoSymbol());
                }
                if (gene.getFlags() != null) {
                    existingGene.getFlags().clear();
                    existingGene.getFlags().addAll(gene.getFlags());
                }

                return existingGene;
            })
            .map(geneRepository::save);
    }

    /**
     * Get all the gene ids
     *
     * @param pageable the pagination information.
     * @return the list of ids.
     */
    @Transactional(readOnly = true)
    public Page<Long> findAllGeneIds(Pageable pageable) {
        log.debug("Request to get all Genes");
        return geneRepository.findAllGeneIds(pageable);
    }

    /**
     * Get all the genes by ids
     *
     * @param geneIds a list of gene ids for query.
     * @return the list of genes.
     */
    @Transactional(readOnly = true)
    public List<Gene> findAllByIdInWithGeneAliasAndEnsemblGenes(List<Long> geneIds) {
        log.debug("Request to get all Genes");
        return geneRepository.findAllByIdInWithGeneAliasAndEnsemblGenes(geneIds);
    }

    /**
     * Get all the genes with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<Gene> findAllWithEagerRelationships(Pageable pageable) {
        return geneRepository.findAllWithEagerRelationships(pageable);
    }

    /**
     * Get one gene by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<Gene> findOne(Long id) {
        log.debug("Request to get Gene : {}", id);
        return geneRepository.findById(id);
    }

    /**
     * Delete the gene by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Gene : {}", id);
        geneRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Gene> findGeneByEntrezGeneId(Integer entrezGeneId) {
        return geneRepository.findByEntrezGeneId(entrezGeneId);
    }

    @Transactional(readOnly = true)
    public Optional<Gene> findGeneByHugoSymbol(String hugoSymbol) {
        return geneRepository.findByHugoSymbol(hugoSymbol.toLowerCase());
    }

    @Transactional(readOnly = true)
    public List<Gene> findGeneByHugoSymbolOrGeneAliasesIn(String hugoSymbol) {
        return geneRepository.findGeneByHugoSymbolOrGeneAliasesIn(hugoSymbol);
    }

    @Transactional(readOnly = true)
    public Optional<Gene> findGeneByAlias(String alias) {
        Optional<GeneAlias> geneAliasOptional = geneAliasRepository.findByName(alias.toLowerCase());
        if (geneAliasOptional.isPresent()) {
            return Optional.of(geneAliasOptional.get().getGene());
        } else {
            return Optional.empty();
        }
    }

    private void clearGeneCaches() {
        if (this.optionalCacheManager.isPresent()) {
            for (String cacheKey : this.optionalCacheManager.get().getCacheNames()) {
                String cacheKeyPrefix = this.cacheNameResolver.getCacheName(CacheCategory.GENE, "");
                if (cacheKey.startsWith(cacheKeyPrefix)) {
                    Objects.requireNonNull(this.optionalCacheManager.get().getCache(cacheKey)).clear();
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Gene> findByHugoSymbolIn(Set<String> searchValues) {
        log.debug("Request to search for a list of genes by list of search values");
        return geneRepository.findByHugoSymbolInIgnoreCase(searchValues.stream().collect(Collectors.toList()));
    }
}
