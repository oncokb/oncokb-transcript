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
import org.mskcc.oncokb.curation.domain.VariantConsequence;
import org.mskcc.oncokb.curation.repository.VariantConsequenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link VariantConsequenceResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class VariantConsequenceResourceIT {

    private static final String DEFAULT_TERM = "AAAAAAAAAA";
    private static final String UPDATED_TERM = "BBBBBBBBBB";

    private static final Boolean DEFAULT_IS_GENERALLY_TRUNCATING = false;
    private static final Boolean UPDATED_IS_GENERALLY_TRUNCATING = true;

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/variant-consequences";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private VariantConsequenceRepository variantConsequenceRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restVariantConsequenceMockMvc;

    private VariantConsequence variantConsequence;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static VariantConsequence createEntity(EntityManager em) {
        VariantConsequence variantConsequence = new VariantConsequence()
            .term(DEFAULT_TERM)
            .isGenerallyTruncating(DEFAULT_IS_GENERALLY_TRUNCATING)
            .description(DEFAULT_DESCRIPTION);
        return variantConsequence;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static VariantConsequence createUpdatedEntity(EntityManager em) {
        VariantConsequence variantConsequence = new VariantConsequence()
            .term(UPDATED_TERM)
            .isGenerallyTruncating(UPDATED_IS_GENERALLY_TRUNCATING)
            .description(UPDATED_DESCRIPTION);
        return variantConsequence;
    }

    @BeforeEach
    public void initTest() {
        variantConsequence = createEntity(em);
    }

    @Test
    @Transactional
    void createVariantConsequence() throws Exception {
        int databaseSizeBeforeCreate = variantConsequenceRepository.findAll().size();
        // Create the VariantConsequence
        restVariantConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(variantConsequence))
            )
            .andExpect(status().isCreated());

        // Validate the VariantConsequence in the database
        List<VariantConsequence> variantConsequenceList = variantConsequenceRepository.findAll();
        assertThat(variantConsequenceList).hasSize(databaseSizeBeforeCreate + 1);
        VariantConsequence testVariantConsequence = variantConsequenceList.get(variantConsequenceList.size() - 1);
        assertThat(testVariantConsequence.getTerm()).isEqualTo(DEFAULT_TERM);
        assertThat(testVariantConsequence.getIsGenerallyTruncating()).isEqualTo(DEFAULT_IS_GENERALLY_TRUNCATING);
        assertThat(testVariantConsequence.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void createVariantConsequenceWithExistingId() throws Exception {
        // Create the VariantConsequence with an existing ID
        variantConsequence.setId(1L);

        int databaseSizeBeforeCreate = variantConsequenceRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restVariantConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(variantConsequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the VariantConsequence in the database
        List<VariantConsequence> variantConsequenceList = variantConsequenceRepository.findAll();
        assertThat(variantConsequenceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTermIsRequired() throws Exception {
        int databaseSizeBeforeTest = variantConsequenceRepository.findAll().size();
        // set the field null
        variantConsequence.setTerm(null);

        // Create the VariantConsequence, which fails.

        restVariantConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(variantConsequence))
            )
            .andExpect(status().isBadRequest());

        List<VariantConsequence> variantConsequenceList = variantConsequenceRepository.findAll();
        assertThat(variantConsequenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIsGenerallyTruncatingIsRequired() throws Exception {
        int databaseSizeBeforeTest = variantConsequenceRepository.findAll().size();
        // set the field null
        variantConsequence.setIsGenerallyTruncating(null);

        // Create the VariantConsequence, which fails.

        restVariantConsequenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(variantConsequence))
            )
            .andExpect(status().isBadRequest());

        List<VariantConsequence> variantConsequenceList = variantConsequenceRepository.findAll();
        assertThat(variantConsequenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllVariantConsequences() throws Exception {
        // Initialize the database
        variantConsequenceRepository.saveAndFlush(variantConsequence);

        // Get all the variantConsequenceList
        restVariantConsequenceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(variantConsequence.getId().intValue())))
            .andExpect(jsonPath("$.[*].term").value(hasItem(DEFAULT_TERM)))
            .andExpect(jsonPath("$.[*].isGenerallyTruncating").value(hasItem(DEFAULT_IS_GENERALLY_TRUNCATING.booleanValue())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }

    @Test
    @Transactional
    void getVariantConsequence() throws Exception {
        // Initialize the database
        variantConsequenceRepository.saveAndFlush(variantConsequence);

        // Get the variantConsequence
        restVariantConsequenceMockMvc
            .perform(get(ENTITY_API_URL_ID, variantConsequence.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(variantConsequence.getId().intValue()))
            .andExpect(jsonPath("$.term").value(DEFAULT_TERM))
            .andExpect(jsonPath("$.isGenerallyTruncating").value(DEFAULT_IS_GENERALLY_TRUNCATING.booleanValue()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION));
    }

    @Test
    @Transactional
    void getNonExistingVariantConsequence() throws Exception {
        // Get the variantConsequence
        restVariantConsequenceMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewVariantConsequence() throws Exception {
        // Initialize the database
        variantConsequenceRepository.saveAndFlush(variantConsequence);

        int databaseSizeBeforeUpdate = variantConsequenceRepository.findAll().size();

        // Update the variantConsequence
        VariantConsequence updatedVariantConsequence = variantConsequenceRepository.findById(variantConsequence.getId()).get();
        // Disconnect from session so that the updates on updatedVariantConsequence are not directly saved in db
        em.detach(updatedVariantConsequence);
        updatedVariantConsequence
            .term(UPDATED_TERM)
            .isGenerallyTruncating(UPDATED_IS_GENERALLY_TRUNCATING)
            .description(UPDATED_DESCRIPTION);

        restVariantConsequenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedVariantConsequence.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedVariantConsequence))
            )
            .andExpect(status().isOk());

        // Validate the VariantConsequence in the database
        List<VariantConsequence> variantConsequenceList = variantConsequenceRepository.findAll();
        assertThat(variantConsequenceList).hasSize(databaseSizeBeforeUpdate);
        VariantConsequence testVariantConsequence = variantConsequenceList.get(variantConsequenceList.size() - 1);
        assertThat(testVariantConsequence.getTerm()).isEqualTo(UPDATED_TERM);
        assertThat(testVariantConsequence.getIsGenerallyTruncating()).isEqualTo(UPDATED_IS_GENERALLY_TRUNCATING);
        assertThat(testVariantConsequence.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void putNonExistingVariantConsequence() throws Exception {
        int databaseSizeBeforeUpdate = variantConsequenceRepository.findAll().size();
        variantConsequence.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restVariantConsequenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, variantConsequence.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(variantConsequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the VariantConsequence in the database
        List<VariantConsequence> variantConsequenceList = variantConsequenceRepository.findAll();
        assertThat(variantConsequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchVariantConsequence() throws Exception {
        int databaseSizeBeforeUpdate = variantConsequenceRepository.findAll().size();
        variantConsequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVariantConsequenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(variantConsequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the VariantConsequence in the database
        List<VariantConsequence> variantConsequenceList = variantConsequenceRepository.findAll();
        assertThat(variantConsequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamVariantConsequence() throws Exception {
        int databaseSizeBeforeUpdate = variantConsequenceRepository.findAll().size();
        variantConsequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVariantConsequenceMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(variantConsequence))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the VariantConsequence in the database
        List<VariantConsequence> variantConsequenceList = variantConsequenceRepository.findAll();
        assertThat(variantConsequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateVariantConsequenceWithPatch() throws Exception {
        // Initialize the database
        variantConsequenceRepository.saveAndFlush(variantConsequence);

        int databaseSizeBeforeUpdate = variantConsequenceRepository.findAll().size();

        // Update the variantConsequence using partial update
        VariantConsequence partialUpdatedVariantConsequence = new VariantConsequence();
        partialUpdatedVariantConsequence.setId(variantConsequence.getId());

        partialUpdatedVariantConsequence.term(UPDATED_TERM).isGenerallyTruncating(UPDATED_IS_GENERALLY_TRUNCATING);

        restVariantConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedVariantConsequence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedVariantConsequence))
            )
            .andExpect(status().isOk());

        // Validate the VariantConsequence in the database
        List<VariantConsequence> variantConsequenceList = variantConsequenceRepository.findAll();
        assertThat(variantConsequenceList).hasSize(databaseSizeBeforeUpdate);
        VariantConsequence testVariantConsequence = variantConsequenceList.get(variantConsequenceList.size() - 1);
        assertThat(testVariantConsequence.getTerm()).isEqualTo(UPDATED_TERM);
        assertThat(testVariantConsequence.getIsGenerallyTruncating()).isEqualTo(UPDATED_IS_GENERALLY_TRUNCATING);
        assertThat(testVariantConsequence.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void fullUpdateVariantConsequenceWithPatch() throws Exception {
        // Initialize the database
        variantConsequenceRepository.saveAndFlush(variantConsequence);

        int databaseSizeBeforeUpdate = variantConsequenceRepository.findAll().size();

        // Update the variantConsequence using partial update
        VariantConsequence partialUpdatedVariantConsequence = new VariantConsequence();
        partialUpdatedVariantConsequence.setId(variantConsequence.getId());

        partialUpdatedVariantConsequence
            .term(UPDATED_TERM)
            .isGenerallyTruncating(UPDATED_IS_GENERALLY_TRUNCATING)
            .description(UPDATED_DESCRIPTION);

        restVariantConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedVariantConsequence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedVariantConsequence))
            )
            .andExpect(status().isOk());

        // Validate the VariantConsequence in the database
        List<VariantConsequence> variantConsequenceList = variantConsequenceRepository.findAll();
        assertThat(variantConsequenceList).hasSize(databaseSizeBeforeUpdate);
        VariantConsequence testVariantConsequence = variantConsequenceList.get(variantConsequenceList.size() - 1);
        assertThat(testVariantConsequence.getTerm()).isEqualTo(UPDATED_TERM);
        assertThat(testVariantConsequence.getIsGenerallyTruncating()).isEqualTo(UPDATED_IS_GENERALLY_TRUNCATING);
        assertThat(testVariantConsequence.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void patchNonExistingVariantConsequence() throws Exception {
        int databaseSizeBeforeUpdate = variantConsequenceRepository.findAll().size();
        variantConsequence.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restVariantConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, variantConsequence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(variantConsequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the VariantConsequence in the database
        List<VariantConsequence> variantConsequenceList = variantConsequenceRepository.findAll();
        assertThat(variantConsequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchVariantConsequence() throws Exception {
        int databaseSizeBeforeUpdate = variantConsequenceRepository.findAll().size();
        variantConsequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVariantConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(variantConsequence))
            )
            .andExpect(status().isBadRequest());

        // Validate the VariantConsequence in the database
        List<VariantConsequence> variantConsequenceList = variantConsequenceRepository.findAll();
        assertThat(variantConsequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamVariantConsequence() throws Exception {
        int databaseSizeBeforeUpdate = variantConsequenceRepository.findAll().size();
        variantConsequence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restVariantConsequenceMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(variantConsequence))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the VariantConsequence in the database
        List<VariantConsequence> variantConsequenceList = variantConsequenceRepository.findAll();
        assertThat(variantConsequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteVariantConsequence() throws Exception {
        // Initialize the database
        variantConsequenceRepository.saveAndFlush(variantConsequence);

        int databaseSizeBeforeDelete = variantConsequenceRepository.findAll().size();

        // Delete the variantConsequence
        restVariantConsequenceMockMvc
            .perform(delete(ENTITY_API_URL_ID, variantConsequence.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<VariantConsequence> variantConsequenceList = variantConsequenceRepository.findAll();
        assertThat(variantConsequenceList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
