package test.java.pageObjectsiOS;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.ProofRequestPage;

import org.openqa.selenium.WebElement;

/**
 * The ProofRequestPageiOS class is to hold webelement for ProofRequest Page for iOS
 * 
 */
public class ProofRequestPageiOS implements ProofRequestPage {

	public  WebElement generate_Button(AppiumDriver driver) throws Exception {

		return null;

	}

	public  WebElement send_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[@name='proof-request-accept']", "Send Button");

	}

	public  WebElement ignore_Button(AppiumDriver driver) throws Exception {
	// FIXME
		return AppiumUtils.findElement(driver, "", "Ignore Button");

	}

	public  WebElement continue_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[@name='send-proof-success-continue']",
				"Continue Button");
	}

	public  WebElement age_TextBox(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver,"//XCUIElementTypeTextView[@name='proof-request-attribute-item-input-age']", "Age TextBox");
	}
	
	public  WebElement ok_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver,"//XCUIElementTypeButton[@name='OK']", "OK Button");
	}
	
	public  WebElement firstAttribute_Box(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver,
				"(//XCUIElementTypeOther[@name='proof-request-attribute-item-0'])[2]", "FirstAttribute Box");
	}
		
}
