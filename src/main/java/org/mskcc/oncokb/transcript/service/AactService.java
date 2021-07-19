package org.mskcc.oncokb.transcript.service;

import java.sql.*;
import java.util.HashSet;
import java.util.Set;
import jodd.util.StringUtil;
import org.mskcc.oncokb.transcript.config.ApplicationProperties;
import org.mskcc.oncokb.transcript.config.model.AactConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AactService {

    ApplicationProperties applicationProperties;

    final String AACT_URL = "aact-db.ctti-clinicaltrials.org";
    final int AACT_PORT = 5432;
    final String AACT_DB_NAME = "aact";
    final String AACT_CONNECTION_STR = "jdbc:postgresql://" + AACT_URL + ":" + AACT_PORT + "/" + AACT_DB_NAME;
    final Connection AACT_CONNECTION;

    public AactService(ApplicationProperties applicationProperties) throws Exception {
        this.applicationProperties = applicationProperties;
        this.AACT_CONNECTION = getAactConnection();
    }

    private Connection getAactConnection() throws Exception {
        AactConfig aactConfig = applicationProperties.getAact();
        if (StringUtil.isNotEmpty(aactConfig.getUsername()) && StringUtil.isNotEmpty(aactConfig.getPassword())) {
            try {
                return DriverManager.getConnection(AACT_CONNECTION_STR, aactConfig.getUsername(), aactConfig.getPassword());
            } catch (SQLException throwables) {
                throwables.printStackTrace();
                throw new Exception("AACT Connection Error", throwables);
            }
        } else {
            throw new Exception("AACT u/p need to be added.");
        }
    }

    public void fetchLatestTrials() throws Exception {
        // Step 1 - Get a list of cancer related mesh terms, qualifier C04
        Statement stm = this.AACT_CONNECTION.createStatement();
        ResultSet resultSet = stm.executeQuery("select mesh_term from mesh_terms where qualifier='C04'");

        Set<String> meshTerms = new HashSet<>();
        while (resultSet.next()) {
            String meshTerm = resultSet.getString("MESH_TERM");
            if (StringUtil.isNotEmpty(meshTerm)) {
                meshTerms.add(meshTerm);
            }
        }
        // Step 2 - Get a list of NCT IDs from browse_conditions where mesh_term comes from the step 1

        // Step 3 - Get the trials using the list above

        // Step 4 - Get interventions -> arm

        /*
        select dg.id, dg.nct_id, i.id, i.intervention_type, i.name
        from design_group_interventions dgi,
             design_groups dg,
             interventions i
        where dgi.design_group_id = dg.id
          and i.id = dgi.intervention_id
          and dg.nct_id = 'NCT02465060';
        */

        // Step 5 - Get sites
        /*
        select f.*, fi.name, fc.email, fc.phone
        from facilities f,
             facility_contacts fc,
             facility_investigators fi
        where f.id = fc.facility_id
          and f.id = fi.facility_id
          and fc.contact_type = 'primary'
          and f.nct_id = 'NCT02465060';
        */
    }
}
