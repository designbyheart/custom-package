package test.java.pageObjectsiOS;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.HomePage;

import org.openqa.selenium.WebElement;

/**
 * The HomePageiOS class is to hold webelement for Home Page for iOS  
 * 
 */
public class HomePageiOS implements HomePage {

	public  WebElement setting_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[@name='tab-bar-settings-icon']","Setting Button"); 
	}


	public  WebElement connection_Bubble(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[contains(@name, 'bubble')]",
				"Connection bubble");

	}


	public  WebElement received_Status(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[contains(@name, 'RECEIVED')]",
				"Received_Status");

	}
	
	public  WebElement user_Avatar(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[@name='user-avatar-touchable']",
				"User Avatar");

	}
	
	public  WebElement sovrinToken_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[@name='home-sovrintoken-amount-touchable']",
				"SovrinToken_Button");

	}
	
	

}
