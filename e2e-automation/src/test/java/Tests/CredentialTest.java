
package test.java.Tests;

import org.testng.annotations.*;
import com.google.inject.Guice;
import com.google.inject.Injector;

import test.java.appModules.AppInjector;
import test.java.appModules.AppUtils;
import test.java.appModules.RestApi;
import test.java.funcModules.CredentialModules;
import test.java.utility.Config;
import test.java.utility.IntSetup;

/**
 * The CredentialsTest class is a Test class which holds test
 * method related to credentials
 */
public class CredentialTest extends IntSetup {

	RestApi objRestApi = new RestApi();
	Injector injector = Guice.createInjector(new AppInjector());		
	CredentialModules objCredentialModules = injector.getInstance(CredentialModules.class);
	AppUtils objAppUtlis = injector.getInstance(AppUtils.class);

	@BeforeClass
	public void BeforeClass() throws Exception{
		connectionID = RestApi.readConfig("connectionID");
		driver = IntSetup.configureDriver(Config.Device_Type,"connectMe");
		Thread.sleep(3000);
		objAppUtlis.enterPincode(driver);
	}

	/**
	 * Test to create schema
	 * @return  void
	 */
	@Test(groups = { "Smoke", "Regression" })
	public void createSchemaTest() throws Exception {
		schemaSeqId1 = objAppUtlis.createSchema(
				"{\"constraints\":[],\"name\":\"Name\",\"type\":0},{\"constraints\":[],\"name\":\"PhoneNo\",\"type\":0}"
		);
	}
	
	/**
	 * Test to create credentials
	 * @return  void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "createSchemaTest")
	public void createCredentialDefTest() throws Exception {
		credentialDefID1 = objAppUtlis.createCredentialDef(schemaSeqId1,"0");
	}
	
	
	
	/** 
	 * Test to send credentials, accept it from ConnectMe app
	 * @return  void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "createCredentialDefTest")
	public void sendCredentialTest() throws Exception {
		String data = "{\"name\":\"Name\",\"type\":0,\"value\":\"Alex\"},{\"name\":\"PhoneNo\",\"type\":0,\"value\":\"9177315382\"}";
		objAppUtlis.sendCredentialAndAccept(driver, connectionID, credentialDefID1, data,"0");
	}
	
	/** 
	 * Test to send paid credentials and check for nsf  from ConnectMe app
	 * @return  void
	 */
	@Test(groups = { "Smoke", "Regression" }, enabled = false)  // requires non-zero token balance and some agreement accepting
	public void sendCredentialNSFTest() throws Exception {
		String data="{\"name\":\"Name\",\"type\":0,\"value\":\"Alex\"},{\"name\":\"PhoneNo\",\"type\":0,\"value\":\"9177315382\"}";
		objAppUtlis.sendCredential(driver, connectionID, credentialDefID1, data,"10");
		objCredentialModules.checkNSF(driver);
	}
	
	/**
	 * Test to create second schema
	 * @return  void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "sendCredentialTest")
	public void createMultipleSchemaTest() throws Exception {
		schemaSeqId2=objAppUtlis.createSchema(
				"{\"constraints\":[],\"name\":\"Name\",\"type\":0},{\"constraints\":[],\"name\":\"Degree\",\"type\":0},{\"constraints\":[],\"name\":\"Social Security Number\",\"type\":0}"
		);
	}
	
	/**
	 * Test to create second Credential
	 * @return  void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "createMultipleSchemaTest")
	public void createMultipleCredentialDefTest() throws Exception {
		credentialDefID2 = objAppUtlis.createCredentialDef(schemaSeqId2,"0");
	}
	
	
	/**
	 * Test to send second credentials and accept it from ConnectMe app
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "createMultipleCredentialDefTest")
	public void sendMultipleCredentialTest1() throws Exception {
		String data="{\"name\":\"Name\",\"type\":0,\"value\":\"Alex\"},{\"name\":\"Degree\",\"type\":0,\"value\":\"MBA\"},{\"name\":\"Social Security Number\",\"type\":0,\"value\":\"38632362362\"}";
		objAppUtlis.sendCredentialAndAccept(driver, connectionID, credentialDefID2, data,"0");
	}
	
	/**
	 * Test to send same credential for different credential and accept it from ConnectMe app
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "sendMultipleCredentialTest1")
	public void sendMultipleCredentialTest2() throws Exception {
		String data="{\"name\":\"Name\",\"type\":0,\"value\":\"Alex\"},{\"name\":\"Degree\",\"type\":0,\"value\":\"BE\"},{\"name\":\"Social Security Number\",\"type\":0,\"value\":\"38632362362\"}";
		objAppUtlis.sendCredentialAndAccept(driver, connectionID, credentialDefID2, data,"0");
	}

	@AfterClass
	public void AfterClass() {
		driver.quit();
	}

}