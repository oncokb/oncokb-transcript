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
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.curation.IntegrationTest;
import org.mskcc.oncokb.curation.domain.Consequence;
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;
import org.mskcc.oncokb.curation.repository.ConsequenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link ConsequenceResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ConsequenceResourceIT {

    private static final AlterationType DEFAULT_TYPE = AlterationType.MUTATION;
    private static final AlterationType UPDATED_TYPE = AlterationType.COPY_NUMBER_ALTERATION;

    private static final String DEFAULT_TERM = "AAAAAAAAAA";
    private static final String UPDATED_TERM = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final Boolean DEFAULT_IS_GENERALLY_TRUNCATING = false;
    private static final Boolean UPDATED_IS_GENERALLY_TRUNCATING = true;

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/consequences";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/_search/consequences";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ConsequenceRepository consequenceRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restConsequenceMockMvc;

    private Consequence consequence;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Consequence createEntity(EntityManager em) {
        Consequence consequence = new Consequence()
            .type(DEFAULT_TYPE)
            .term(DEFAULT_TERM)
            .name(DEFAULT_NAME)
            .isGenerallyTruncating(DEFAULT_IS_GENERALLY_TRUNCATING)
            .description(DEFAULT_DESCRIPTION);
        return consequence;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Consequence createUpdatedEntity(EntityManager em) {
        Consequence consequence = new Consequence()
            .type(UPDATED_TYPE)
            .term(UPDATED_TERM)
            .name(UPDATED_NAME)
            .isGenerallyTruncating(UPDATED_IS_GENERALLY_TRUNCATING)
            .description(UPDATED_DESCRIPTION);
        return consequence;
    }

    @BeforeEach
    public void initTest() {
        consequence = createEntity(em);
    }

    @Test
    @Transactional
    void createConsequence() throws Exception {
        int databaseSizeBeforeCreate = consequenceRepository.findAll().size();
        // Create the Consequence
        restConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isCreated());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeCreate + 1);
        Consequence testConsequence = consequenceList.get(consequenceList.size() - 1);
        assertThat(testConsequence.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testConsequence.getTerm()).isEqualTo(DEFAULT_TERM);
        assertThat(testConsequence.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testConsequence.getIsGenerallyTruncating()).isEqualTo(DEFAULT_IS_GENERALLY_TRUNCATING);
        assertThat(testConsequence.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void createConsequenceWithExistingId() throws Exception {
        // Create the Consequence with an existing ID
        consequence.setId(1L);

        int databaseSizeBeforeCreate = consequenceRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = consequenceRepository.findAll().size();
        // set the field null
        consequence.setType(null);

        // Create the Consequence, which fails.

        restConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTermIsRequired() throws Exception {
        int databaseSizeBeforeTest = consequenceRepository.findAll().size();
        // set the field null
        consequence.setTerm(null);

        // Create the Consequence, which fails.

        restConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = consequenceRepository.findAll().size();
        // set the field null
        consequence.setName(null);

        // Create the Consequence, which fails.

        restConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIsGenerallyTruncatingIsRequired() throws Exception {
        int databaseSizeBeforeTest = consequenceRepository.findAll().size();
        // set the field null
        consequence.setIsGenerallyTruncating(null);

        // Create the Consequence, which fails.

        restConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllConsequences() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get all the consequenceList
        restConsequenceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(consequence.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].term").value(hasItem(DEFAULT_TERM)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].isGenerallyTruncating").value(hasItem(DEFAULT_IS_GENERALLY_TRUNCATING.booleanValue())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }

    @Test
    @Transactional
    void getConsequence() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Get the consequence
        restConsequenceMockMvc
            .perform(get(ENTITY_API_URL_ID, consequence.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(consequence.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.term").value(DEFAULT_TERM))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.isGenerallyTruncating").value(DEFAULT_IS_GENERALLY_TRUNCATING.booleanValue()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION));
    }

    @Test
    @Transactional
    void getNonExistingConsequence() throws Exception {
        // Get the consequence
        restConsequenceMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewConsequence() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();

        // Update the consequence
        Consequence updatedConsequence = consequenceRepository.findById(consequence.getId()).get();
        // Disconnect from session so that the updates on updatedConsequence are not directly saved in db
        em.detach(updatedConsequence);
        updatedConsequence
            .type(UPDATED_TYPE)
            .term(UPDATED_TERM)
            .name(UPDATED_NAME)
            .isGenerallyTruncating(UPDATED_IS_GENERALLY_TRUNCATING)
            .description(UPDATED_DESCRIPTION);

        restConsequenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedConsequence.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedConsequence))
            )
            .andExpect(status().isOk());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
        Consequence testConsequence = consequenceList.get(consequenceList.size() - 1);
        assertThat(testConsequence.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testConsequence.getTerm()).isEqualTo(UPDATED_TERM);
        assertThat(testConsequence.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testConsequence.getIsGenerallyTruncating()).isEqualTo(UPDATED_IS_GENERALLY_TRUNCATING);
        assertThat(testConsequence.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void putNonExistingConsequence() throws Exception {
        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();
        consequence.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restConsequenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, consequence.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchConsequence() throws Exception {
        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();
        consequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConsequenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamConsequence() throws Exception {
        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();
        consequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConsequenceMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateConsequenceWithPatch() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();

        // Update the consequence using partial update
        Consequence partialUpdatedConsequence = new Consequence();
        partialUpdatedConsequence.setId(consequence.getId());

        partialUpdatedConsequence.type(UPDATED_TYPE).term(UPDATED_TERM).name(UPDATED_NAME);

        restConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedConsequence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedConsequence))
            )
            .andExpect(status().isOk());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
        Consequence testConsequence = consequenceList.get(consequenceList.size() - 1);
        assertThat(testConsequence.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testConsequence.getTerm()).isEqualTo(UPDATED_TERM);
        assertThat(testConsequence.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testConsequence.getIsGenerallyTruncating()).isEqualTo(DEFAULT_IS_GENERALLY_TRUNCATING);
        assertThat(testConsequence.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void fullUpdateConsequenceWithPatch() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();

        // Update the consequence using partial update
        Consequence partialUpdatedConsequence = new Consequence();
        partialUpdatedConsequence.setId(consequence.getId());

        partialUpdatedConsequence
            .type(UPDATED_TYPE)
            .term(UPDATED_TERM)
            .name(UPDATED_NAME)
            .isGenerallyTruncating(UPDATED_IS_GENERALLY_TRUNCATING)
            .description(UPDATED_DESCRIPTION);

        restConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedConsequence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedConsequence))
            )
            .andExpect(status().isOk());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
        Consequence testConsequence = consequenceList.get(consequenceList.size() - 1);
        assertThat(testConsequence.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testConsequence.getTerm()).isEqualTo(UPDATED_TERM);
        assertThat(testConsequence.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testConsequence.getIsGenerallyTruncating()).isEqualTo(UPDATED_IS_GENERALLY_TRUNCATING);
        assertThat(testConsequence.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void patchNonExistingConsequence() throws Exception {
        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();
        consequence.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, consequence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchConsequence() throws Exception {
        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();
        consequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamConsequence() throws Exception {
        int databaseSizeBeforeUpdate = consequenceRepository.findAll().size();
        consequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(consequence))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Consequence in the database
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteConsequence() throws Exception {
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        int databaseSizeBeforeDelete = consequenceRepository.findAll().size();

        // Delete the consequence
        restConsequenceMockMvc
            .perform(delete(ENTITY_API_URL_ID, consequence.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Consequence> consequenceList = consequenceRepository.findAll();
        assertThat(consequenceList).hasSize(databaseSizeBeforeDelete - 1);
    }

    @Test
    @Transactional
    void searchConsequence() throws Exception {
        // Configure the mock search repository
        // Initialize the database
        consequenceRepository.saveAndFlush(consequence);

        // Search the consequence
        restConsequenceMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + consequence.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(consequence.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].term").value(hasItem(DEFAULT_TERM)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].isGenerallyTruncating").value(hasItem(DEFAULT_IS_GENERALLY_TRUNCATING.booleanValue())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }
}
