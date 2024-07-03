package org.mskcc.oncokb.curation.service;

import java.util.List;
import javax.persistence.criteria.JoinType;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.domain.*; // for static metamodels
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.repository.EnsemblGeneRepository;
import org.mskcc.oncokb.curation.service.criteria.EnsemblGeneCriteria;
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
 * Service for executing complex queries for {@link EnsemblGene} entities in the database.
 * The main input is a {@link EnsemblGeneCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {@link EnsemblGene} or a {@link Page} of {@link EnsemblGene} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class EnsemblGeneQueryService extends QueryService<EnsemblGene> {

    private final Logger log = LoggerFactory.getLogger(EnsemblGeneQueryService.class);

    private final EnsemblGeneRepository ensemblGeneRepository;

    public EnsemblGeneQueryService(EnsemblGeneRepository ensemblGeneRepository) {
        this.ensemblGeneRepository = ensemblGeneRepository;
    }

    /**
     * Return a {@link List} of {@link EnsemblGene} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<EnsemblGene> findByCriteria(EnsemblGeneCriteria criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specification<EnsemblGene> specification = createSpecification(criteria);
        return ensemblGeneRepository.findAll(specification);
    }

    /**
     * Return a {@link Page} of {@link EnsemblGene} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<EnsemblGene> findByCriteria(EnsemblGeneCriteria criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<EnsemblGene> specification = createSpecification(criteria);
        return ensemblGeneRepository.findAll(specification, page);
    }

    @Transactional(readOnly = true)
    public Page<EnsemblGene> findBySearchQuery(String query, Pageable page) {
        EnsemblGeneCriteria criteria = new EnsemblGeneCriteria();
        StringFilter stringFilter = new StringFilter();
        stringFilter.setContains(query);
        boolean isNumericQuery = StringUtils.isNumeric(query);
        if (isNumericQuery) {
            int numberQuery = Integer.parseInt(query);
            IntegerFilter integerFilter = new IntegerFilter();
            integerFilter.setEquals(numberQuery);
            criteria.setStart(integerFilter);
            criteria.setEnd(integerFilter);
        }
        criteria.setEnsemblGeneId(stringFilter);
        return findByCriteria(criteria, page);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(EnsemblGeneCriteria criteria) {
        log.debug("count by criteria : {}", criteria);
        final Specification<EnsemblGene> specification = createSpecification(criteria);
        return ensemblGeneRepository.count(specification);
    }

    /**
     * Function to convert {@link EnsemblGeneCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<EnsemblGene> createSpecification(EnsemblGeneCriteria criteria) {
        Specification<EnsemblGene> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            if (criteria.getDistinct() != null) {
                specification = specification.or(distinct(criteria.getDistinct()));
            }
            if (criteria.getId() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getId(), EnsemblGene_.id));
            }
            if (criteria.getReferenceGenome() != null) {
                specification = specification.or(buildSpecification(criteria.getReferenceGenome(), EnsemblGene_.referenceGenome));
            }
            if (criteria.getEnsemblGeneId() != null) {
                specification = specification.or(buildStringSpecification(criteria.getEnsemblGeneId(), EnsemblGene_.ensemblGeneId));
            }
            if (criteria.getCanonical() != null) {
                specification = specification.or(buildSpecification(criteria.getCanonical(), EnsemblGene_.canonical));
            }
            if (criteria.getStart() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getStart(), EnsemblGene_.start));
            }
            if (criteria.getEnd() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getEnd(), EnsemblGene_.end));
            }
            if (criteria.getStrand() != null) {
                specification = specification.or(buildRangeSpecification(criteria.getStrand(), EnsemblGene_.strand));
            }
            if (criteria.getTranscriptId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getTranscriptId(),
                            root -> root.join(EnsemblGene_.transcripts, JoinType.LEFT).get(Transcript_.id)
                        )
                    );
            }
            if (criteria.getGeneId() != null) {
                specification =
                    specification.or(
                        buildSpecification(criteria.getGeneId(), root -> root.join(EnsemblGene_.gene, JoinType.LEFT).get(Gene_.id))
                    );
            }
            if (criteria.getSeqRegionId() != null) {
                specification =
                    specification.or(
                        buildSpecification(
                            criteria.getSeqRegionId(),
                            root -> root.join(EnsemblGene_.seqRegion, JoinType.LEFT).get(SeqRegion_.id)
                        )
                    );
            }
        }
        return specification;
    }
}
