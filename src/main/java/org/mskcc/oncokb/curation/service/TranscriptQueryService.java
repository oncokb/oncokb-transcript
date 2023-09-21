package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.Transcript;
import org.mskcc.oncokb.curation.repository.TranscriptRepository;
import org.mskcc.oncokb.curation.service.criteria.EnsemblGeneCriteria;
import org.mskcc.oncokb.curation.service.criteria.TranscriptCriteria;
import org.mskcc.oncokb.curation.service.dto.TranscriptDTO;
import org.mskcc.oncokb.curation.service.mapper.TranscriptMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;
import tech.jhipster.service.filter.IntegerFilter;
import tech.jhipster.service.filter.StringFilter;

/**
 * Service for executing complex queries for {@link Transcript} entities in the database.
 * The main input is a {@link TranscriptCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link TranscriptDTO} or a {@link Page} of {@link TranscriptDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class TranscriptQueryService extends QueryService<Transcript> {

    private final Logger log = LoggerFactory.getLogger(TranscriptQueryService.class);

    private final TranscriptRepository transcriptRepository;

    private final TranscriptMapper transcriptMapper;

    public TranscriptQueryService(TranscriptRepository transcriptRepository, TranscriptMapper transcriptMapper) {
        this.transcriptRepository = transcriptRepository;
        this.transcriptMapper = transcriptMapper;
    }

    /**
     * Return a {@link List} of {@link TranscriptDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<TranscriptDTO> findByCriteria(TranscriptCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<Transcript> specification = createSpecification(criteria);
        return transcriptMapper.toDto(transcriptRepository.findAll(specification));
    }

    /**
     * Return a {@link Page} of {@link TranscriptDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<TranscriptDTO> findByCriteria(TranscriptCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Transcript> specification = createSpecification(criteria);
        return transcriptRepository.findAll(specification, page).map(transcriptMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<TranscriptDTO> findBySearchQuery(String query, Pageable page) {
        TranscriptCriteria criteria = new TranscriptCriteria();
        StringFilter stringFilter = new StringFilter();
        stringFilter.setContains(query);
        criteria.setEnsemblTranscriptId(stringFilter);
        criteria.setEnsemblProteinId(stringFilter);
        return findByCriteria(criteria, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(TranscriptCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<Transcript> specification = createSpecification(criteria);
        return transcriptRepository.count(specification);
    }

    /**
     * Function to convert {@link TranscriptCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Transcript> createSpecification(TranscriptCriteria criteria) {
        Specification<Transcript> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), Transcript_.id));
            }
            if (criteria.getEnsemblTranscriptId() != null) {
                specification =
                    specification.or(buildStringSpecification(criteria.getEnsemblTranscriptId(), Transcript_.ensemblTranscriptId));
            }
            if (criteria.getCanonical() != null) {
                specification = specification.or(buildSpecification(criteria.getCanonical(), Transcript_.canonical));
            }
            if (criteria.getEnsemblProteinId() != null) {
                specification = specification.or(buildStringSpecification(criteria.getEnsemblProteinId(), Transcript_.ensemblProteinId));
            }
            if (criteria.getReferenceSequenceId() != null) {
                specification =
                    specification.or(buildStringSpecification(criteria.getReferenceSequenceId(), Transcript_.referenceSequenceId));
            }
            if (criteria.getDescription() != null) {
                specification = specification.or(buildStringSpecification(criteria.getDescription(), Transcript_.description));
            }
            if (criteria.getFragmentsId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getFragmentsId(),
                            root -> root.join(Transcript_.fragments, JoinType.LEFT).get(GenomeFragment_.id)
                        )
                    );
            }
            if (criteria.getSequenceId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getSequenceId(),
                            root -> root.join(Transcript_.sequences, JoinType.LEFT).get(Sequence_.id)
                        )
                    );
            }
            if (criteria.getFlagId() != null) {
                specification =
                    specification.or(
                        buildSpecification(criteria.getFlagId(), root -> root.join(Transcript_.flags, JoinType.LEFT).get(Flag_.id))
                    );
            }
            if (criteria.getEnsemblGeneId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getEnsemblGeneId(),
                            root -> root.join(Transcript_.ensemblGene, JoinType.LEFT).get(EnsemblGene_.id)
                        )
                    );
            }
        }
        return specification;
    }
}
