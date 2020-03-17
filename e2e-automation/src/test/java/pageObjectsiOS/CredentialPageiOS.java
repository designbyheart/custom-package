package test.java.pageObjectsiOS;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.CredentialPage;

import org.openqa.selenium.WebElement;

/**
 * The CredentialPageiOS class is to hold webelement for Credentials Page for iOS 
 * 
 */
public class CredentialPageiOS implements CredentialPage  {

	public  WebElement accept_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[@name='claim-offer-footer-accept']",
				"Accept Button");
	}

	public  WebElement continue_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[@name='claim-request-success-continue']",
				"Continue Button ");

	}

	public WebElement nsf_Button(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

}
