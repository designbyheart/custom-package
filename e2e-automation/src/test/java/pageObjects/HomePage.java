package test.java.pageObjects;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;

import org.openqa.selenium.WebElement;

/**
 * The HomePage Interface is to hold webelement for Home Page  
 * 
 */
public interface HomePage {

	public WebElement setting_Button(AppiumDriver driver) throws Exception;
	public WebElement connection_Bubble(AppiumDriver driver) throws Exception;
	public WebElement received_Status(AppiumDriver driver) throws Exception;
	public WebElement user_Avatar(AppiumDriver driver) throws Exception;
	public WebElement sovrinToken_Button(AppiumDriver driver) throws Exception;
}
