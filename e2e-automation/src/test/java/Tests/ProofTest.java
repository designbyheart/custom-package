
package test.java.Tests;

import org.testng.annotations.*;

import com.google.inject.Guice;
import com.google.inject.Injector;

import test.java.appModules.AppInjector;
import test.java.appModules.AppUtils;
import test.java.appModules.RestApi;
import test.java.funcModules.ConnectionModules;
import test.java.utility.Config;
import test.java.utility.IntSetup;

/**
 * The ProofTest class is a Test class which holds test method related to proof
 */
public class ProofTest extends IntSetup {

	RestApi objRestApi = new RestApi();
	Injector injector = Guice.createInjector(new AppInjector());		
	ConnectionModules objConnectionModules = injector.getInstance(ConnectionModules.class);
	AppUtils objAppUtlis = injector.getInstance(AppUtils.class);

	@BeforeClass
	public void BeforeClass() throws Exception{
		connectionID = RestApi.readConfig("connectionID");
		driver = IntSetup.configureDriver(Config.Device_Type,"connectMe");
		Thread.sleep(3000);
		objAppUtlis.enterPincode(driver);
	}

	/**
	 * Test to create proof via ConnectMe app
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" }, enabled = false)
	public void createMultipleClaimProofTest() throws Exception {
		multipleClaimProofID = objAppUtlis.createProof(
				"{\"name\":\"Degree\"}"
		);
	}
	
	/**
	 * Test to select claim for different credential and send proof via connect me app
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" }, enabled = false)
	public void sendAndSelectClaimProofTest() throws Exception {
		objAppUtlis.sendAndSelectClaimProof(driver, connectionID, multipleClaimProofID);
	}
	
	/**
	 * Test to select claim for different credential and send proof via connect me app
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" }, enabled = false)
	public void verifySharedProof() throws Exception {
		objAppUtlis.verifySharedProof(driver);
	}
	
	/**
	 * Test to create proof
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" })
	public void createProofTest() throws Exception {
		proofID = objAppUtlis.createProof(
				"{\"name\":\"Name\"},{\"name\":\"PhoneNo\"}"
		);
	}

	/**
	 * Test to send proof via ConnectMe app
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "createProofTest")
	public void sendProofTest() throws Exception {
		objAppUtlis.sendAndAcceptProof(driver, connectionID, proofID, false);
	}

	/**
	 * Test to create proof for multiple credentials via ConnectMe app
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "sendProofTest")
	public void createMultipleProofTest() throws Exception {
		multipleProofID = objAppUtlis.createProof(
				"{\"name\":\"Name\"},{\"name\":\"Social Security Number\"},{\"name\":\"Degree\"}"
		);
	}

	/**
	 * Test to send single proof for multiple credentials via ConnectMe app
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "createMultipleProofTest")
	public void sendMultipleProofTest() throws Exception {
		objAppUtlis.sendAndAcceptProof(driver, connectionID, multipleProofID, false);
	}
	

	/**
	 * Test to create proof to test self attested proof
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "sendMultipleProofTest")
	public void createSelfAttestedProofTest() throws Exception {
		selfAttestedProofID = objAppUtlis.createProof(
				"{\"name\":\"Name\"},{\"name\":\"Social Security Number\"},{\"name\":\"Degree\"},{\"name\":\"Age\"}"
		);
	}

	/**
	 * Test to send self attested proof via ConnectMe app
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "createSelfAttestedProofTest")
	public void sendSelfAttestedProofTest() throws Exception {
		objAppUtlis.sendSelfAttestedProof(driver, connectionID, selfAttestedProofID);
	}
	
	@AfterClass
	public void AfterClass() {
//		    driver.removeApp("me.connect");
			driver.quit();
	}

}