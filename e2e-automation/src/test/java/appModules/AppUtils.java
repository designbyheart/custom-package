package test.java.appModules;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.AndroidKeyCode;
import test.java.funcModules.CredentialModules;
import test.java.funcModules.ProofModules;
import test.java.pageObjects.ConnectionHistoryPage;
import test.java.pageObjects.HomePage;
import test.java.pageObjects.InvitationPage;
import test.java.pageObjects.PincodePage;
import test.java.utility.Config;
import test.java.utility.IntSetup;

import java.util.HashMap;

import org.junit.Assert;
import org.testng.Reporter;
import org.testng.SkipException;
import org.testng.annotations.Test;

import com.google.inject.Guice;
import com.google.inject.Inject;
import com.google.inject.Injector;

/** 
 * The AppUtlis class is to implement ConnectMe app utility methods
 * 
 */
public class AppUtils extends AppPageInjector{
	
	public static boolean Success = false;
	RestApi objRestApi = new RestApi();
	Injector injector = Guice.createInjector(new AppInjector());		
	CredentialModules objCredentialModules = injector.getInstance(CredentialModules.class);
	ProofModules objProofModules = injector.getInstance(ProofModules.class);

	/**
	 * Accepts or reject connection request
	 * @param  driver - appium driver available for session
	 * @param  requestType-according to which connection is accepted or rejected
	 * @param  pushNotification-according to which push notification is allowed or denied

	 * @return void
	 */
	public void requestProvisioning(AppiumDriver driver, String requestType, String pushNotification) throws Exception {
		if (requestType == "Accept") {
			AppiumUtils.findElement(driver, "//*[@text=\"Connect\"]","Connect Button").click();
		} else {
			// TODO
		}
		if(pushNotification=="allow")
		try {
			driver.switchTo().alert().accept();//handling  alerts
		} catch (Exception e) {

		}
		else
		try {
			System.out.println("dismiss the allert");
			driver.switchTo().alert().dismiss();//handling alerts
		} catch (Exception e) {

		}

	}
	
	/**
	 * enters the pincode on pincode page
	 * @param  driver - appium driver available for session
	 * @return void
	 */
	public void enterPincode(AppiumDriver driver) throws Exception {
		if((Config.Device_Type.equals("iOS")||Config.Device_Type.equals("awsiOS")))
		{
		pincodePage.pinCode_TextBox(driver).sendKeys("000000");
		}
		else
		{	
			Thread.sleep(3000);  //  sync issue
			AndroidDriver androidDriver = (AndroidDriver) driver;
			for(int i=0;i<6;i++)
			{
				androidDriver.pressKeyCode(AndroidKeyCode.KEYCODE_0);
			}
		}
	}

	/**
	 * enters the reverse pincode  on pincode page
	 * @param  driver - appium driver available for session
	 * @return void
	 */
	public void enterPincodeReverse(AppiumDriver driver) throws Exception {
		
		pincodePage.pinCode_TextBox(driver).sendKeys("654321");

	}

	/**
	 * To Check previous test case passed or not
	 */
	public void checkSkip() throws Exception {
		if (!AppUtils.Success) {
			throw new SkipException("Skipping this exception");  //  if previous test case ,skipping current test case
		}
		AppUtils.Success = false;
	}
	
	/**
	 * To create schema
	 * @param attribute -attribute for schema
	 * @return schemaSeqNo- schema no of schema
	 */
	public String createSchema(String attribute) throws Exception {
		HashMap<String, String> createSchemaResponse = objRestApi.createSchema(attribute);
		String schemaSeqNo = objRestApi.getKeyValue(createSchemaResponse, "schemaId");		
		checkEmpty(schemaSeqNo,createSchemaResponse.toString());
		return schemaSeqNo;
    }
	
	/**
	 * To create credential
	 * @param schemaSeqNo -schema for which credential will be created
	 * @return schemaSeqNo- schema no of schema
	 */
	public String createCredentialDef(String schemaSeqNo, String price) throws Exception {
		HashMap<String, String> createCredentialDefResponse = objRestApi.createCredentialDef(schemaSeqNo, price);
		String credentialDefID = objRestApi.getKeyValue(createCredentialDefResponse, "id");
		checkEmpty(credentialDefID, createCredentialDefResponse.toString());
		return credentialDefID;
	}
	
	/**
	 * To send credential and accept it from ConnectMe app
	 * @param connectionID -Connection for which credential need to be send
	 * @param credentialDefID-credential which need to be send
	 * @param attribute-attributes for credential	
	 * @return void
	 */
	public void sendCredentialAndAccept(
			AppiumDriver driver, String connectionID, String credentialDefID, String attribute, String price, boolean useMyConnections
	) throws Exception {
		HashMap<String, String> statusCredential;
		System.out.println(connectionID+" connectionID");
		System.out.println(credentialDefID+" credentialDefID");
		HashMap<String, String> sendCredentialDefResponse = objRestApi.sendCredential(connectionID, credentialDefID, attribute, price);
		String credentialID = objRestApi.getKeyValue(sendCredentialDefResponse, "id");
		checkEmpty(credentialDefID, sendCredentialDefResponse.toString());
		Thread.sleep(15000);
		objCredentialModules.acceptCredential(driver, useMyConnections);
		statusCredential=objRestApi.get("/api/v1/credentials", credentialID);
		String statusCredentialStr =objRestApi.getKeyValue(statusCredential, "state");
		objRestApi.poll(statusCredentialStr, "4", credentialID, "credentials");
	}
	
	/**
	 * To create proof
	 * @return proofID- id of created proof
	 */
	public String createProof(String fields) throws Exception {
		HashMap<String, String> createProofResponse = objRestApi.createProof(fields);
		String proofID = objRestApi.getKeyValue(createProofResponse, "id");
		checkEmpty(proofID, createProofResponse.toString());
		return proofID;
	}
	
	/**
	 * To send proof from ConnectMe app
	 * @param connectionID -Connection for which proof need to be send
	 * @param proofID-proof which need to be send
	 * @return void
	 */
	public void sendAndAcceptProof(AppiumDriver driver, String connectionID, String proofID) throws Exception {
		HashMap<String, String> sendProofResponse = objRestApi.sendProof(connectionID, proofID);
		String sendProofID = objRestApi.getKeyValue(sendProofResponse, "id");
		checkEmpty(sendProofID, sendProofResponse.toString());
		Thread.sleep(15000);
		objProofModules.sendProof(driver); 
		HashMap<String, String> statusProof = objRestApi.get("/api/v1/proofs",sendProofID);
		String statusProofStr = objRestApi.getKeyValue(statusProof, "state");
		objRestApi.poll(statusProofStr, "4", sendProofID, "proofs");
	}
	
	/**
	 * To send proof from verity UI
	 * @param connectionID -Connection for which proof need to be send
	 * @param proofID-proof which need to be send
	 * @return void
	 */
	public String sendProof(AppiumDriver driver, String connectionID, String proofID) throws Exception {
		HashMap<String, String> sendProofResponse = objRestApi.sendProof(connectionID, proofID);
		String sendProofID = objRestApi.getKeyValue(sendProofResponse, "id");
		checkEmpty(sendProofID,sendProofResponse.toString());
		return null;
	}
	
	/**
	 * To send proof from ConnectMe app
	 * @param sendProofID -proof which need to be send
	 * @return void
	 */
	public void AcceptProof(AppiumDriver driver, String sendProofID) throws Exception {
        objProofModules.sendProof(driver); 
		HashMap<String, String> statusProof=objRestApi.get("/api/v1/proofs",sendProofID);
		String statusProofStr =objRestApi.getKeyValue(statusProof, "state");
		objRestApi.poll(statusProofStr, "4", sendProofID, "proofs");
	}
	
	/**
	 * To select claim from multiple credentials and send proof from ConnectMe app
	 * @param connectionID -Connection for which proof need to be send
	 * @param proofID-proof which need to be send
	 * @return void
	 */
	public void sendAndSelectClaimProof(AppiumDriver driver, String connectionID, String proofID) throws Exception {
		HashMap<String, String> sendProofResponse = objRestApi.sendProof(connectionID, proofID);
		String sendProofID = objRestApi.getKeyValue(sendProofResponse, "id");
		checkEmpty(sendProofID,sendProofResponse.toString());
		objProofModules.sendAndSelectProof(driver); 
		HashMap<String, String> statusProof = objRestApi.get("/api/v1/proofs",sendProofID);
		String statusProofStr = objRestApi.getKeyValue(statusProof, "state");
		objRestApi.poll(statusProofStr, "4", sendProofID, "proofs");

	}

	/**
	 * To send self attested proof from ConnectMe app
	 * @param connectionID -Connection for which proof need to be send
	 * @param proofID-proof which need to be send
	 * @return void
	 */
	public void sendSelfAttestedProof(AppiumDriver driver, String connectionID, String proofID) throws Exception {
		HashMap<String, String> sendProofResponse = objRestApi.sendProof(connectionID, proofID);
		String sendProofID = objRestApi.getKeyValue(sendProofResponse, "id");
		checkEmpty(sendProofID,sendProofResponse.toString());
		objProofModules.sendSelfAttestedProof(driver);
		HashMap<String, String> statusProof = objRestApi.get("/api/v1/proofs",sendProofID);
		String statusProofStr = objRestApi.getKeyValue(statusProof, "state");
		objRestApi.poll(statusProofStr, "4", sendProofID, "proofs");

	}

	/**
	 * To send credential
	 * @param connectionID -Connection for which credential need to be send
	 * @param credentialDefID-credential which need to be send
	 * @param attribute-attributes for credential	
	 * @return credentialID
	 */
	public String sendCredential(AppiumDriver driver, String connectionID, String credentialDefID, String attribute, String price) throws Exception {
		HashMap<String, String> sendCredentialDefResponse = objRestApi.sendCredential(connectionID, credentialDefID, attribute, price);
		String credentialID = objRestApi.getKeyValue(sendCredentialDefResponse, "id");
		return credentialID;
	}
	
	/**
	 * To accept credential  from ConnectMe app
	 * @param credentialID -credential which need to be accepted
	 * @return void
	 */
	public void acceptCredential(AppiumDriver driver, String credentialID, boolean useMyConnections) throws Exception {
		HashMap<String, String> statusCredential;
		objCredentialModules.acceptCredential(driver, useMyConnections);
		Thread.sleep(5000);
		statusCredential=objRestApi.get("/api/v1/credentials", credentialID);
		String statusCredentialStr =objRestApi.getKeyValue(statusCredential, "state");
		objRestApi.poll(statusCredentialStr, "4", credentialID, "credentials");
		Thread.sleep(10000);

	}
	
	/**
	 * To accept credential  from ConnectMe app
	 * @return void
	 */
	public void verifySharedProof(AppiumDriver driver) throws Exception {
		homePage.connection_Bubble(driver).click();
		connectionHistoryPage.shared_Button(driver).click();
		String attributeValue=connectionHistoryPage.atrribute_Text(driver).getAttribute("value");   
		if(!attributeValue.equals(ProofModules.selectedAttribute))
		{
			Assert.assertTrue(false);
		}
	}
	
	public void checkEmpty(String valueCheck,String dispayError)
	{
		if (valueCheck != null && !valueCheck.isEmpty())
		{
			System.out.println("The value for ID is "+ valueCheck);
		}
		else
		{
			Reporter.log (dispayError);
			Assert.assertTrue(false);
		}
		
	}	
}
