package edu.txstate.its.gato.setup;

import javax.jcr.Session;
import javax.jcr.RepositoryException;
import javax.jcr.PathNotFoundException;
import javax.jcr.LoginException;

import info.magnolia.init.MagnoliaConfigurationProperties;
import info.magnolia.jcr.util.PropertyUtil;
import info.magnolia.module.delta.TaskExecutionException;
import info.magnolia.module.InstallContext;
import info.magnolia.objectfactory.Components;
import info.magnolia.repository.RepositoryConstants;

import java.io.IOException;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Convert old ITS Streaming media urls to their corresponding Mediaflo url.
 */
public class ConvertStreamingLinksTask extends GatoBaseUpgradeTask {

  private static final Logger log = LoggerFactory.getLogger(Gato5MigrationTask.class);

  public ConvertStreamingLinksTask(String name, String description) {
    super(name, description);
  }

  protected void doExecute(InstallContext ctx) throws RepositoryException, PathNotFoundException, TaskExecutionException, LoginException {
    Session hm=ctx.getJCRSession(RepositoryConstants.WEBSITE);

    HashMap<String, String> urlMap = new HashMap<String, String>();

    MagnoliaConfigurationProperties mcp = Components.getComponent(MagnoliaConfigurationProperties.class);
    String fileName = mcp.getProperty("gato.streamcsvfile");
    if (fileName == null) {
      log.warn("Couldn't find gato.streamcsvfile property, skipping task...");
      return;
    }
    File csvFile = new File(fileName);

    CSVParser parser;
    try {
      parser = CSVParser.parse(csvFile, StandardCharsets.UTF_8, CSVFormat.DEFAULT.withHeader("oldUrl", "newUrl"));
    } catch(IOException e) {
      e.printStackTrace();
      log.warn("Couldn't load csv file with url mapping from " + fileName + ". Skipping task...");
      return;
    }
      
    for (CSVRecord record : parser) {
      urlMap.put(record.get("oldUrl"), record.get("newUrl"));
    }

    visitByTemplate(hm, "gato:components/texasState/texas-streaming", n -> {
      String oldUrl = PropertyUtil.getString(n, "videourl", "");
      if (urlMap.containsKey(oldUrl)) {
        n.getProperty("videourl").setValue(urlMap.get(oldUrl));
      }
    });
  }
}
