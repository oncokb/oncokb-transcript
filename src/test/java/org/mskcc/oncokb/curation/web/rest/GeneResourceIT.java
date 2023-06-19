package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.curation.IntegrationTest;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.GeneAlias;
import org.mskcc.oncokb.curation.repository.GeneRepository;
import org.mskcc.oncokb.curation.service.criteria.GeneCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link GeneResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class GeneResourceIT {

    private static final Integer DEFAULT_ENTREZ_GENE_ID = 1;
    private static final Integer UPDATED_ENTREZ_GENE_ID = 2;
    private static final Integer SMALLER_ENTREZ_GENE_ID = 1 - 1;

    private static final String DEFAULT_HUGO_SYMBOL = "AAAAAAAAAA";
    private static final String UPDATED_HUGO_SYMBOL = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/genes";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private GeneRepository geneRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restGeneMockMvc;

    private Gene gene;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Gene createEntity(EntityManager em) {
        Gene gene = new Gene().entrezGeneId(DEFAULT_ENTREZ_GENE_ID).hugoSymbol(DEFAULT_HUGO_SYMBOL);
        return gene;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Gene createUpdatedEntity(EntityManager em) {
        Gene gene = new Gene().entrezGeneId(UPDATED_ENTREZ_GENE_ID).hugoSymbol(UPDATED_HUGO_SYMBOL);
        return gene;
    }

    @BeforeEach
    public void initTest() {
        gene = createEntity(em);
    }

    @Test
    @Transactional
    void createGene() throws Exception {
        int databaseSizeBeforeCreate = geneRepository.findAll().size();
        // Create the Gene
        restGeneMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(gene))
            )
            .andExpect(status().isCreated());

        // Validate the Gene in the database
        List<Gene> geneList = geneRepository.findAll();
        assertThat(geneList).hasSize(databaseSizeBeforeCreate + 1);
        Gene testGene = geneList.get(geneList.size() - 1);
        assertThat(testGene.getEntrezGeneId()).isEqualTo(DEFAULT_ENTREZ_GENE_ID);
        assertThat(testGene.getHugoSymbol()).isEqualTo(DEFAULT_HUGO_SYMBOL);
    }

    @Test
    @Transactional
    void createGeneWithExistingId() throws Exception {
        // Create the Gene with an existing ID
        gene.setId(1L);

        int databaseSizeBeforeCreate = geneRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restGeneMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(gene))
            )
            .andExpect(status().isBadRequest());

        // Validate the Gene in the database
        List<Gene> geneList = geneRepository.findAll();
        assertThat(geneList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllGenes() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList
        restGeneMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(gene.getId().intValue())))
            .andExpect(jsonPath("$.[*].entrezGeneId").value(hasItem(DEFAULT_ENTREZ_GENE_ID)))
            .andExpect(jsonPath("$.[*].hugoSymbol").value(hasItem(DEFAULT_HUGO_SYMBOL)));
    }

    @Test
    @Transactional
    void getGene() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get the gene
        restGeneMockMvc
            .perform(get(ENTITY_API_URL_ID, gene.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(gene.getId().intValue()))
            .andExpect(jsonPath("$.entrezGeneId").value(DEFAULT_ENTREZ_GENE_ID))
            .andExpect(jsonPath("$.hugoSymbol").value(DEFAULT_HUGO_SYMBOL));
    }

    @Test
    @Transactional
    void getGenesByIdFiltering() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        Long id = gene.getId();

        defaultGeneShouldBeFound("id.equals=" + id);
        defaultGeneShouldNotBeFound("id.notEquals=" + id);

        defaultGeneShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultGeneShouldNotBeFound("id.greaterThan=" + id);

        defaultGeneShouldBeFound("id.lessThanOrEqual=" + id);
        defaultGeneShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllGenesByEntrezGeneIdIsEqualToSomething() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList where entrezGeneId equals to DEFAULT_ENTREZ_GENE_ID
        defaultGeneShouldBeFound("entrezGeneId.equals=" + DEFAULT_ENTREZ_GENE_ID);

        // Get all the geneList where entrezGeneId equals to UPDATED_ENTREZ_GENE_ID
        defaultGeneShouldNotBeFound("entrezGeneId.equals=" + UPDATED_ENTREZ_GENE_ID);
    }

    @Test
    @Transactional
    void getAllGenesByEntrezGeneIdIsNotEqualToSomething() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList where entrezGeneId not equals to DEFAULT_ENTREZ_GENE_ID
        defaultGeneShouldNotBeFound("entrezGeneId.notEquals=" + DEFAULT_ENTREZ_GENE_ID);

        // Get all the geneList where entrezGeneId not equals to UPDATED_ENTREZ_GENE_ID
        defaultGeneShouldBeFound("entrezGeneId.notEquals=" + UPDATED_ENTREZ_GENE_ID);
    }

    @Test
    @Transactional
    void getAllGenesByEntrezGeneIdIsInShouldWork() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList where entrezGeneId in DEFAULT_ENTREZ_GENE_ID or UPDATED_ENTREZ_GENE_ID
        defaultGeneShouldBeFound("entrezGeneId.in=" + DEFAULT_ENTREZ_GENE_ID + "," + UPDATED_ENTREZ_GENE_ID);

        // Get all the geneList where entrezGeneId equals to UPDATED_ENTREZ_GENE_ID
        defaultGeneShouldNotBeFound("entrezGeneId.in=" + UPDATED_ENTREZ_GENE_ID);
    }

    @Test
    @Transactional
    void getAllGenesByEntrezGeneIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList where entrezGeneId is not null
        defaultGeneShouldBeFound("entrezGeneId.specified=true");

        // Get all the geneList where entrezGeneId is null
        defaultGeneShouldNotBeFound("entrezGeneId.specified=false");
    }

    @Test
    @Transactional
    void getAllGenesByEntrezGeneIdIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList where entrezGeneId is greater than or equal to DEFAULT_ENTREZ_GENE_ID
        defaultGeneShouldBeFound("entrezGeneId.greaterThanOrEqual=" + DEFAULT_ENTREZ_GENE_ID);

        // Get all the geneList where entrezGeneId is greater than or equal to UPDATED_ENTREZ_GENE_ID
        defaultGeneShouldNotBeFound("entrezGeneId.greaterThanOrEqual=" + UPDATED_ENTREZ_GENE_ID);
    }

    @Test
    @Transactional
    void getAllGenesByEntrezGeneIdIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList where entrezGeneId is less than or equal to DEFAULT_ENTREZ_GENE_ID
        defaultGeneShouldBeFound("entrezGeneId.lessThanOrEqual=" + DEFAULT_ENTREZ_GENE_ID);

        // Get all the geneList where entrezGeneId is less than or equal to SMALLER_ENTREZ_GENE_ID
        defaultGeneShouldNotBeFound("entrezGeneId.lessThanOrEqual=" + SMALLER_ENTREZ_GENE_ID);
    }

    @Test
    @Transactional
    void getAllGenesByEntrezGeneIdIsLessThanSomething() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList where entrezGeneId is less than DEFAULT_ENTREZ_GENE_ID
        defaultGeneShouldNotBeFound("entrezGeneId.lessThan=" + DEFAULT_ENTREZ_GENE_ID);

        // Get all the geneList where entrezGeneId is less than UPDATED_ENTREZ_GENE_ID
        defaultGeneShouldBeFound("entrezGeneId.lessThan=" + UPDATED_ENTREZ_GENE_ID);
    }

    @Test
    @Transactional
    void getAllGenesByEntrezGeneIdIsGreaterThanSomething() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList where entrezGeneId is greater than DEFAULT_ENTREZ_GENE_ID
        defaultGeneShouldNotBeFound("entrezGeneId.greaterThan=" + DEFAULT_ENTREZ_GENE_ID);

        // Get all the geneList where entrezGeneId is greater than SMALLER_ENTREZ_GENE_ID
        defaultGeneShouldBeFound("entrezGeneId.greaterThan=" + SMALLER_ENTREZ_GENE_ID);
    }

    @Test
    @Transactional
    void getAllGenesByHugoSymbolIsEqualToSomething() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList where hugoSymbol equals to DEFAULT_HUGO_SYMBOL
        defaultGeneShouldBeFound("hugoSymbol.equals=" + DEFAULT_HUGO_SYMBOL);

        // Get all the geneList where hugoSymbol equals to UPDATED_HUGO_SYMBOL
        defaultGeneShouldNotBeFound("hugoSymbol.equals=" + UPDATED_HUGO_SYMBOL);
    }

    @Test
    @Transactional
    void getAllGenesByHugoSymbolIsNotEqualToSomething() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList where hugoSymbol not equals to DEFAULT_HUGO_SYMBOL
        defaultGeneShouldNotBeFound("hugoSymbol.notEquals=" + DEFAULT_HUGO_SYMBOL);

        // Get all the geneList where hugoSymbol not equals to UPDATED_HUGO_SYMBOL
        defaultGeneShouldBeFound("hugoSymbol.notEquals=" + UPDATED_HUGO_SYMBOL);
    }

    @Test
    @Transactional
    void getAllGenesByHugoSymbolIsInShouldWork() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList where hugoSymbol in DEFAULT_HUGO_SYMBOL or UPDATED_HUGO_SYMBOL
        defaultGeneShouldBeFound("hugoSymbol.in=" + DEFAULT_HUGO_SYMBOL + "," + UPDATED_HUGO_SYMBOL);

        // Get all the geneList where hugoSymbol equals to UPDATED_HUGO_SYMBOL
        defaultGeneShouldNotBeFound("hugoSymbol.in=" + UPDATED_HUGO_SYMBOL);
    }

    @Test
    @Transactional
    void getAllGenesByHugoSymbolIsNullOrNotNull() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList where hugoSymbol is not null
        defaultGeneShouldBeFound("hugoSymbol.specified=true");

        // Get all the geneList where hugoSymbol is null
        defaultGeneShouldNotBeFound("hugoSymbol.specified=false");
    }

    @Test
    @Transactional
    void getAllGenesByHugoSymbolContainsSomething() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList where hugoSymbol contains DEFAULT_HUGO_SYMBOL
        defaultGeneShouldBeFound("hugoSymbol.contains=" + DEFAULT_HUGO_SYMBOL);

        // Get all the geneList where hugoSymbol contains UPDATED_HUGO_SYMBOL
        defaultGeneShouldNotBeFound("hugoSymbol.contains=" + UPDATED_HUGO_SYMBOL);
    }

    @Test
    @Transactional
    void getAllGenesByHugoSymbolNotContainsSomething() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        // Get all the geneList where hugoSymbol does not contain DEFAULT_HUGO_SYMBOL
        defaultGeneShouldNotBeFound("hugoSymbol.doesNotContain=" + DEFAULT_HUGO_SYMBOL);

        // Get all the geneList where hugoSymbol does not contain UPDATED_HUGO_SYMBOL
        defaultGeneShouldBeFound("hugoSymbol.doesNotContain=" + UPDATED_HUGO_SYMBOL);
    }

    @Test
    @Transactional
    void getAllGenesByGeneAliasIsEqualToSomething() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);
        GeneAlias geneAlias;
        if (TestUtil.findAll(em, GeneAlias.class).isEmpty()) {
            geneAlias = GeneAliasResourceIT.createEntity(em);
            em.persist(geneAlias);
            em.flush();
        } else {
            geneAlias = TestUtil.findAll(em, GeneAlias.class).get(0);
        }
        em.persist(geneAlias);
        em.flush();
        gene.addGeneAlias(geneAlias);
        geneRepository.saveAndFlush(gene);
        Long geneAliasId = geneAlias.getId();

        // Get all the geneList where geneAlias equals to geneAliasId
        defaultGeneShouldBeFound("geneAliasId.equals=" + geneAliasId);

        // Get all the geneList where geneAlias equals to (geneAliasId + 1)
        defaultGeneShouldNotBeFound("geneAliasId.equals=" + (geneAliasId + 1));
    }

    @Test
    @Transactional
    void getAllGenesByEnsemblGeneIsEqualToSomething() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);
        EnsemblGene ensemblGene;
        if (TestUtil.findAll(em, EnsemblGene.class).isEmpty()) {
            ensemblGene = EnsemblGeneResourceIT.createEntity(em);
            em.persist(ensemblGene);
            em.flush();
        } else {
            ensemblGene = TestUtil.findAll(em, EnsemblGene.class).get(0);
        }
        em.persist(ensemblGene);
        em.flush();
        gene.addEnsemblGene(ensemblGene);
        geneRepository.saveAndFlush(gene);
        Long ensemblGeneId = ensemblGene.getId();

        // Get all the geneList where ensemblGene equals to ensemblGeneId
        defaultGeneShouldBeFound("ensemblGeneId.equals=" + ensemblGeneId);

        // Get all the geneList where ensemblGene equals to (ensemblGeneId + 1)
        defaultGeneShouldNotBeFound("ensemblGeneId.equals=" + (ensemblGeneId + 1));
    }

    @Test
    @Transactional
    void getAllGenesByAlterationIsEqualToSomething() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);
        Alteration alteration;
        if (TestUtil.findAll(em, Alteration.class).isEmpty()) {
            alteration = AlterationResourceIT.createEntity(em);
            em.persist(alteration);
            em.flush();
        } else {
            alteration = TestUtil.findAll(em, Alteration.class).get(0);
        }
        em.persist(alteration);
        em.flush();
        gene.addAlteration(alteration);
        geneRepository.saveAndFlush(gene);
        Long alterationId = alteration.getId();

        // Get all the geneList where alteration equals to alterationId
        defaultGeneShouldBeFound("alterationId.equals=" + alterationId);

        // Get all the geneList where alteration equals to (alterationId + 1)
        defaultGeneShouldNotBeFound("alterationId.equals=" + (alterationId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultGeneShouldBeFound(String filter) throws Exception {
        restGeneMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(gene.getId().intValue())))
            .andExpect(jsonPath("$.[*].entrezGeneId").value(hasItem(DEFAULT_ENTREZ_GENE_ID)))
            .andExpect(jsonPath("$.[*].hugoSymbol").value(hasItem(DEFAULT_HUGO_SYMBOL)));

        // Check, that the count call also returns 1
        restGeneMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultGeneShouldNotBeFound(String filter) throws Exception {
        restGeneMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restGeneMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingGene() throws Exception {
        // Get the gene
        restGeneMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewGene() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        int databaseSizeBeforeUpdate = geneRepository.findAll().size();

        // Update the gene
        Gene updatedGene = geneRepository.findById(gene.getId()).get();
        // Disconnect from session so that the updates on updatedGene are not directly saved in db
        em.detach(updatedGene);
        updatedGene.entrezGeneId(UPDATED_ENTREZ_GENE_ID).hugoSymbol(UPDATED_HUGO_SYMBOL);

        restGeneMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedGene.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedGene))
            )
            .andExpect(status().isOk());

        // Validate the Gene in the database
        List<Gene> geneList = geneRepository.findAll();
        assertThat(geneList).hasSize(databaseSizeBeforeUpdate);
        Gene testGene = geneList.get(geneList.size() - 1);
        assertThat(testGene.getEntrezGeneId()).isEqualTo(UPDATED_ENTREZ_GENE_ID);
        assertThat(testGene.getHugoSymbol()).isEqualTo(UPDATED_HUGO_SYMBOL);
    }

    @Test
    @Transactional
    void putNonExistingGene() throws Exception {
        int databaseSizeBeforeUpdate = geneRepository.findAll().size();
        gene.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGeneMockMvc
            .perform(
                put(ENTITY_API_URL_ID, gene.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(gene))
            )
            .andExpect(status().isBadRequest());

        // Validate the Gene in the database
        List<Gene> geneList = geneRepository.findAll();
        assertThat(geneList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchGene() throws Exception {
        int databaseSizeBeforeUpdate = geneRepository.findAll().size();
        gene.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGeneMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(gene))
            )
            .andExpect(status().isBadRequest());

        // Validate the Gene in the database
        List<Gene> geneList = geneRepository.findAll();
        assertThat(geneList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamGene() throws Exception {
        int databaseSizeBeforeUpdate = geneRepository.findAll().size();
        gene.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGeneMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(gene))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Gene in the database
        List<Gene> geneList = geneRepository.findAll();
        assertThat(geneList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateGeneWithPatch() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        int databaseSizeBeforeUpdate = geneRepository.findAll().size();

        // Update the gene using partial update
        Gene partialUpdatedGene = new Gene();
        partialUpdatedGene.setId(gene.getId());

        partialUpdatedGene.entrezGeneId(UPDATED_ENTREZ_GENE_ID);

        restGeneMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGene.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedGene))
            )
            .andExpect(status().isOk());

        // Validate the Gene in the database
        List<Gene> geneList = geneRepository.findAll();
        assertThat(geneList).hasSize(databaseSizeBeforeUpdate);
        Gene testGene = geneList.get(geneList.size() - 1);
        assertThat(testGene.getEntrezGeneId()).isEqualTo(UPDATED_ENTREZ_GENE_ID);
        assertThat(testGene.getHugoSymbol()).isEqualTo(DEFAULT_HUGO_SYMBOL);
    }

    @Test
    @Transactional
    void fullUpdateGeneWithPatch() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        int databaseSizeBeforeUpdate = geneRepository.findAll().size();

        // Update the gene using partial update
        Gene partialUpdatedGene = new Gene();
        partialUpdatedGene.setId(gene.getId());

        partialUpdatedGene.entrezGeneId(UPDATED_ENTREZ_GENE_ID).hugoSymbol(UPDATED_HUGO_SYMBOL);

        restGeneMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGene.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedGene))
            )
            .andExpect(status().isOk());

        // Validate the Gene in the database
        List<Gene> geneList = geneRepository.findAll();
        assertThat(geneList).hasSize(databaseSizeBeforeUpdate);
        Gene testGene = geneList.get(geneList.size() - 1);
        assertThat(testGene.getEntrezGeneId()).isEqualTo(UPDATED_ENTREZ_GENE_ID);
        assertThat(testGene.getHugoSymbol()).isEqualTo(UPDATED_HUGO_SYMBOL);
    }

    @Test
    @Transactional
    void patchNonExistingGene() throws Exception {
        int databaseSizeBeforeUpdate = geneRepository.findAll().size();
        gene.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGeneMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, gene.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(gene))
            )
            .andExpect(status().isBadRequest());

        // Validate the Gene in the database
        List<Gene> geneList = geneRepository.findAll();
        assertThat(geneList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchGene() throws Exception {
        int databaseSizeBeforeUpdate = geneRepository.findAll().size();
        gene.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGeneMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(gene))
            )
            .andExpect(status().isBadRequest());

        // Validate the Gene in the database
        List<Gene> geneList = geneRepository.findAll();
        assertThat(geneList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamGene() throws Exception {
        int databaseSizeBeforeUpdate = geneRepository.findAll().size();
        gene.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGeneMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(gene))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Gene in the database
        List<Gene> geneList = geneRepository.findAll();
        assertThat(geneList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteGene() throws Exception {
        // Initialize the database
        geneRepository.saveAndFlush(gene);

        int databaseSizeBeforeDelete = geneRepository.findAll().size();

        // Delete the gene
        restGeneMockMvc
            .perform(delete(ENTITY_API_URL_ID, gene.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Gene> geneList = geneRepository.findAll();
        assertThat(geneList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
