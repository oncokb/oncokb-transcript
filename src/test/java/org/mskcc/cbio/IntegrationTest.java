package org.mskcc.cbio;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mskcc.cbio.RedisTestContainerExtension;
import org.mskcc.cbio.TranscriptApp;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Base composite annotation for integration tests.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(classes = TranscriptApp.class)
@ExtendWith(RedisTestContainerExtension.class)
public @interface IntegrationTest {
}
