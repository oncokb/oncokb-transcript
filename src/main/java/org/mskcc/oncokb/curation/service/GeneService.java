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

    private final String PORTAL_GENE_FILE =
        "https://raw.githubusercontent.com/cBioPortal/datahub-study-curation-tools/master/gene-table-update/build-input-for-importer/gene_info.txt";
    private final String SYNONYM_SEPARATOR = "\\|";

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

                return existingGene;
            })
            .map(geneRepository::save);
    }

    /**
     * Get all the genes.
     * We do not use the default find all is because the FetchType.EAGER in the gene model.
     * The default will trigger a lot of queries to the database.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<Gene> findAll(Pageable pageable) {
        log.debug("Request to get all Genes");
        return geneRepository.findAllWithGeneAliasAndEnsemblGenes(pageable);
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

    public Optional<Gene> findGeneByEntrezGeneId(Integer entrezGeneId) {
        return geneRepository.findByEntrezGeneId(entrezGeneId);
    }

    public Optional<Gene> findGeneByHugoSymbol(String hugoSymbol) {
        return geneRepository.findByHugoSymbol(hugoSymbol.toLowerCase());
    }

    public Optional<Gene> findGeneByAlias(String alias) {
        Optional<GeneAlias> geneAliasOptional = geneAliasRepository.findByName(alias.toLowerCase());
        if (geneAliasOptional.isPresent()) {
            return Optional.of(geneAliasOptional.get().getGene());
        } else {
            return Optional.empty();
        }
    }

    public void updatePortalGenes() throws IOException {
        List<String[]> portalGenes = getPortalGenes()
            .stream()
            .filter(gene -> gene[1].equalsIgnoreCase("BRAF"))
            .collect(Collectors.toList());
        for (var i = 0; i < portalGenes.size(); i++) {
            String[] line = portalGenes.get(i);
            Integer entrezGeneId = Integer.parseInt(line[0]);

            Gene gene = new Gene();
            gene.setEntrezGeneId(entrezGeneId);
            gene.setHugoSymbol(line[1]);
            if (line.length > 5) {
                gene.setGeneAliases(
                    Arrays
                        .stream(line[5].split(SYNONYM_SEPARATOR))
                        .filter(synonym -> StringUtils.isNotEmpty(synonym.trim()))
                        .map(synonym -> {
                            GeneAlias geneAlias = new GeneAlias();
                            geneAlias.setName(synonym.trim());
                            return geneAlias;
                        })
                        .collect(Collectors.toSet())
                );
            }

            Optional<Gene> geneOptional = this.findGeneByEntrezGeneId(entrezGeneId);
            if (geneOptional.isPresent()) {
                geneRepository.delete(geneOptional.get());
            }
            this.geneRepository.save(gene);
            this.clearGeneCaches();
            if (i % 1000 == 0) {
                System.out.println(i);
            }
        }

        this.infoService.updateInfo(InfoType.GENE_LAST_UPDATED, null, Instant.now());
    }

    private List<String[]> getPortalGenes() throws IOException {
        URL url = new URL(PORTAL_GENE_FILE);
        InputStream is = url.openStream();
        List<String> readmeFileLines = readTrimmedLinesStream(is);

        return readmeFileLines
            .stream()
            .map(line -> line.split("\t"))
            .filter(line -> {
                // as long as gene has entrez gene id and hugo symbol, we import
                if (line.length >= 2) {
                    return StringUtils.isNumeric(line[0]);
                } else {
                    return false;
                }
            })
            .collect(Collectors.toList());
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
