package test.java.Tests;

import com.google.inject.Guice;
import com.google.inject.Injector;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import test.java.appModules.AppInjector;
import test.java.appModules.AppUtils;
import test.java.appModules.AppiumUtils;
import test.java.appModules.RestApi;
import test.java.utility.Config;
import test.java.utility.IntSetup;

public class ProofTestV2 extends IntSetup{
    Injector injector = Guice.createInjector(new AppInjector());
    AppUtils objAppUtlis = injector.getInstance(AppUtils.class);

    @BeforeClass
    public void BeforeClassSetup() throws Exception {
        connectionID = RestApi.readConfig("connectionID");
        driver = IntSetup.configureDriver(Config.Device_Type, "connectMe");
        Thread.sleep(3000);
        objAppUtlis.enterPincode(driver);
    }

    // TODO probably it can be made as one parametrized test

    @Test
    public void sendProofFromHome() throws Exception {
        // one proof
        String proofData =
                        "{\"name\":\"FirstName\"}," +
                        "{\"name\":\"Years\"}";
        String proofID = objAppUtlis.createProof(proofData);
        objAppUtlis.sendAndAcceptProof(driver, connectionID, proofID, false, false);
    }

    @Test(dependsOnMethods = "sendProofFromHome")
    public void sendProofFromMyConnections() throws Exception {
        // another proof
        String proofData =
                        "{\"name\":\"LastName\"}," +
                        "{\"name\":\"Years\"}";
        String proofID = objAppUtlis.createProof(proofData);
        objAppUtlis.sendAndAcceptProof(driver, connectionID, proofID, true, false);
        AppiumUtils.tapBack(driver, 2);
    }

    @Test(dependsOnMethods = "sendProofFromMyConnections")
    public void ignoreProofFromHome() throws Exception {
        // one proof
        String proofData =
                        "{\"name\":\"FirstName\"}," +
                        "{\"name\":\"Status\"}";
        String proofID = objAppUtlis.createProof(proofData);
        objAppUtlis.sendAndAcceptProof(driver, connectionID, proofID, false, true);
    }

    @Test(dependsOnMethods = "ignoreProofFromHome")
    public void ignoreProofFromMyConnections() throws Exception {
        // another proof
        String proofData =
                        "{\"name\":\"LastName\"}," +
                        "{\"name\":\"Status\"}";
        String proofID = objAppUtlis.createProof(proofData);
        objAppUtlis.sendAndAcceptProof(driver, connectionID, proofID, true, true);
    }

    @AfterClass
    public void AfterClass() {
        driver.quit();
    }

}
