package org.mskcc.oncokb.transcript.service;

import java.io.IOException;
import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;

import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.errors.ApiException;
import com.google.maps.model.GeocodingResult;
import jodd.util.StringUtil;
import org.mskcc.oncokb.transcript.OncokbTranscriptApp;
import org.mskcc.oncokb.transcript.config.ApplicationProperties;
import org.mskcc.oncokb.transcript.config.model.AactConfig;
import org.mskcc.oncokb.transcript.domain.Site;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AactService {

    private static final Logger log = LoggerFactory.getLogger(OncokbTranscriptApp.class);

    ApplicationProperties applicationProperties;
    SiteService siteService;

    final String AACT_URL = "aact-db.ctti-clinicaltrials.org";
    final int AACT_PORT = 5432;
    final String AACT_DB_NAME = "aact";
    final String AACT_CONNECTION_STR = "jdbc:postgresql://" + AACT_URL + ":" + AACT_PORT + "/" + AACT_DB_NAME;

    public AactService(ApplicationProperties applicationProperties, SiteService siteService) throws Exception {
        this.applicationProperties = applicationProperties;
        this.siteService = siteService;
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
        Set<String> meshTerms = getMeshTerms();

        Set<String> filteredTerms = meshTerms.stream().filter(meshTerm -> meshTerm.contains(",")).collect(Collectors.toSet());
        // Step 2 - Get a list of NCT IDs from browse_conditions where mesh_term comes from the step 1
        Set<String> nctIds = getNctIdsByMeshTerms(filteredTerms);

        // Step 3 - Get the trials using the list above
        getTrials(nctIds);

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
        Set<String> oneNctId = new HashSet<>();
        oneNctId.add(nctIds.stream().findFirst().get());
        getSites(oneNctId);
        // Step 6 - Update info table
    }

    private Set<String> getMeshTerms() throws Exception {
        Statement stm = getAactConnection().createStatement();
        ResultSet resultSet = stm.executeQuery("select mesh_term from mesh_terms where qualifier='C04'");

        Set<String> meshTerms = new HashSet<>();
        while (resultSet.next()) {
            String meshTerm = resultSet.getString("MESH_TERM");
            if (StringUtil.isNotEmpty(meshTerm)) {
                meshTerms.add(meshTerm);
            }
        }
        resultSet.close();
        stm.close();
        return meshTerms;
    }

    private Set<String> getNctIdsByMeshTerms(Set<String> meshTerms) throws Exception {
        Statement stm = getAactConnection().createStatement();

        meshTerms = new HashSet<>(wrapSqlStringInClause(new ArrayList<>(meshTerms)));

        String NCT_ID_KEY = "NCT_ID";
        String query = "select distinct " + NCT_ID_KEY + " from browse_conditions where mesh_term in (" + String.join(",", meshTerms) + ")";
        ResultSet resultSet = stm.executeQuery(query);

        Set<String> trials = new HashSet<>();
        while (resultSet.next()) {
            String trialId = resultSet.getString(NCT_ID_KEY);
            if (StringUtil.isNotEmpty(trialId)) {
                trials.add(trialId);
            }
        }
        resultSet.close();
        stm.close();
        return trials;
    }

    private Set<String> getTrials(Set<String> nctIds) throws Exception {
        Statement stm = getAactConnection().createStatement();
        String NCT_ID_KEY = "NCT_ID";
        String STUDY_TYPE_KEY = "STUDY_TYPE";
        String BRIEF_TITLE_KEY = "BRIEF_TITLE";
        String OVERALL_STATUS_KEY = "OVERALL_STATUS";
        String LAST_KNOWN_STATUS_KEY = "LAST_KNOWN_STATUS";
        String PHASE_KEY = "PHASE";
        String[] keys = new String[] { NCT_ID_KEY, STUDY_TYPE_KEY, BRIEF_TITLE_KEY, OVERALL_STATUS_KEY, LAST_KNOWN_STATUS_KEY, PHASE_KEY };
        ResultSet resultSet = stm.executeQuery(
            "select " +
            String.join(",", keys) +
            " from studies where nct_id in (" +
            String.join(",", wrapSqlStringInClause(new ArrayList<>(nctIds))) +
            ")"
        );

        Set<String> trials = new HashSet<>();
        while (resultSet.next()) {
            String trialId = resultSet.getString(NCT_ID_KEY);
            if (StringUtil.isNotEmpty(trialId)) {
                trials.add(trialId);
            }
        }
        resultSet.close();
        stm.close();
        return trials;
    }

    private String getCoordinatesString(Double lat, Double lon) {
        return lat + "," + lon;
    }

    private Optional<GeocodingResult> getCoordinates(String address) throws IOException, InterruptedException, ApiException {
        GeoApiContext context = new GeoApiContext.Builder()
            .apiKey(applicationProperties.getGoogleCloud().getApiKey())
            .build();
        GeocodingResult[] results = GeocodingApi.geocode(context, address).await();
        return Optional.ofNullable(Arrays.stream(results).iterator().next());
    }

    private void getSites(Set<String> nctIds) throws Exception {
        String nctIdList = String.join(",", wrapSqlStringInClause(new ArrayList<>(nctIds)));
        Statement stm = getAactConnection().createStatement();
        ResultSet resultSet = stm.executeQuery(
            "select f.nct_id as \"nct_id\", f.name as \"name\", f.city as \"city\", f.state as \"state\", f.zip as \"zip\", f.country as \"country\", fi.name as \"pi_name\", fc.email as \"pi_email\", fc.phone as \"pi_phone\"\n" +
            "        from facilities f,\n" +
            "             facility_contacts fc,\n" +
            "             facility_investigators fi\n" +
            "        where f.id = fc.facility_id\n" +
            "          and f.id = fi.facility_id\n" +
            "          and fc.contact_type = 'primary'\n" +
            "          and f.nct_id in (" +
            nctIdList +
            ")"
        );

        Set<String> trials = new HashSet<>();
        while (resultSet.next()) {
            List<String> queryParams = new ArrayList<>();

            String fName = resultSet.getString("name");
            buildQuery(queryParams, fName);

            String city = resultSet.getString("city");
            buildQuery(queryParams, city);

            String state = resultSet.getString("state");
            buildQuery(queryParams, state);


            String country = Optional.ofNullable(resultSet.getString("country")).orElse("");
            buildQuery(queryParams, country);


            Optional<Site> siteOptional = siteService.findOneByNameAndCityAndCountry(fName, city, country);
            if (siteOptional.isEmpty()) {
                Site site = new Site();
                site.setCountry(country);
                site.setCity(city);
                site.setName(fName);
                site.setState(state);

                Optional<GeocodingResult> mapResult = getCoordinates(String.join(",", queryParams));
                if (mapResult.isPresent()) {
                    site.setCoordinates(getCoordinatesString(Optional.ofNullable(mapResult.get().geometry.location.lat).orElse(null), Optional.ofNullable(mapResult.get().geometry.location.lng).orElse(null)));
                }
                log.warn(site.toString());
                siteService.save(site);
            }
        }
        resultSet.close();
        stm.close();
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


    private void buildQuery(List<String> queryParams, String value) {
        if (StringUtil.isNotEmpty(value)) {
            queryParams.add(value.replaceAll("[,\\s]", "+").replaceAll("[\\+]+", "+"));
        }
    }

    private List<String> wrapSqlStringInClause(List<String> strings) {
        return strings
            .stream()
            .map(
                term -> {
                    if (term.contains("'")) {
                        term = term.replace("'", "''");
                    }
                    return "'" + term + "'";
                }
            )
            .collect(Collectors.toList());
    }
}
