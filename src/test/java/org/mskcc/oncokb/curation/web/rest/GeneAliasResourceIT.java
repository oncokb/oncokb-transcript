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
import org.mskcc.oncokb.curation.domain.GeneAlias;
import org.mskcc.oncokb.curation.repository.GeneAliasRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link GeneAliasResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class GeneAliasResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/gene-aliases";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private GeneAliasRepository geneAliasRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restGeneAliasMockMvc;

    private GeneAlias geneAlias;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static GeneAlias createEntity(EntityManager em) {
        GeneAlias geneAlias = new GeneAlias().name(DEFAULT_NAME);
        return geneAlias;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static GeneAlias createUpdatedEntity(EntityManager em) {
        GeneAlias geneAlias = new GeneAlias().name(UPDATED_NAME);
        return geneAlias;
    }

    @BeforeEach
    public void initTest() {
        geneAlias = createEntity(em);
    }

    @Test
    @Transactional
    void createGeneAlias() throws Exception {
        int databaseSizeBeforeCreate = geneAliasRepository.findAll().size();
        // Create the GeneAlias
        restGeneAliasMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(geneAlias))
            )
            .andExpect(status().isCreated());

        // Validate the GeneAlias in the database
        List<GeneAlias> geneAliasList = geneAliasRepository.findAll();
        assertThat(geneAliasList).hasSize(databaseSizeBeforeCreate + 1);
        GeneAlias testGeneAlias = geneAliasList.get(geneAliasList.size() - 1);
        assertThat(testGeneAlias.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void createGeneAliasWithExistingId() throws Exception {
        // Create the GeneAlias with an existing ID
        geneAlias.setId(1L);

        int databaseSizeBeforeCreate = geneAliasRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restGeneAliasMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(geneAlias))
            )
            .andExpect(status().isBadRequest());

        // Validate the GeneAlias in the database
        List<GeneAlias> geneAliasList = geneAliasRepository.findAll();
        assertThat(geneAliasList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllGeneAliases() throws Exception {
        // Initialize the database
        geneAliasRepository.saveAndFlush(geneAlias);

        // Get all the geneAliasList
        restGeneAliasMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(geneAlias.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));
    }

    @Test
    @Transactional
    void getGeneAlias() throws Exception {
        // Initialize the database
        geneAliasRepository.saveAndFlush(geneAlias);

        // Get the geneAlias
        restGeneAliasMockMvc
            .perform(get(ENTITY_API_URL_ID, geneAlias.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(geneAlias.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME));
    }

    @Test
    @Transactional
    void getNonExistingGeneAlias() throws Exception {
        // Get the geneAlias
        restGeneAliasMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewGeneAlias() throws Exception {
        // Initialize the database
        geneAliasRepository.saveAndFlush(geneAlias);

        int databaseSizeBeforeUpdate = geneAliasRepository.findAll().size();

        // Update the geneAlias
        GeneAlias updatedGeneAlias = geneAliasRepository.findById(geneAlias.getId()).get();
        // Disconnect from session so that the updates on updatedGeneAlias are not directly saved in db
        em.detach(updatedGeneAlias);
        updatedGeneAlias.name(UPDATED_NAME);

        restGeneAliasMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedGeneAlias.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedGeneAlias))
            )
            .andExpect(status().isOk());

        // Validate the GeneAlias in the database
        List<GeneAlias> geneAliasList = geneAliasRepository.findAll();
        assertThat(geneAliasList).hasSize(databaseSizeBeforeUpdate);
        GeneAlias testGeneAlias = geneAliasList.get(geneAliasList.size() - 1);
        assertThat(testGeneAlias.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void putNonExistingGeneAlias() throws Exception {
        int databaseSizeBeforeUpdate = geneAliasRepository.findAll().size();
        geneAlias.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGeneAliasMockMvc
            .perform(
                put(ENTITY_API_URL_ID, geneAlias.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(geneAlias))
            )
            .andExpect(status().isBadRequest());

        // Validate the GeneAlias in the database
        List<GeneAlias> geneAliasList = geneAliasRepository.findAll();
        assertThat(geneAliasList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchGeneAlias() throws Exception {
        int databaseSizeBeforeUpdate = geneAliasRepository.findAll().size();
        geneAlias.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGeneAliasMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(geneAlias))
            )
            .andExpect(status().isBadRequest());

        // Validate the GeneAlias in the database
        List<GeneAlias> geneAliasList = geneAliasRepository.findAll();
        assertThat(geneAliasList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamGeneAlias() throws Exception {
        int databaseSizeBeforeUpdate = geneAliasRepository.findAll().size();
        geneAlias.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGeneAliasMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(geneAlias))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the GeneAlias in the database
        List<GeneAlias> geneAliasList = geneAliasRepository.findAll();
        assertThat(geneAliasList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateGeneAliasWithPatch() throws Exception {
        // Initialize the database
        geneAliasRepository.saveAndFlush(geneAlias);

        int databaseSizeBeforeUpdate = geneAliasRepository.findAll().size();

        // Update the geneAlias using partial update
        GeneAlias partialUpdatedGeneAlias = new GeneAlias();
        partialUpdatedGeneAlias.setId(geneAlias.getId());

        restGeneAliasMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGeneAlias.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedGeneAlias))
            )
            .andExpect(status().isOk());

        // Validate the GeneAlias in the database
        List<GeneAlias> geneAliasList = geneAliasRepository.findAll();
        assertThat(geneAliasList).hasSize(databaseSizeBeforeUpdate);
        GeneAlias testGeneAlias = geneAliasList.get(geneAliasList.size() - 1);
        assertThat(testGeneAlias.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void fullUpdateGeneAliasWithPatch() throws Exception {
        // Initialize the database
        geneAliasRepository.saveAndFlush(geneAlias);

        int databaseSizeBeforeUpdate = geneAliasRepository.findAll().size();

        // Update the geneAlias using partial update
        GeneAlias partialUpdatedGeneAlias = new GeneAlias();
        partialUpdatedGeneAlias.setId(geneAlias.getId());

        partialUpdatedGeneAlias.name(UPDATED_NAME);

        restGeneAliasMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGeneAlias.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedGeneAlias))
            )
            .andExpect(status().isOk());

        // Validate the GeneAlias in the database
        List<GeneAlias> geneAliasList = geneAliasRepository.findAll();
        assertThat(geneAliasList).hasSize(databaseSizeBeforeUpdate);
        GeneAlias testGeneAlias = geneAliasList.get(geneAliasList.size() - 1);
        assertThat(testGeneAlias.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void patchNonExistingGeneAlias() throws Exception {
        int databaseSizeBeforeUpdate = geneAliasRepository.findAll().size();
        geneAlias.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGeneAliasMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, geneAlias.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(geneAlias))
            )
            .andExpect(status().isBadRequest());

        // Validate the GeneAlias in the database
        List<GeneAlias> geneAliasList = geneAliasRepository.findAll();
        assertThat(geneAliasList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchGeneAlias() throws Exception {
        int databaseSizeBeforeUpdate = geneAliasRepository.findAll().size();
        geneAlias.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGeneAliasMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(geneAlias))
            )
            .andExpect(status().isBadRequest());

        // Validate the GeneAlias in the database
        List<GeneAlias> geneAliasList = geneAliasRepository.findAll();
        assertThat(geneAliasList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamGeneAlias() throws Exception {
        int databaseSizeBeforeUpdate = geneAliasRepository.findAll().size();
        geneAlias.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGeneAliasMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(geneAlias))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the GeneAlias in the database
        List<GeneAlias> geneAliasList = geneAliasRepository.findAll();
        assertThat(geneAliasList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteGeneAlias() throws Exception {
        // Initialize the database
        geneAliasRepository.saveAndFlush(geneAlias);

        int databaseSizeBeforeDelete = geneAliasRepository.findAll().size();

        // Delete the geneAlias
        restGeneAliasMockMvc
            .perform(delete(ENTITY_API_URL_ID, geneAlias.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<GeneAlias> geneAliasList = geneAliasRepository.findAll();
        assertThat(geneAliasList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
