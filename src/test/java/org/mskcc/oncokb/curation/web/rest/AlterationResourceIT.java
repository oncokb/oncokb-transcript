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
import org.mskcc.oncokb.curation.domain.enumeration.AlterationType;
import org.mskcc.oncokb.curation.repository.AlterationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link AlterationResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class AlterationResourceIT {

    private static final AlterationType DEFAULT_TYPE = AlterationType.MUTATION;
    private static final AlterationType UPDATED_TYPE = AlterationType.COPY_NUMBER_ALTERATION;

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_ALTERATION = "AAAAAAAAAA";
    private static final String UPDATED_ALTERATION = "BBBBBBBBBB";

    private static final Integer DEFAULT_PROTEIN_START = 1;
    private static final Integer UPDATED_PROTEIN_START = 2;

    private static final Integer DEFAULT_PROTEIN_END = 1;
    private static final Integer UPDATED_PROTEIN_END = 2;

    private static final String DEFAULT_REF_RESIDUES = "AAAAAAAAAA";
    private static final String UPDATED_REF_RESIDUES = "BBBBBBBBBB";

    private static final String DEFAULT_VARIANT_RESIDUES = "AAAAAAAAAA";
    private static final String UPDATED_VARIANT_RESIDUES = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/alterations";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private AlterationRepository alterationRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restAlterationMockMvc;

    private Alteration alteration;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Alteration createEntity(EntityManager em) {
        Alteration alteration = new Alteration()
            .type(DEFAULT_TYPE)
            .name(DEFAULT_NAME)
            .alteration(DEFAULT_ALTERATION)
            .proteinStart(DEFAULT_PROTEIN_START)
            .proteinEnd(DEFAULT_PROTEIN_END)
            .refResidues(DEFAULT_REF_RESIDUES)
            .variantResidues(DEFAULT_VARIANT_RESIDUES);
        return alteration;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Alteration createUpdatedEntity(EntityManager em) {
        Alteration alteration = new Alteration()
            .type(UPDATED_TYPE)
            .name(UPDATED_NAME)
            .alteration(UPDATED_ALTERATION)
            .proteinStart(UPDATED_PROTEIN_START)
            .proteinEnd(UPDATED_PROTEIN_END)
            .refResidues(UPDATED_REF_RESIDUES)
            .variantResidues(UPDATED_VARIANT_RESIDUES);
        return alteration;
    }

    @BeforeEach
    public void initTest() {
        alteration = createEntity(em);
    }

    @Test
    @Transactional
    void createAlteration() throws Exception {
        int databaseSizeBeforeCreate = alterationRepository.findAll().size();
        // Create the Alteration
        restAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isCreated());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeCreate + 1);
        Alteration testAlteration = alterationList.get(alterationList.size() - 1);
        assertThat(testAlteration.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testAlteration.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testAlteration.getAlteration()).isEqualTo(DEFAULT_ALTERATION);
        assertThat(testAlteration.getProteinStart()).isEqualTo(DEFAULT_PROTEIN_START);
        assertThat(testAlteration.getProteinEnd()).isEqualTo(DEFAULT_PROTEIN_END);
        assertThat(testAlteration.getRefResidues()).isEqualTo(DEFAULT_REF_RESIDUES);
        assertThat(testAlteration.getVariantResidues()).isEqualTo(DEFAULT_VARIANT_RESIDUES);
    }

    @Test
    @Transactional
    void createAlterationWithExistingId() throws Exception {
        // Create the Alteration with an existing ID
        alteration.setId(1L);

        int databaseSizeBeforeCreate = alterationRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = alterationRepository.findAll().size();
        // set the field null
        alteration.setType(null);

        // Create the Alteration, which fails.

        restAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = alterationRepository.findAll().size();
        // set the field null
        alteration.setName(null);

        // Create the Alteration, which fails.

        restAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAlterationIsRequired() throws Exception {
        int databaseSizeBeforeTest = alterationRepository.findAll().size();
        // set the field null
        alteration.setAlteration(null);

        // Create the Alteration, which fails.

        restAlterationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllAlterations() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get all the alterationList
        restAlterationMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(alteration.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].alteration").value(hasItem(DEFAULT_ALTERATION)))
            .andExpect(jsonPath("$.[*].proteinStart").value(hasItem(DEFAULT_PROTEIN_START)))
            .andExpect(jsonPath("$.[*].proteinEnd").value(hasItem(DEFAULT_PROTEIN_END)))
            .andExpect(jsonPath("$.[*].refResidues").value(hasItem(DEFAULT_REF_RESIDUES)))
            .andExpect(jsonPath("$.[*].variantResidues").value(hasItem(DEFAULT_VARIANT_RESIDUES)));
    }

    @Test
    @Transactional
    void getAlteration() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        // Get the alteration
        restAlterationMockMvc
            .perform(get(ENTITY_API_URL_ID, alteration.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(alteration.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.alteration").value(DEFAULT_ALTERATION))
            .andExpect(jsonPath("$.proteinStart").value(DEFAULT_PROTEIN_START))
            .andExpect(jsonPath("$.proteinEnd").value(DEFAULT_PROTEIN_END))
            .andExpect(jsonPath("$.refResidues").value(DEFAULT_REF_RESIDUES))
            .andExpect(jsonPath("$.variantResidues").value(DEFAULT_VARIANT_RESIDUES));
    }

    @Test
    @Transactional
    void getNonExistingAlteration() throws Exception {
        // Get the alteration
        restAlterationMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewAlteration() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();

        // Update the alteration
        Alteration updatedAlteration = alterationRepository.findById(alteration.getId()).get();
        // Disconnect from session so that the updates on updatedAlteration are not directly saved in db
        em.detach(updatedAlteration);
        updatedAlteration
            .type(UPDATED_TYPE)
            .name(UPDATED_NAME)
            .alteration(UPDATED_ALTERATION)
            .proteinStart(UPDATED_PROTEIN_START)
            .proteinEnd(UPDATED_PROTEIN_END)
            .refResidues(UPDATED_REF_RESIDUES)
            .variantResidues(UPDATED_VARIANT_RESIDUES);

        restAlterationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedAlteration.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedAlteration))
            )
            .andExpect(status().isOk());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
        Alteration testAlteration = alterationList.get(alterationList.size() - 1);
        assertThat(testAlteration.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testAlteration.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testAlteration.getAlteration()).isEqualTo(UPDATED_ALTERATION);
        assertThat(testAlteration.getProteinStart()).isEqualTo(UPDATED_PROTEIN_START);
        assertThat(testAlteration.getProteinEnd()).isEqualTo(UPDATED_PROTEIN_END);
        assertThat(testAlteration.getRefResidues()).isEqualTo(UPDATED_REF_RESIDUES);
        assertThat(testAlteration.getVariantResidues()).isEqualTo(UPDATED_VARIANT_RESIDUES);
    }

    @Test
    @Transactional
    void putNonExistingAlteration() throws Exception {
        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();
        alteration.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAlterationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, alteration.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchAlteration() throws Exception {
        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();
        alteration.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlterationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamAlteration() throws Exception {
        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();
        alteration.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlterationMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateAlterationWithPatch() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();

        // Update the alteration using partial update
        Alteration partialUpdatedAlteration = new Alteration();
        partialUpdatedAlteration.setId(alteration.getId());

        partialUpdatedAlteration
            .type(UPDATED_TYPE)
            .name(UPDATED_NAME)
            .proteinStart(UPDATED_PROTEIN_START)
            .refResidues(UPDATED_REF_RESIDUES)
            .variantResidues(UPDATED_VARIANT_RESIDUES);

        restAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAlteration.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedAlteration))
            )
            .andExpect(status().isOk());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
        Alteration testAlteration = alterationList.get(alterationList.size() - 1);
        assertThat(testAlteration.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testAlteration.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testAlteration.getAlteration()).isEqualTo(DEFAULT_ALTERATION);
        assertThat(testAlteration.getProteinStart()).isEqualTo(UPDATED_PROTEIN_START);
        assertThat(testAlteration.getProteinEnd()).isEqualTo(DEFAULT_PROTEIN_END);
        assertThat(testAlteration.getRefResidues()).isEqualTo(UPDATED_REF_RESIDUES);
        assertThat(testAlteration.getVariantResidues()).isEqualTo(UPDATED_VARIANT_RESIDUES);
    }

    @Test
    @Transactional
    void fullUpdateAlterationWithPatch() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();

        // Update the alteration using partial update
        Alteration partialUpdatedAlteration = new Alteration();
        partialUpdatedAlteration.setId(alteration.getId());

        partialUpdatedAlteration
            .type(UPDATED_TYPE)
            .name(UPDATED_NAME)
            .alteration(UPDATED_ALTERATION)
            .proteinStart(UPDATED_PROTEIN_START)
            .proteinEnd(UPDATED_PROTEIN_END)
            .refResidues(UPDATED_REF_RESIDUES)
            .variantResidues(UPDATED_VARIANT_RESIDUES);

        restAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAlteration.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedAlteration))
            )
            .andExpect(status().isOk());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
        Alteration testAlteration = alterationList.get(alterationList.size() - 1);
        assertThat(testAlteration.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testAlteration.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testAlteration.getAlteration()).isEqualTo(UPDATED_ALTERATION);
        assertThat(testAlteration.getProteinStart()).isEqualTo(UPDATED_PROTEIN_START);
        assertThat(testAlteration.getProteinEnd()).isEqualTo(UPDATED_PROTEIN_END);
        assertThat(testAlteration.getRefResidues()).isEqualTo(UPDATED_REF_RESIDUES);
        assertThat(testAlteration.getVariantResidues()).isEqualTo(UPDATED_VARIANT_RESIDUES);
    }

    @Test
    @Transactional
    void patchNonExistingAlteration() throws Exception {
        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();
        alteration.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, alteration.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchAlteration() throws Exception {
        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();
        alteration.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isBadRequest());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamAlteration() throws Exception {
        int databaseSizeBeforeUpdate = alterationRepository.findAll().size();
        alteration.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAlterationMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(alteration))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Alteration in the database
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteAlteration() throws Exception {
        // Initialize the database
        alterationRepository.saveAndFlush(alteration);

        int databaseSizeBeforeDelete = alterationRepository.findAll().size();

        // Delete the alteration
        restAlterationMockMvc
            .perform(delete(ENTITY_API_URL_ID, alteration.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Alteration> alterationList = alterationRepository.findAll();
        assertThat(alterationList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
