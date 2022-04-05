package org.mskcc.oncokb.curation.service;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.mskcc.oncokb.curation.domain.GenomeFragment;
import org.mskcc.oncokb.curation.repository.GenomeFragmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link GenomeFragment}.
 */
@Service
@Transactional
public class GenomeFragmentService {

    private final Logger log = LoggerFactory.getLogger(GenomeFragmentService.class);

    private final GenomeFragmentRepository genomeFragmentRepository;

    public GenomeFragmentService(GenomeFragmentRepository genomeFragmentRepository) {
        this.genomeFragmentRepository = genomeFragmentRepository;
    }

    /**
     * Save a genomeFragment.
     *
     * @param genomeFragment the entity to save.
     * @return the persisted entity.
     */
    public GenomeFragment save(GenomeFragment genomeFragment) {
        log.debug("Request to save GenomeFragment : {}", genomeFragment);
        return genomeFragmentRepository.save(genomeFragment);
    }

    public List<GenomeFragment> saveAll(Collection<GenomeFragment> genomeFragments) {
        log.debug("Request to save GenomeFragments : {}", genomeFragments);
        return genomeFragmentRepository.saveAll(genomeFragments);
    }

    /**
     * Partially update a genomeFragment.
     *
     * @param genomeFragment the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<GenomeFragment> partialUpdate(GenomeFragment genomeFragment) {
        log.debug("Request to partially update GenomeFragment : {}", genomeFragment);

        return genomeFragmentRepository
            .findById(genomeFragment.getId())
            .map(existingGenomeFragment -> {
                if (genomeFragment.getChromosome() != null) {
                    existingGenomeFragment.setChromosome(genomeFragment.getChromosome());
                }
                if (genomeFragment.getStart() != null) {
                    existingGenomeFragment.setStart(genomeFragment.getStart());
                }
                if (genomeFragment.getEnd() != null) {
                    existingGenomeFragment.setEnd(genomeFragment.getEnd());
                }
                if (genomeFragment.getStrand() != null) {
                    existingGenomeFragment.setStrand(genomeFragment.getStrand());
                }
                if (genomeFragment.getType() != null) {
                    existingGenomeFragment.setType(genomeFragment.getType());
                }

                return existingGenomeFragment;
            })
            .map(genomeFragmentRepository::save);
    }

    /**
     * Get all the genomeFragments.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<GenomeFragment> findAll(Pageable pageable) {
        log.debug("Request to get all GenomeFragments");
        return genomeFragmentRepository.findAll(pageable);
    }

    /**
     * Get one genomeFragment by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<GenomeFragment> findOne(Long id) {
        log.debug("Request to get GenomeFragment : {}", id);
        return genomeFragmentRepository.findById(id);
    }

    /**
     * Delete the genomeFragment by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete GenomeFragment : {}", id);
        genomeFragmentRepository.deleteById(id);
    }

    /**
     * Delete all passed genomeFragments
     * @param genomeFragmentList
     */
    public void deleteAll(List<GenomeFragment> genomeFragmentList) {
        log.debug("Request to delete GenomeFragments : {}", genomeFragmentList.stream().map(GenomeFragment::getId));
        genomeFragmentRepository.deleteAll(genomeFragmentList);
    }

    /**
     * Get all genomeFragments by giving a transcript ID
     * @param transcriptId Transcript ID
     * @return a list of genomeFragments that associate with the transcriptId
     */
    public List<GenomeFragment> findAllByTranscriptId(Long transcriptId) {
        return genomeFragmentRepository.findAllByTranscriptId(transcriptId);
    }
}
