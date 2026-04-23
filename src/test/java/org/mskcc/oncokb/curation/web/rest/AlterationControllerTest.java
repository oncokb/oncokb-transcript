package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.AlterationAnnotationStatus;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.service.MainService;
import org.mskcc.oncokb.curation.web.rest.model.AnnotateAlterationBody;

@ExtendWith(MockitoExtension.class)
class AlterationControllerTest {

    @Mock
    private MainService mainService;

    @Test
    void annotateAlterationsDefaultsNullProteinStartAndEnd() {
        Alteration alteration = new Alteration();
        AlterationAnnotationStatus annotationStatus = new AlterationAnnotationStatus();
        annotationStatus.setEntity(alteration);
        when(mainService.annotateAlteration(any(), any())).thenReturn(annotationStatus);

        AlterationController controller = new AlterationController(mainService);
        Alteration result = controller.annotateAlterations(List.of(createRequest())).getBody().get(0).getEntity();

        assertThat(result.getStart()).isEqualTo(-1);
        assertThat(result.getEnd()).isEqualTo(100_000);
    }

    @Test
    void annotateAlterationsPreservesNonNullProteinStartAndEnd() {
        Alteration alteration = new Alteration().start(600).end(601);
        AlterationAnnotationStatus annotationStatus = new AlterationAnnotationStatus();
        annotationStatus.setEntity(alteration);
        when(mainService.annotateAlteration(any(), any())).thenReturn(annotationStatus);

        AlterationController controller = new AlterationController(mainService);
        Alteration result = controller.annotateAlterations(List.of(createRequest())).getBody().get(0).getEntity();

        assertThat(result.getStart()).isEqualTo(600);
        assertThat(result.getEnd()).isEqualTo(601);
    }

    private AnnotateAlterationBody createRequest() {
        AnnotateAlterationBody request = new AnnotateAlterationBody();
        request.setReferenceGenome(ReferenceGenome.GRCh37);
        request.setAlteration(new Alteration());
        return request;
    }
}
