package test.java.pageObjectsiOS;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.ConnectionHistoryPage;

import org.openqa.selenium.WebElement;

/**
 * The ConnectionHistoryPageiOS class is to hold webelement for ConnectionHistory Page iOS
 * 
 */
public class ConnectionHistoryPageiOS implements ConnectionHistoryPage {

	public  WebElement close_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver,
				"//XCUIElementTypeOther[@name='connection-history-icon-close-touchable']", "Close Button");

	}

	public  WebElement received_Status(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[contains(@name, 'RECEIVED')]",
				"Received Status");

	}

	public  WebElement delete_Icon(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[@name='connection-history-icon-delete-touchable']",
				"Delete Icon");

	}
	
	public  WebElement delete_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeButton[@name='Delete']",
				"Delete Button");

	}
	
	public  WebElement shared_Button(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver, "	//XCUIElementTypeOther[contains(@name, 'SHARED ProofTestAuto')]",
				"SHARED Proof Button");
	}
	
	public  WebElement atrribute_Text(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeText[@name='custom-list-data-0']",
				"Attribute Text");
	}
}
