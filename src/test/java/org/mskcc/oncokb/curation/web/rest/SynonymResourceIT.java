package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.curation.IntegrationTest;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.domain.CancerType;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.NciThesaurus;
import org.mskcc.oncokb.curation.domain.Synonym;
import org.mskcc.oncokb.curation.repository.SynonymRepository;
import org.mskcc.oncokb.curation.service.criteria.SynonymCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;

/**
 * Integration tests for the {@link SynonymResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class SynonymResourceIT {

    private static final String DEFAULT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_SOURCE = "AAAAAAAAAA";
    private static final String UPDATED_SOURCE = "BBBBBBBBBB";

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_NOTE = "AAAAAAAAAA";
    private static final String UPDATED_NOTE = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/synonyms";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private SynonymRepository synonymRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restSynonymMockMvc;

    private Synonym synonym;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Synonym createEntity(EntityManager em) {
        Synonym synonym = new Synonym().type(DEFAULT_TYPE).source(DEFAULT_SOURCE).code(DEFAULT_CODE).name(DEFAULT_NAME).note(DEFAULT_NOTE);
        return synonym;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Synonym createUpdatedEntity(EntityManager em) {
        Synonym synonym = new Synonym().type(UPDATED_TYPE).source(UPDATED_SOURCE).code(UPDATED_CODE).name(UPDATED_NAME).note(UPDATED_NOTE);
        return synonym;
    }

    @BeforeEach
    public void initTest() {
        synonym = createEntity(em);
    }

    @Test
    @Transactional
    void createSynonym() throws Exception {
        int databaseSizeBeforeCreate = synonymRepository.findAll().size();
        // Create the Synonym
        restSynonymMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(synonym))
            )
            .andExpect(status().isCreated());

        // Validate the Synonym in the database
        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeCreate + 1);
        Synonym testSynonym = synonymList.get(synonymList.size() - 1);
        assertThat(testSynonym.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testSynonym.getSource()).isEqualTo(DEFAULT_SOURCE);
        assertThat(testSynonym.getCode()).isEqualTo(DEFAULT_CODE);
        assertThat(testSynonym.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testSynonym.getNote()).isEqualTo(DEFAULT_NOTE);
    }

    @Test
    @Transactional
    void createSynonymWithExistingId() throws Exception {
        // Create the Synonym with an existing ID
        synonym.setId(1L);

        int databaseSizeBeforeCreate = synonymRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restSynonymMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(synonym))
            )
            .andExpect(status().isBadRequest());

        // Validate the Synonym in the database
        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = synonymRepository.findAll().size();
        // set the field null
        synonym.setType(null);

        // Create the Synonym, which fails.

        restSynonymMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(synonym))
            )
            .andExpect(status().isBadRequest());

        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkSourceIsRequired() throws Exception {
        int databaseSizeBeforeTest = synonymRepository.findAll().size();
        // set the field null
        synonym.setSource(null);

        // Create the Synonym, which fails.

        restSynonymMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(synonym))
            )
            .andExpect(status().isBadRequest());

        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = synonymRepository.findAll().size();
        // set the field null
        synonym.setName(null);

        // Create the Synonym, which fails.

        restSynonymMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(synonym))
            )
            .andExpect(status().isBadRequest());

        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllSynonyms() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList
        restSynonymMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(synonym.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE)))
            .andExpect(jsonPath("$.[*].source").value(hasItem(DEFAULT_SOURCE)))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].note").value(hasItem(DEFAULT_NOTE.toString())));
    }

    @Test
    @Transactional
    void getSynonym() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get the synonym
        restSynonymMockMvc
            .perform(get(ENTITY_API_URL_ID, synonym.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(synonym.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE))
            .andExpect(jsonPath("$.source").value(DEFAULT_SOURCE))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.note").value(DEFAULT_NOTE.toString()));
    }

    @Test
    @Transactional
    void getSynonymsByIdFiltering() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        Long id = synonym.getId();

        defaultSynonymShouldBeFound("id.equals=" + id);
        defaultSynonymShouldNotBeFound("id.notEquals=" + id);

        defaultSynonymShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultSynonymShouldNotBeFound("id.greaterThan=" + id);

        defaultSynonymShouldBeFound("id.lessThanOrEqual=" + id);
        defaultSynonymShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllSynonymsByTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where type equals to DEFAULT_TYPE
        defaultSynonymShouldBeFound("type.equals=" + DEFAULT_TYPE);

        // Get all the synonymList where type equals to UPDATED_TYPE
        defaultSynonymShouldNotBeFound("type.equals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllSynonymsByTypeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where type not equals to DEFAULT_TYPE
        defaultSynonymShouldNotBeFound("type.notEquals=" + DEFAULT_TYPE);

        // Get all the synonymList where type not equals to UPDATED_TYPE
        defaultSynonymShouldBeFound("type.notEquals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllSynonymsByTypeIsInShouldWork() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where type in DEFAULT_TYPE or UPDATED_TYPE
        defaultSynonymShouldBeFound("type.in=" + DEFAULT_TYPE + "," + UPDATED_TYPE);

        // Get all the synonymList where type equals to UPDATED_TYPE
        defaultSynonymShouldNotBeFound("type.in=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllSynonymsByTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where type is not null
        defaultSynonymShouldBeFound("type.specified=true");

        // Get all the synonymList where type is null
        defaultSynonymShouldNotBeFound("type.specified=false");
    }

    @Test
    @Transactional
    void getAllSynonymsByTypeContainsSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where type contains DEFAULT_TYPE
        defaultSynonymShouldBeFound("type.contains=" + DEFAULT_TYPE);

        // Get all the synonymList where type contains UPDATED_TYPE
        defaultSynonymShouldNotBeFound("type.contains=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllSynonymsByTypeNotContainsSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where type does not contain DEFAULT_TYPE
        defaultSynonymShouldNotBeFound("type.doesNotContain=" + DEFAULT_TYPE);

        // Get all the synonymList where type does not contain UPDATED_TYPE
        defaultSynonymShouldBeFound("type.doesNotContain=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllSynonymsBySourceIsEqualToSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where source equals to DEFAULT_SOURCE
        defaultSynonymShouldBeFound("source.equals=" + DEFAULT_SOURCE);

        // Get all the synonymList where source equals to UPDATED_SOURCE
        defaultSynonymShouldNotBeFound("source.equals=" + UPDATED_SOURCE);
    }

    @Test
    @Transactional
    void getAllSynonymsBySourceIsNotEqualToSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where source not equals to DEFAULT_SOURCE
        defaultSynonymShouldNotBeFound("source.notEquals=" + DEFAULT_SOURCE);

        // Get all the synonymList where source not equals to UPDATED_SOURCE
        defaultSynonymShouldBeFound("source.notEquals=" + UPDATED_SOURCE);
    }

    @Test
    @Transactional
    void getAllSynonymsBySourceIsInShouldWork() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where source in DEFAULT_SOURCE or UPDATED_SOURCE
        defaultSynonymShouldBeFound("source.in=" + DEFAULT_SOURCE + "," + UPDATED_SOURCE);

        // Get all the synonymList where source equals to UPDATED_SOURCE
        defaultSynonymShouldNotBeFound("source.in=" + UPDATED_SOURCE);
    }

    @Test
    @Transactional
    void getAllSynonymsBySourceIsNullOrNotNull() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where source is not null
        defaultSynonymShouldBeFound("source.specified=true");

        // Get all the synonymList where source is null
        defaultSynonymShouldNotBeFound("source.specified=false");
    }

    @Test
    @Transactional
    void getAllSynonymsBySourceContainsSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where source contains DEFAULT_SOURCE
        defaultSynonymShouldBeFound("source.contains=" + DEFAULT_SOURCE);

        // Get all the synonymList where source contains UPDATED_SOURCE
        defaultSynonymShouldNotBeFound("source.contains=" + UPDATED_SOURCE);
    }

    @Test
    @Transactional
    void getAllSynonymsBySourceNotContainsSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where source does not contain DEFAULT_SOURCE
        defaultSynonymShouldNotBeFound("source.doesNotContain=" + DEFAULT_SOURCE);

        // Get all the synonymList where source does not contain UPDATED_SOURCE
        defaultSynonymShouldBeFound("source.doesNotContain=" + UPDATED_SOURCE);
    }

    @Test
    @Transactional
    void getAllSynonymsByCodeIsEqualToSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where code equals to DEFAULT_CODE
        defaultSynonymShouldBeFound("code.equals=" + DEFAULT_CODE);

        // Get all the synonymList where code equals to UPDATED_CODE
        defaultSynonymShouldNotBeFound("code.equals=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllSynonymsByCodeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where code not equals to DEFAULT_CODE
        defaultSynonymShouldNotBeFound("code.notEquals=" + DEFAULT_CODE);

        // Get all the synonymList where code not equals to UPDATED_CODE
        defaultSynonymShouldBeFound("code.notEquals=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllSynonymsByCodeIsInShouldWork() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where code in DEFAULT_CODE or UPDATED_CODE
        defaultSynonymShouldBeFound("code.in=" + DEFAULT_CODE + "," + UPDATED_CODE);

        // Get all the synonymList where code equals to UPDATED_CODE
        defaultSynonymShouldNotBeFound("code.in=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllSynonymsByCodeIsNullOrNotNull() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where code is not null
        defaultSynonymShouldBeFound("code.specified=true");

        // Get all the synonymList where code is null
        defaultSynonymShouldNotBeFound("code.specified=false");
    }

    @Test
    @Transactional
    void getAllSynonymsByCodeContainsSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where code contains DEFAULT_CODE
        defaultSynonymShouldBeFound("code.contains=" + DEFAULT_CODE);

        // Get all the synonymList where code contains UPDATED_CODE
        defaultSynonymShouldNotBeFound("code.contains=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllSynonymsByCodeNotContainsSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where code does not contain DEFAULT_CODE
        defaultSynonymShouldNotBeFound("code.doesNotContain=" + DEFAULT_CODE);

        // Get all the synonymList where code does not contain UPDATED_CODE
        defaultSynonymShouldBeFound("code.doesNotContain=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllSynonymsByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where name equals to DEFAULT_NAME
        defaultSynonymShouldBeFound("name.equals=" + DEFAULT_NAME);

        // Get all the synonymList where name equals to UPDATED_NAME
        defaultSynonymShouldNotBeFound("name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllSynonymsByNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where name not equals to DEFAULT_NAME
        defaultSynonymShouldNotBeFound("name.notEquals=" + DEFAULT_NAME);

        // Get all the synonymList where name not equals to UPDATED_NAME
        defaultSynonymShouldBeFound("name.notEquals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllSynonymsByNameIsInShouldWork() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where name in DEFAULT_NAME or UPDATED_NAME
        defaultSynonymShouldBeFound("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME);

        // Get all the synonymList where name equals to UPDATED_NAME
        defaultSynonymShouldNotBeFound("name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllSynonymsByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where name is not null
        defaultSynonymShouldBeFound("name.specified=true");

        // Get all the synonymList where name is null
        defaultSynonymShouldNotBeFound("name.specified=false");
    }

    @Test
    @Transactional
    void getAllSynonymsByNameContainsSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where name contains DEFAULT_NAME
        defaultSynonymShouldBeFound("name.contains=" + DEFAULT_NAME);

        // Get all the synonymList where name contains UPDATED_NAME
        defaultSynonymShouldNotBeFound("name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllSynonymsByNameNotContainsSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        // Get all the synonymList where name does not contain DEFAULT_NAME
        defaultSynonymShouldNotBeFound("name.doesNotContain=" + DEFAULT_NAME);

        // Get all the synonymList where name does not contain UPDATED_NAME
        defaultSynonymShouldBeFound("name.doesNotContain=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllSynonymsByArticleIsEqualToSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);
        Article article;
        if (TestUtil.findAll(em, Article.class).isEmpty()) {
            article = ArticleResourceIT.createEntity(em);
            em.persist(article);
            em.flush();
        } else {
            article = TestUtil.findAll(em, Article.class).get(0);
        }
        em.persist(article);
        em.flush();
        synonym.addArticle(article);
        synonymRepository.saveAndFlush(synonym);
        Long articleId = article.getId();

        // Get all the synonymList where article equals to articleId
        defaultSynonymShouldBeFound("articleId.equals=" + articleId);

        // Get all the synonymList where article equals to (articleId + 1)
        defaultSynonymShouldNotBeFound("articleId.equals=" + (articleId + 1));
    }

    @Test
    @Transactional
    void getAllSynonymsByCancerTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);
        CancerType cancerType;
        if (TestUtil.findAll(em, CancerType.class).isEmpty()) {
            cancerType = CancerTypeResourceIT.createEntity(em);
            em.persist(cancerType);
            em.flush();
        } else {
            cancerType = TestUtil.findAll(em, CancerType.class).get(0);
        }
        em.persist(cancerType);
        em.flush();
        synonym.addCancerType(cancerType);
        synonymRepository.saveAndFlush(synonym);
        Long cancerTypeId = cancerType.getId();

        // Get all the synonymList where cancerType equals to cancerTypeId
        defaultSynonymShouldBeFound("cancerTypeId.equals=" + cancerTypeId);

        // Get all the synonymList where cancerType equals to (cancerTypeId + 1)
        defaultSynonymShouldNotBeFound("cancerTypeId.equals=" + (cancerTypeId + 1));
    }

    @Test
    @Transactional
    void getAllSynonymsByGeneIsEqualToSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);
        Gene gene;
        if (TestUtil.findAll(em, Gene.class).isEmpty()) {
            gene = GeneResourceIT.createEntity(em);
            em.persist(gene);
            em.flush();
        } else {
            gene = TestUtil.findAll(em, Gene.class).get(0);
        }
        em.persist(gene);
        em.flush();
        synonym.addGene(gene);
        synonymRepository.saveAndFlush(synonym);
        Long geneId = gene.getId();

        // Get all the synonymList where gene equals to geneId
        defaultSynonymShouldBeFound("geneId.equals=" + geneId);

        // Get all the synonymList where gene equals to (geneId + 1)
        defaultSynonymShouldNotBeFound("geneId.equals=" + (geneId + 1));
    }

    @Test
    @Transactional
    void getAllSynonymsByNciThesaurusIsEqualToSomething() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);
        NciThesaurus nciThesaurus;
        if (TestUtil.findAll(em, NciThesaurus.class).isEmpty()) {
            nciThesaurus = NciThesaurusResourceIT.createEntity(em);
            em.persist(nciThesaurus);
            em.flush();
        } else {
            nciThesaurus = TestUtil.findAll(em, NciThesaurus.class).get(0);
        }
        em.persist(nciThesaurus);
        em.flush();
        synonym.addNciThesaurus(nciThesaurus);
        synonymRepository.saveAndFlush(synonym);
        Long nciThesaurusId = nciThesaurus.getId();

        // Get all the synonymList where nciThesaurus equals to nciThesaurusId
        defaultSynonymShouldBeFound("nciThesaurusId.equals=" + nciThesaurusId);

        // Get all the synonymList where nciThesaurus equals to (nciThesaurusId + 1)
        defaultSynonymShouldNotBeFound("nciThesaurusId.equals=" + (nciThesaurusId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultSynonymShouldBeFound(String filter) throws Exception {
        restSynonymMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(synonym.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE)))
            .andExpect(jsonPath("$.[*].source").value(hasItem(DEFAULT_SOURCE)))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].note").value(hasItem(DEFAULT_NOTE.toString())));

        // Check, that the count call also returns 1
        restSynonymMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultSynonymShouldNotBeFound(String filter) throws Exception {
        restSynonymMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restSynonymMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingSynonym() throws Exception {
        // Get the synonym
        restSynonymMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewSynonym() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        int databaseSizeBeforeUpdate = synonymRepository.findAll().size();

        // Update the synonym
        Synonym updatedSynonym = synonymRepository.findById(synonym.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedSynonym are not directly saved in db
        em.detach(updatedSynonym);
        updatedSynonym.type(UPDATED_TYPE).source(UPDATED_SOURCE).code(UPDATED_CODE).name(UPDATED_NAME).note(UPDATED_NOTE);

        restSynonymMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedSynonym.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedSynonym))
            )
            .andExpect(status().isOk());

        // Validate the Synonym in the database
        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeUpdate);
        Synonym testSynonym = synonymList.get(synonymList.size() - 1);
        assertThat(testSynonym.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testSynonym.getSource()).isEqualTo(UPDATED_SOURCE);
        assertThat(testSynonym.getCode()).isEqualTo(UPDATED_CODE);
        assertThat(testSynonym.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testSynonym.getNote()).isEqualTo(UPDATED_NOTE);
    }

    @Test
    @Transactional
    void putNonExistingSynonym() throws Exception {
        int databaseSizeBeforeUpdate = synonymRepository.findAll().size();
        synonym.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSynonymMockMvc
            .perform(
                put(ENTITY_API_URL_ID, synonym.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(synonym))
            )
            .andExpect(status().isBadRequest());

        // Validate the Synonym in the database
        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchSynonym() throws Exception {
        int databaseSizeBeforeUpdate = synonymRepository.findAll().size();
        synonym.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSynonymMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(synonym))
            )
            .andExpect(status().isBadRequest());

        // Validate the Synonym in the database
        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamSynonym() throws Exception {
        int databaseSizeBeforeUpdate = synonymRepository.findAll().size();
        synonym.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSynonymMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(synonym))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Synonym in the database
        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateSynonymWithPatch() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        int databaseSizeBeforeUpdate = synonymRepository.findAll().size();

        // Update the synonym using partial update
        Synonym partialUpdatedSynonym = new Synonym();
        partialUpdatedSynonym.setId(synonym.getId());

        partialUpdatedSynonym.source(UPDATED_SOURCE).note(UPDATED_NOTE);

        restSynonymMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSynonym.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSynonym))
            )
            .andExpect(status().isOk());

        // Validate the Synonym in the database
        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeUpdate);
        Synonym testSynonym = synonymList.get(synonymList.size() - 1);
        assertThat(testSynonym.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testSynonym.getSource()).isEqualTo(UPDATED_SOURCE);
        assertThat(testSynonym.getCode()).isEqualTo(DEFAULT_CODE);
        assertThat(testSynonym.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testSynonym.getNote()).isEqualTo(UPDATED_NOTE);
    }

    @Test
    @Transactional
    void fullUpdateSynonymWithPatch() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        int databaseSizeBeforeUpdate = synonymRepository.findAll().size();

        // Update the synonym using partial update
        Synonym partialUpdatedSynonym = new Synonym();
        partialUpdatedSynonym.setId(synonym.getId());

        partialUpdatedSynonym.type(UPDATED_TYPE).source(UPDATED_SOURCE).code(UPDATED_CODE).name(UPDATED_NAME).note(UPDATED_NOTE);

        restSynonymMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSynonym.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSynonym))
            )
            .andExpect(status().isOk());

        // Validate the Synonym in the database
        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeUpdate);
        Synonym testSynonym = synonymList.get(synonymList.size() - 1);
        assertThat(testSynonym.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testSynonym.getSource()).isEqualTo(UPDATED_SOURCE);
        assertThat(testSynonym.getCode()).isEqualTo(UPDATED_CODE);
        assertThat(testSynonym.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testSynonym.getNote()).isEqualTo(UPDATED_NOTE);
    }

    @Test
    @Transactional
    void patchNonExistingSynonym() throws Exception {
        int databaseSizeBeforeUpdate = synonymRepository.findAll().size();
        synonym.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSynonymMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, synonym.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(synonym))
            )
            .andExpect(status().isBadRequest());

        // Validate the Synonym in the database
        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchSynonym() throws Exception {
        int databaseSizeBeforeUpdate = synonymRepository.findAll().size();
        synonym.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSynonymMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(synonym))
            )
            .andExpect(status().isBadRequest());

        // Validate the Synonym in the database
        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamSynonym() throws Exception {
        int databaseSizeBeforeUpdate = synonymRepository.findAll().size();
        synonym.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSynonymMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(synonym))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Synonym in the database
        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteSynonym() throws Exception {
        // Initialize the database
        synonymRepository.saveAndFlush(synonym);

        int databaseSizeBeforeDelete = synonymRepository.findAll().size();

        // Delete the synonym
        restSynonymMockMvc
            .perform(delete(ENTITY_API_URL_ID, synonym.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Synonym> synonymList = synonymRepository.findAll();
        assertThat(synonymList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
