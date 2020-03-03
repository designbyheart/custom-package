package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.CredentialPage;

import org.openqa.selenium.WebElement;

/**
 * The CredentialPageAndroid class is to hold webelement for Credentials Page
 * for Android
 * 
 */
public class CredentialPageAndroid implements CredentialPage {

	
	public WebElement accept_Button(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver, "//*[@text=\"Accept\"]", "Accept Button");
	}

	
	public WebElement continue_Button(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver,
				"//android.view.ViewGroup[@content-desc='claim-request-success-continue']", "Continue Button ",2);
	}

	
	public WebElement nsf_Button(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver,
				"//android.view.ViewGroup[@content-desc='no-sufficient-balance-success-continue']", "nsf Button");
	}
}
