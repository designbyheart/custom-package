package test.java.funcModules;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;
import test.java.appModules.AppPageInjector;
import test.java.appModules.RestApi;
import java.util.List;

/**
 * The CredentialModules class is to implement method related to Credentials
 * 
 */
public class CredentialModules extends AppPageInjector {

	RestApi restApiObj = new RestApi();

	/**
	 * accept the Credentials from connect me app
	 * 
	 * @param driver - appium driver available for session
	 * @return void
	 */

	public void acceptCredential(AppiumDriver driver, boolean useMyConnections, boolean ignore) throws Exception {
		if (useMyConnections) {
			homePageV2.burgerMenuButton(driver).click();
			menuPageV2.myConnectionsButton(driver).click();
			myConnectionsPageV2.testConnection(driver).click();
			List<WebElement> viewButtons = myConnectionsPageV2.viewButtonsList(driver);
			viewButtons.get(viewButtons.size() - 1).click(); // click the last one
		}
		else {
			homePageV2.newMessage(driver).isEnabled();
			homePageV2.newMessage(driver).click();
		}
		if (ignore) {
			credentialPage.ignore_Button(driver).isEnabled();
			credentialPage.ignore_Button(driver).click();
		}
		else {
			credentialPage.accept_Button(driver).isEnabled();
			credentialPage.accept_Button(driver).click();
			Thread.sleep(45000);  //  sync issue - just for accepting
		}
	}

	/**
	 * to check insufficient balance case for paid credential
	 * 
	 * @param driver - appium driver available for session
	 * @return void
	 */

	public void checkNSF(AppiumDriver driver) throws Exception {
		Thread.sleep(10000);
		credentialPage.accept_Button(driver).click();
		credentialPage.nsf_Button(driver).click();

	}

}
