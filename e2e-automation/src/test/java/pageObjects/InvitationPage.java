package test.java.pageObjects;

import org.openqa.selenium.WebElement;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;

/**
 * The InvitationPage Interface is to hold webelement for Invitation Page  
 * 
 */
public interface InvitationPage {

	public WebElement connect_Button(AppiumDriver driver) throws Exception;
}
