package test.java.pageObjects;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;

import org.openqa.selenium.WebElement;

/**
 * The ConnectionHistoryPage Interface is to hold webelement for ConnectionHistory Page 
 * 
 */
public interface ConnectionHistoryPage {

	public  WebElement close_Button(AppiumDriver driver) throws Exception;
	public  WebElement received_Status(AppiumDriver driver) throws Exception;
	public  WebElement delete_Icon(AppiumDriver driver) throws Exception;
	public  WebElement delete_Button(AppiumDriver driver) throws Exception;
	public  WebElement shared_Button(AppiumDriver driver) throws Exception;
	public  WebElement atrribute_Text(AppiumDriver driver) throws Exception;
}
