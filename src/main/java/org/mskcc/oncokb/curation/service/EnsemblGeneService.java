package org.mskcc.oncokb.curation.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.genome_nexus.ApiException;
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.repository.EnsemblGeneRepository;
import org.mskcc.oncokb.curation.vm.ensembl.EnsemblTranscript;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link EnsemblGene}.
 */
@Service
@Transactional
public class EnsemblGeneService {

    private final Logger log = LoggerFactory.getLogger(EnsemblGeneService.class);

    private final EnsemblGeneRepository ensemblGeneRepository;
    private final GenomeNexusService genomeNexusService;
    private final TranscriptService transcriptService;
    private final GeneService geneService;

    public EnsemblGeneService(
        EnsemblGeneRepository ensemblGeneRepository,
        GenomeNexusService genomeNexusService,
        TranscriptService transcriptService,
        GeneService geneService
    ) {
        this.ensemblGeneRepository = ensemblGeneRepository;
        this.genomeNexusService = genomeNexusService;
        this.transcriptService = transcriptService;
        this.geneService = geneService;
    }

    /**
     * Save a ensemblGene.
     *
     * @param ensemblGene the entity to save.
     * @return the persisted entity.
     */
    public EnsemblGene save(EnsemblGene ensemblGene) {
        log.debug("Request to save EnsemblGene : {}", ensemblGene);
        return ensemblGeneRepository.save(ensemblGene);
    }

    /**
     * Partially update a ensemblGene.
     *
     * @param ensemblGene the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<EnsemblGene> partialUpdate(EnsemblGene ensemblGene) {
        log.debug("Request to partially update EnsemblGene : {}", ensemblGene);

        return ensemblGeneRepository
            .findById(ensemblGene.getId())
            .map(existingEnsemblGene -> {
                if (ensemblGene.getReferenceGenome() != null) {
                    existingEnsemblGene.setReferenceGenome(ensemblGene.getReferenceGenome());
                }
                if (ensemblGene.getEnsemblGeneId() != null) {
                    existingEnsemblGene.setEnsemblGeneId(ensemblGene.getEnsemblGeneId());
                }
                if (ensemblGene.getCanonical() != null) {
                    existingEnsemblGene.setCanonical(ensemblGene.getCanonical());
                }
                if (ensemblGene.getChromosome() != null) {
                    existingEnsemblGene.setChromosome(ensemblGene.getChromosome());
                }
                if (ensemblGene.getStart() != null) {
                    existingEnsemblGene.setStart(ensemblGene.getStart());
                }
                if (ensemblGene.getEnd() != null) {
                    existingEnsemblGene.setEnd(ensemblGene.getEnd());
                }
                if (ensemblGene.getStrand() != null) {
                    existingEnsemblGene.setStrand(ensemblGene.getStrand());
                }

                return existingEnsemblGene;
            })
            .map(ensemblGeneRepository::save);
    }

    /**
     * Get all the ensemblGenes.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<EnsemblGene> findAll(Pageable pageable) {
        log.debug("Request to get all EnsemblGenes");
        return ensemblGeneRepository.findAll(pageable);
    }

    /**
     * Get one ensemblGene by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<EnsemblGene> findOne(Long id) {
        log.debug("Request to get EnsemblGene : {}", id);
        return ensemblGeneRepository.findById(id);
    }

    public Optional<EnsemblGene> findCanonicalEnsemblGene(Integer entrezGeneId, ReferenceGenome referenceGenome) {
        return ensemblGeneRepository.findCanonicalEnsemblGene(entrezGeneId, referenceGenome);
    }

    /**
     * Get one ensemblGene by ensembl gene id and reference genome
     *
     * @param ensemblGeneId
     * @param referenceGenome
     * @return the entity.
     */
    public Optional<EnsemblGene> findByEnsemblGeneIdAndReferenceGenome(String ensemblGeneId, ReferenceGenome referenceGenome) {
        return ensemblGeneRepository.findByEnsemblGeneIdAndReferenceGenome(ensemblGeneId, referenceGenome);
    }

    public List<EnsemblGene> findAllByGeneAndReferenceGenome(Gene gene, ReferenceGenome referenceGenome) {
        return ensemblGeneRepository.findAllByGeneAndReferenceGenome(gene, referenceGenome);
    }

    public List<EnsemblGene> findAllByReferenceGenomeAndEnsemblGeneIdIn(ReferenceGenome referenceGenome, List<String> ensemblGeneIds) {
        return ensemblGeneRepository.findAllByReferenceGenomeAndEnsemblGeneIdIn(referenceGenome, ensemblGeneIds);
    }

    public List<EnsemblGene> saveByReferenceGenomeAndEntrezGeneIds(ReferenceGenome rg, List<Integer> entrezGeneIds) throws ApiException {
        List<org.genome_nexus.client.EnsemblGene> ensemblGeneFromGN = genomeNexusService.findCanonicalEnsemblGeneTranscript(
            rg,
            entrezGeneIds
        );
        List<String> ensemblGeneIds = ensemblGeneFromGN
            .stream()
            .filter(ensemblGene -> StringUtils.isNotEmpty(ensemblGene.getGeneId()))
            .map(org.genome_nexus.client.EnsemblGene::getGeneId)
            .collect(Collectors.toList());
        List<String> existEnsemblGenes = findAllByReferenceGenomeAndEnsemblGeneIdIn(rg, ensemblGeneIds)
            .stream()
            .map(EnsemblGene::getEnsemblGeneId)
            .collect(Collectors.toList());
        ensemblGeneIds.removeAll(existEnsemblGenes);
        List<EnsemblTranscript> ensemblTranscriptList = transcriptService.getEnsemblTranscriptIds(rg, ensemblGeneIds, false, false);
        List<EnsemblGene> savedEnsemblGenes = new ArrayList<>();
        for (int i = 0; i < ensemblTranscriptList.size(); i++) {
            if (i % 100 == 0) {
                log.info("Processing {} of ensembl genes.", i);
            }
            EnsemblTranscript et = ensemblTranscriptList.get(i);
            Optional<org.genome_nexus.client.EnsemblGene> ensemblGeneGNOptional = ensemblGeneFromGN
                .stream()
                .filter(ensemblGene -> ensemblGene.getGeneId().equals(et.getId()))
                .findFirst();
            if (ensemblGeneGNOptional.isPresent()) {
                String entrezGeneStr = ensemblGeneGNOptional.get().getEntrezGeneId();
                if (StringUtils.isNumeric(entrezGeneStr)) {
                    int entrezGeneId = Integer.parseInt(entrezGeneStr);
                    if (entrezGeneId > 0) {
                        Optional<Gene> savedGeneOptional = geneService.findGeneByEntrezGeneId(entrezGeneId);
                        if (savedGeneOptional.isPresent()) {
                            Optional<EnsemblGene> ensemblGeneOptional = findByEnsemblGeneIdAndReferenceGenome(et.getId(), rg);
                            if (ensemblGeneOptional.isEmpty()) {
                                EnsemblGene ensemblGene = new EnsemblGene();
                                ensemblGene.setCanonical(true);
                                ensemblGene.setReferenceGenome(rg);
                                ensemblGene.setEnsemblGeneId(et.getId());
                                ensemblGene.setStrand(et.getStrand());
                                ensemblGene.setStart(et.getStart());
                                ensemblGene.setEnd(et.getEnd());
                                ensemblGene.setChromosome(et.getSeqRegionName());
                                ensemblGene.setGene(savedGeneOptional.get());
                                EnsemblGene savedEnsemblGene = save(ensemblGene);
                                savedEnsemblGenes.add(savedEnsemblGene);
                            } else {
                                savedEnsemblGenes.add(ensemblGeneOptional.get());
                            }
                        } else {
                            log.error("The entrez gene is not available in DB {}", entrezGeneId);
                        }
                    } else {
                        log.error("The entrez gene is not positive integer {}", entrezGeneId);
                    }
                } else {
                    log.error("The entrez gene is not integer {}", entrezGeneStr);
                }
            }
        }
        return savedEnsemblGenes;
    }

    /**
     * Delete the ensemblGene by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete EnsemblGene : {}", id);
        ensemblGeneRepository.deleteById(id);
    }
}
